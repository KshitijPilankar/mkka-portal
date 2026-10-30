import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import { getVerifiedDistrictSession } from "@/lib/auth/district-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawTarget = searchParams.get("url") || searchParams.get("path");

        if (!rawTarget) {
            return NextResponse.json(
                { error: "Missing document path or url parameter" },
                { status: 400 }
            );
        }

        // 1. Sanitize against Open Redirect (SEC-07: Allow only relative paths or whitelisted Supabase storage domains)
        if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
            try {
                const targetUrl = new URL(rawTarget);
                const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.toLowerCase()
                    : "";
                const currentHost = request.nextUrl.hostname.toLowerCase();

                // Only allow redirect if host strictly matches whitelisted Supabase Storage or Current Host
                if (
                    targetUrl.hostname.toLowerCase() !== supabaseHost &&
                    targetUrl.hostname.toLowerCase() !== currentHost &&
                    !targetUrl.hostname.toLowerCase().endsWith(".supabase.co")
                ) {
                    return NextResponse.json(
                        { error: "Invalid target URL. External redirects are prohibited. (SEC-07)" },
                        { status: 400 }
                    );
                }

                return NextResponse.redirect(rawTarget);
            } catch {
                return NextResponse.json({ error: "Malformed URL parameter" }, { status: 400 });
            }
        }

        // 2. Sensitive athlete document detection & authentication enforcement (SEC-08)
        const lowerPath = rawTarget.toLowerCase();
        const isSensitiveDoc =
            lowerPath.includes("aadhar") ||
            lowerPath.includes("dob_proof") ||
            lowerPath.includes("address_proof") ||
            lowerPath.includes("documents/players");

        if (isSensitiveDoc) {
            const isAdmin = await verifyAdminSession();
            const districtSession = await getVerifiedDistrictSession();

            if (!isAdmin && !districtSession) {
                return NextResponse.json(
                    {
                        error:
                            "गोपनीय खेळाडू कागदपत्रे पाहण्यासाठी अधिकृत प्रशासक किंवा जिल्हा लॉगिन आवश्यक आहे. (Unauthorized: Authentication required)",
                    },
                    { status: 401 }
                );
            }
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 3. Resolve bucket and relative path
        let targetBucket = "player-documents";
        let cleanPath = rawTarget.replace(/^\/+/, ""); // strip leading slashes

        if (cleanPath.startsWith("documents/")) {
            cleanPath = cleanPath.replace("documents/", "");
        } else if (cleanPath.startsWith("player-documents/")) {
            cleanPath = cleanPath.replace("player-documents/", "");
            targetBucket = "player-documents";
        }

        // 4. Strict Short TTL for Signed URLs: 300 seconds (5 minutes) (SEC-08)
        const SIGNED_URL_TTL = 300;

        let { data: signedData, error: signedError } = await supabase.storage
            .from(targetBucket)
            .createSignedUrl(cleanPath, SIGNED_URL_TTL);

        // Fallback search in secondary buckets
        if (signedError || !signedData?.signedUrl) {
            const fallbackBuckets = ["documents", "association-assets"];
            for (const b of fallbackBuckets) {
                const { data: fbData } = await supabase.storage
                    .from(b)
                    .createSignedUrl(cleanPath, SIGNED_URL_TTL);
                if (fbData?.signedUrl) {
                    signedData = fbData;
                    signedError = null;
                    break;
                }
            }
        }

        if (signedData?.signedUrl) {
            return NextResponse.redirect(signedData.signedUrl);
        }

        // For sensitive documents, DO NOT expose via public URL fallback
        if (isSensitiveDoc) {
            return NextResponse.json(
                { error: "कागदपत्र स्वाक्षरीकृत लिंक तयार करण्यात अयशस्वी." },
                { status: 404 }
            );
        }

        // Fallback for non-sensitive public assets (e.g. photos/banners)
        const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(cleanPath);
        return NextResponse.redirect(publicUrlData.publicUrl);
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to resolve document" },
            { status: 500 }
        );
    }
}

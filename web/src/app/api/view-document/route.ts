import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const hasAdminSession =
            cookieStore.get("mkka_admin_auth")?.value ||
            cookieStore.get("mkka_admin_session")?.value ||
            cookieStore.get("admin_session")?.value ||
            cookieStore.get("mkka_admin")?.value ||
            cookieStore.get("admin_auth")?.value ||
            request.cookies.get("mkka_admin_auth")?.value;

        const { searchParams } = new URL(request.url);
        const rawPath = searchParams.get("path");

        if (!rawPath) {
            return NextResponse.json({ error: "Missing document path" }, { status: 400 });
        }

        // अगर पहले से पूरा http URL है
        if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
            return NextResponse.redirect(rawPath);
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // बकेट का नाम और रिलेटिव पाथ अलग करना
        let targetBucket = "player-documents";
        let cleanPath = rawPath;

        if (cleanPath.startsWith("documents/")) {
            cleanPath = cleanPath.replace("documents/", "");
        } else if (cleanPath.startsWith("player-documents/")) {
            cleanPath = cleanPath.replace("player-documents/", "");
            targetBucket = "player-documents";
        }

        // सबसे पहले targetBucket से Signed URL की कोशिश करें
        let { data: signedData, error: signedError } = await supabase.storage
            .from(targetBucket)
            .createSignedUrl(cleanPath, 900); // 15 mins validity

        // अगर नहीं मिला, तो वैकल्पिक बकेट्स ('documents', 'association-assets') में ढूंढें
        if (signedError || !signedData?.signedUrl) {
            const fallbackBuckets = ["documents", "association-assets"];
            for (const b of fallbackBuckets) {
                const { data: fbData } = await supabase.storage.from(b).createSignedUrl(cleanPath, 900);
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

        // यदि Signed URL भी न बने तो पब्लिक URL फ़ॉलबैक
        const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(cleanPath);
        return NextResponse.redirect(publicUrlData.publicUrl);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to resolve document" }, { status: 500 });
    }
}

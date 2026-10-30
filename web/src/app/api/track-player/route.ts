import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Mask Aadhaar number to display only the last 4 digits (SEC-06)
 */
function maskAadhaar(val?: string | null): string {
    if (!val) return "";
    const clean = val.toString().replace(/\s|-/g, "");
    if (clean.length < 4) return "XXXXXXXXXXXX";
    return `XXXXXXXX${clean.slice(-4)}`;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawQuery = searchParams.get("query")?.trim();

        if (!rawQuery) {
            return NextResponse.json(
                { error: "कृपया शोध घेण्यासाठी क्रमांक प्रविष्ट करा." },
                { status: 400 }
            );
        }

        // Sanitize query to prevent PostgREST syntax injection (SEC-06)
        const sanitizedQuery = rawQuery.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim();
        if (!sanitizedQuery) {
            return NextResponse.json(
                { error: "कृपया योग्य शोध क्रमांक प्रविष्ट करा." },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. First attempt exact or prefix match by player_id_number
        let { data: player } = await supabase
            .from("players")
            .select("*")
            .ilike("player_id_number", sanitizedQuery)
            .maybeSingle();

        // 2. Second attempt by mobile number
        if (!player) {
            const { data: byMobile } = await supabase
                .from("players")
                .select("*")
                .eq("mobile_no", sanitizedQuery)
                .maybeSingle();
            if (byMobile) player = byMobile;
        }

        // 3. Third attempt by state_no
        if (!player) {
            const { data: byStateNo } = await supabase
                .from("players")
                .select("*")
                .ilike("state_no", sanitizedQuery)
                .maybeSingle();
            if (byStateNo) player = byStateNo;
        }

        // 4. Fallback search
        if (!player) {
            const { data: fallbackMatch } = await supabase
                .from("players")
                .select("*")
                .or(`player_id_number.ilike.%${sanitizedQuery}%,mobile_no.ilike.%${sanitizedQuery}%`)
                .limit(1)
                .maybeSingle();
            if (fallbackMatch) player = fallbackMatch;
        }

        if (!player) {
            return NextResponse.json(
                { error: "या माहितीशी जुळणारा कोणताही खेळाडू नोंदणी अर्ज आढळला नाही." },
                { status: 404 }
            );
        }

        // SEC-06: Mask Aadhaar and strip private storage document paths before public transmission
        const safePlayer = {
            ...player,
            aadhar_no: maskAadhaar(player.aadhar_no),
            dob_proof_path: undefined,
            address_proof_path: undefined,
        };

        return NextResponse.json({ player: safePlayer });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "खेळाडू शोधताना सर्व्हर त्रुटी आली." },
            { status: 500 }
        );
    }
}

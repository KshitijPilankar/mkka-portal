import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawQuery = searchParams.get("query")?.trim();

        if (!rawQuery) {
            return NextResponse.json({ error: "कृपया शोध घेण्यासाठी क्रमांक प्रविष्ट करा." }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // १. सर्वात आधी player_id_number ने थेट शोध (उदा. MKKA-2026-MUM-4055)
        let { data: player, error } = await supabase
            .from("players")
            .select("*")
            .ilike("player_id_number", rawQuery)
            .maybeSingle();

        // २. जर सापडला नाही, तर मोबाईल नंबरने शोध
        if (!player) {
            const { data: byMobile } = await supabase
                .from("players")
                .select("*")
                .eq("mobile_no", rawQuery)
                .maybeSingle();
            if (byMobile) player = byMobile;
        }

        // ३. जर तरीही सापडला नाही, तर state_no ने शोध
        if (!player) {
            const { data: byStateNo } = await supabase
                .from("players")
                .select("*")
                .ilike("state_no", rawQuery)
                .maybeSingle();
            if (byStateNo) player = byStateNo;
        }

        // ४. शेवटी आंशिक (partial) match चा प्रयत्न
        if (!player) {
            const { data: partialMatch } = await supabase
                .from("players")
                .select("*")
                .or(`player_id_number.ilike.%${rawQuery}%,mobile_no.ilike.%${rawQuery}%`)
                .limit(1)
                .maybeSingle();
            if (partialMatch) player = partialMatch;
        }

        if (!player) {
            return NextResponse.json(
                { error: "या माहितीशी जुळणारा कोणताही खेळाडू नोंदणी अर्ज आढळला नाही." },
                { status: 404 }
            );
        }

        return NextResponse.json({ player });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "खेळाडू शोधताना सर्व्हर त्रुटी आली." },
            { status: 500 }
        );
    }
}
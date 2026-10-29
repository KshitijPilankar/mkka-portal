import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query")?.trim();

        if (!query) {
            return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Search by tracking_id, state_no, or mobile_no
        const { data: player, error } = await supabase
            .from("players")
            .select("*")
            .or(`tracking_id.eq.${query},state_no.eq.${query},mobile_no.eq.${query}`)
            .limit(1)
            .maybeSingle();

        if (error || !player) {
            return NextResponse.json(
                { error: "या माहितीशी जुळणारा कोणताही खेळाडू आढळला नाही." },
                { status: 404 }
            );
        }

        return NextResponse.json({ player });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to search player" },
            { status: 500 }
        );
    }
}
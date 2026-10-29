import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import SquadSelectionClient from "./SquadSelectionClient";

export const dynamic = "force-dynamic";

export default async function SquadSelectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mkka_district_session");

    if (!sessionCookie?.value) {
        redirect("/district/login");
    }

    let session: any = null;
    try {
        session = JSON.parse(sessionCookie.value);
    } catch {
        redirect("/district/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [tournamentRes, playersRes, existingEntryRes] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", id).maybeSingle(),
        supabase
            .from("players")
            .select("*")
            .eq("playing_district_id", session.districtId)
            .eq("status", "APPROVED")
            .order("first_name", { ascending: true }),
        supabase
            .from("tournament_entries")
            .select("*")
            .eq("tournament_id", id)
            .eq("district_id", session.districtId)
            .maybeSingle(),
    ]);

    const tournament = tournamentRes.data || {
        id,
        title: "महाराष्ट्र राज्य अजिंक्यपद निवड चाचणी खो-खो स्पर्धा २०२६-२७",
        venue: "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे",
    };

    const players = playersRes.data || [];
    const existingEntry = existingEntryRes.data || null;

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <SquadSelectionClient
                    tournament={tournament}
                    session={session}
                    availablePlayers={players}
                    existingEntry={existingEntry}
                />
            </div>
        </div>
    );
}
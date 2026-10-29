import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DistrictCertificatesClient from "./DistrictCertificatesClient";

export const dynamic = "force-dynamic";

export default async function DistrictCertificatesPage() {
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

    // १. या जिल्ह्याने सबमिट केलेल्या नोंदी आणा
    const { data: entries } = await supabase
        .from("tournament_entries")
        .select("*")
        .eq("district_id", session.districtId)
        .order("submitted_at", { ascending: false });

    // २. स्पर्धेचे आणि सर्व खेळाडूंचे तपशील मिळवणे
    const submittedTournaments: any[] = [];

    if (entries && entries.length > 0) {
        for (const entry of entries) {
            const { data: tournament } = await supabase
                .from("tournaments")
                .select("*")
                .eq("id", entry.tournament_id)
                .maybeSingle();

            const playerIds = entry.player_ids || [];
            let players: any[] = [];

            if (playerIds.length > 0) {
                const { data: playersData } = await supabase
                    .from("players")
                    .select("id, first_name, middle_name, surname, dob, gender, state_no, federation_no, mobile_no")
                    .in("id", playerIds);
                players = playersData || [];
            }

            submittedTournaments.push({
                id: entry.tournament_id,
                title: tournament?.title || tournament?.name || "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा",
                venue: tournament?.venue || "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे",
                start_date: tournament?.start_date || "15 Nov 2026",
                end_date: tournament?.end_date || "18 Nov 2026",
                age_group: tournament?.age_group || "वरिष्ठ गट",
                coach_name: entry.coach_name,
                coach_mobile: entry.coach_mobile,
                manager_name: entry.manager_name,
                manager_mobile: entry.manager_mobile,
                submitted_at: entry.submitted_at,
                players: players,
            });
        }
    }

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <DistrictCertificatesClient
                    session={session}
                    submittedTournaments={submittedTournaments}
                />
            </div>
        </div>
    );
}
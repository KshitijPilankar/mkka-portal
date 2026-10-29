import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AssociationSquadReviewClient from "./AssociationSquadReviewClient";

export const dynamic = "force-dynamic";

export default async function AssociationTournamentSquadReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const cookieStore = await cookies();
    const hasAdminSession =
        cookieStore.get("mkka_admin_auth")?.value ||
        cookieStore.get("mkka_admin_session")?.value ||
        cookieStore.get("admin_session")?.value ||
        cookieStore.get("mkka_admin")?.value ||
        cookieStore.get("admin_auth")?.value;

    if (!hasAdminSession) {
        redirect("/association/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // १. स्पर्धेची माहिती आणणे
    const { data: tournamentData } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    const tournament = {
        id,
        title: tournamentData?.name_mr || tournamentData?.title || "५९ वी वरिष्ठ गट राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७",
        venue: tournamentData?.venue || "छत्रपती शिवाजी महाराज स्टेडियम, ठाणे",
        category: tournamentData?.category || "SENIOR",
        start_date: tournamentData?.start_date,
        end_date: tournamentData?.end_date,
    };

    // २. या स्पर्धेत सर्व जिल्ह्यांनी दाखल केलेले संघ आणणे
    const [entriesRes, districtsRes] = await Promise.all([
        supabase
            .from("tournament_entries")
            .select("*")
            .eq("tournament_id", id),
        supabase
            .from("districts")
            .select("id, name_en, name_mr, code, contact_person, mobile"),
    ]);

    const entries = entriesRes.data || [];
    const districts = districtsRes.data || [];
    const districtMap = new Map(districts.map((d: any) => [d.id, d]));

    // ३. सर्व सबमिट झालेल्या खेळाडूंचे आयडी गोळा करणे
    const allPlayerIds = Array.from(
        new Set(entries.flatMap((e: any) => e.player_ids || []))
    );

    let playersMap = new Map<string, any>();
    if (allPlayerIds.length > 0) {
        const { data: playersData } = await supabase
            .from("players")
            .select("id, first_name, middle_name, surname, dob, gender, state_no, federation_no, mobile_no, photo_path")
            .in("id", allPlayerIds);

        if (playersData) {
            playersMap = new Map(playersData.map((p: any) => [p.id, p]));
        }
    }

    // ४. जिल्हा संघ फॉरमॅट तयार करणे
    const formattedEntries = entries.map((entry: any) => {
        const dist = districtMap.get(entry.district_id);
        const resolvedPlayers = (entry.player_ids || [])
            .map((pId: string) => playersMap.get(pId))
            .filter(Boolean);

        return {
            districtId: entry.district_id,
            districtNameMr: dist?.name_mr || "अज्ञात जिल्हा",
            districtNameEn: dist?.name_en || "District",
            districtCode: dist?.code || "DIST",
            coachName: entry.coach_name || "N/A",
            coachMobile: entry.coach_mobile || "N/A",
            managerName: entry.manager_name || null,
            managerMobile: entry.manager_mobile || null,
            submittedAt: entry.submitted_at || entry.updated_at,
            status: entry.status || "SUBMITTED",
            players: resolvedPlayers,
        };
    });

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <AssociationSquadReviewClient
                    tournament={tournament}
                    entries={formattedEntries}
                />
            </div>
        </div>
    );
}

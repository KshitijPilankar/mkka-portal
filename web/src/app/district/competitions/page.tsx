import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CompetitionsListClient from "./CompetitionsListClient";

export const dynamic = "force-dynamic";

export default async function DistrictCompetitionsPage() {
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

    // Fetch active tournaments
    const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

    // Check submissions by this district
    const { data: entries } = await supabase
        .from("tournament_entries")
        .select("tournament_id")
        .eq("district_id", session.districtId);

    const submittedSet = new Set((entries || []).map((e: any) => e.tournament_id));

    const tournamentsWithStatus = (tournaments || []).map((t: any) => ({
        ...t,
        is_submitted: submittedSet.has(t.id),
    }));

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <CompetitionsListClient
                    districtName={session.name_mr}
                    districtCode={session.code}
                    tournaments={tournamentsWithStatus}
                />
            </div>
        </div>
    );
}
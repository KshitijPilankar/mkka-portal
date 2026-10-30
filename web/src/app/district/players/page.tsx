import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedDistrictSession } from "@/lib/auth/district-session";
import DistrictPlayersClient from "./DistrictPlayersClient";

export const dynamic = "force-dynamic";

export default async function DistrictPlayersPage() {
    const session = await getVerifiedDistrictSession();

    if (!session || !session.districtId) {
        redirect("/district/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Tenant Isolation: Fetch ONLY this verified district's registered players
    const { data: players } = await supabase
        .from("players")
        .select("*")
        .eq("playing_district_id", session.districtId)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <DistrictPlayersClient session={session} initialPlayers={players || []} />
            </div>
        </div>
    );
}

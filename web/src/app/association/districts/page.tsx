import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DistrictsManagerClient from "./DistrictsManagerClient";

export const dynamic = "force-dynamic";

export default async function AssociationDistrictsPage() {
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

    const [districtsRes, playersRes] = await Promise.all([
        supabase.from("districts").select("*").order("name_mr", { ascending: true }),
        supabase.from("players").select("playing_district_id"),
    ]);

    const districts = districtsRes.data || [];
    const players = playersRes.data || [];

    // Count players per district
    const countMap = new Map<string, number>();
    players.forEach((p: any) => {
        if (p.playing_district_id) {
            countMap.set(p.playing_district_id, (countMap.get(p.playing_district_id) || 0) + 1);
        }
    });

    const districtsWithCounts = districts.map((d: any) => ({
        ...d,
        player_count: countMap.get(d.id) || 0,
    }));

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <DistrictsManagerClient initialDistricts={districtsWithCounts} />
            </div>
        </div>
    );
}

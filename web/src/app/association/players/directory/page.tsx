import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PlayersDirectoryClient from "./PlayersDirectoryClient";

export const dynamic = "force-dynamic";

export default async function PlayersDirectoryPage() {
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

    const [playersRes, districtsRes] = await Promise.all([
        supabase
            .from("players")
            .select("*")
            .order("created_at", { ascending: false }),
        supabase
            .from("districts")
            .select("id, name_en, name_mr, code")
            .order("name_mr", { ascending: true }),
    ]);

    const players = playersRes.data || [];
    const districts = districtsRes.data || [];

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <PlayersDirectoryClient initialPlayers={players} districts={districts} />
            </div>
        </div>
    );
}

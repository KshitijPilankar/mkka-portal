import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import DownloadPlayersClient from "./DownloadPlayersClient";

export const dynamic = "force-dynamic";

export default async function DownloadPlayersPage() {
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get("mkka_admin_auth")?.value;

    if (adminAuthCookie !== "authenticated_mkka_admin_2026") {
        redirect("/association/login");
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );

    const [districtsRes, countRes] = await Promise.all([
        supabase.from("districts").select("id, name_en, name_mr, code").order("name_mr", { ascending: true }),
        supabase.from("players").select("id", { count: "exact", head: true }),
    ]);

    const districts = districtsRes.data || [];
    const totalPlayersCount = countRes.count || 0;

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <DownloadPlayersClient districts={districts} totalPlayersCount={totalPlayersCount} />
            </div>
        </div>
    );
}

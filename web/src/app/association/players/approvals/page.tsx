import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ApprovalClient from "./ApprovalClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "खेळाडू अर्ज छाननी व मंजुरी | MKKA Admin",
    description: "Maharashtra Kho-Kho Association Player Scrutiny & Approval Portal",
};

export default async function PlayerApprovalsPage() {
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

    // 1. Fetch pending players & 36 districts in parallel to prevent fragile PostgREST foreign key crashes
    const [playersRes, districtsRes] = await Promise.all([
        supabase
            .from("players")
            .select("*")
            .order("created_at", { ascending: false }),
        supabase.from("districts").select("id, name_mr, name_en, code"),
    ]);

    const allPlayers = playersRes.data || [];
    const districts = districtsRes.data || [];
    const districtMap = new Map(districts.map((d: any) => [d.id, d]));

    // Filter players whose status is not APPROVED and not REJECTED (catches PENDING, PENDING_SCRUTINY, null)
    const pendingPlayers = allPlayers
        .filter((p: any) => p.status !== "APPROVED" && p.status !== "REJECTED")
        .map((p: any) => ({
            ...p,
            playing_district: districtMap.get(p.playing_district_id) || null,
        }));

    return (
        <div className="min-h-screen bg-[#FDF8FD] p-6 md:p-10">
            <ApprovalClient initialPlayers={pendingPlayers} districts={districts} />
        </div>
    );
}

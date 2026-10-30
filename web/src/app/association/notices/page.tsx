import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import NoticeBoardClient from "./NoticeBoardClient";

export const dynamic = "force-dynamic";

export default async function NoticeBoardPage() {
    const hasAdminSession = await verifyAdminSession();

    if (!hasAdminSession) {
        redirect("/association/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: notices, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <NoticeBoardClient initialNotices={notices || []} />
            </div>
        </div>
    );
}

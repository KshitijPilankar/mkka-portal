import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DistrictLoginClient from "./DistrictLoginClient";

export const dynamic = "force-dynamic";

export default async function DistrictLoginPage() {
    const cookieStore = await cookies();
    const districtSession = cookieStore.get("mkka_district_session");

    if (districtSession?.value) {
        redirect("/district/dashboard");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: districts } = await supabase
        .from("districts")
        .select("id, code, name_en, name_mr, username")
        .order("name_mr", { ascending: true });

    return <DistrictLoginClient districts={districts || []} />;
}
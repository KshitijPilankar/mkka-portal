import React from "react";
import { createClient } from "@supabase/supabase-js";
import TrackCardClient from "./TrackCardClient";

export const dynamic = "force-dynamic";

export default async function TrackCardPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: districts } = await supabase
        .from("districts")
        .select("id, name_mr, name_en, code")
        .order("name_mr", { ascending: true });

    return <TrackCardClient districts={districts || []} />;
}
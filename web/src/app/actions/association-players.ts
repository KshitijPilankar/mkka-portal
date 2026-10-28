"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const session =
        cookieStore.get("mkka_admin_session")?.value ||
        cookieStore.get("admin_session")?.value ||
        cookieStore.get("mkka_admin")?.value ||
        cookieStore.get("admin_auth")?.value;

    return !!session;
}

export async function updateFederationNoAction(playerId: string, federationNo: string) {
    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return { success: false, error: "अनधिकृत प्रवेश. कृपया पुन्हा लॉगिन करा. (Unauthorized)" };
        }

        if (!playerId) {
            return { success: false, error: "खेळाडू आयडी आवश्यक आहे. (Player ID is required)" };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const cleanFedNo = federationNo.trim();

        const { error } = await supabase
            .from("players")
            .update({
                federation_no: cleanFedNo === "" ? null : cleanFedNo,
                updated_at: new Date().toISOString(),
            })
            .eq("id", playerId);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/association/players/directory");
        revalidatePath("/association/dashboard");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to update Federation No." };
    }
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedDistrictSession } from "@/lib/auth/district-session";

export async function submitDistrictSquadAction(formData: FormData) {
    try {
        const session = await getVerifiedDistrictSession();
        if (!session) {
            return { success: false, error: "कृपया जिल्हा लॉगिन पुन्हा करा. (Unauthorized)" };
        }

        const tournamentId = formData.get("tournament_id") as string;
        const coachName = (formData.get("coach_name") as string)?.trim();
        const coachMobile = (formData.get("coach_mobile") as string)?.trim();
        const managerName = (formData.get("manager_name") as string)?.trim();
        const managerMobile = (formData.get("manager_mobile") as string)?.trim();
        const rawPlayerIds = formData.get("player_ids") as string;
        const selectedPlayerIds = JSON.parse(rawPlayerIds || "[]");

        if (!tournamentId) {
            return { success: false, error: "स्पर्धा निवडणे अनिवार्य आहे." };
        }

        if (selectedPlayerIds.length < 12 || selectedPlayerIds.length > 15) {
            return {
                success: false,
                error: `अधिकृत नियमानुसार संघात किमान १२ व जास्तीत जास्त १५ खेळाडू असणे अनिवार्य आहे. (सध्या निवड: ${selectedPlayerIds.length})`,
            };
        }

        if (!coachName || !coachMobile) {
            return { success: false, error: "प्रशिक्षकांचे नाव आणि मोबाईल क्रमांक आवश्यक आहे." };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const payload = {
            tournament_id: tournamentId,
            district_id: session.districtId,
            coach_name: coachName,
            coach_mobile: coachMobile,
            manager_name: managerName || null,
            manager_mobile: managerMobile || null,
            player_ids: selectedPlayerIds,
            status: "SUBMITTED",
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from("tournament_entries")
            .upsert(payload, { onConflict: "tournament_id,district_id" });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath(`/district/competitions`);
        revalidatePath(`/district/competitions/${tournamentId}`);
        revalidatePath(`/district/dashboard`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "संघ सबमिट करताना त्रुटी आली." };
    }
}

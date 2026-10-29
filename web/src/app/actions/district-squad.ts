"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

async function getDistrictSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mkka_district_session");
    if (!sessionCookie?.value) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

export async function submitDistrictSquadAction(formData: FormData) {
    try {
        const session = await getDistrictSession();
        if (!session) {
            return { success: false, error: "कृपया जिल्हा लॉगिन पुन्हा करा. (Unauthorized)" };
        }

        const tournamentId = formData.get("tournament_id") as string;
        const coachName = (formData.get("coach_name") as string)?.trim();
        const coachMobile = (formData.get("coach_mobile") as string)?.trim();
        const managerName = (formData.get("manager_name") as string)?.trim();
        const managerMobile = (formData.get("manager_mobile") as string)?.trim();
        const selectedPlayerIds = JSON.parse((formData.get("player_ids") as string) || "[]");

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

        // Save squad into tournament_entries or squads table
        const { error: upsertError } = await supabase.from("tournament_entries").upsert(
            {
                tournament_id: tournamentId,
                district_id: session.districtId,
                coach_name: coachName,
                coach_mobile: coachMobile,
                manager_name: managerName || null,
                manager_mobile: managerMobile || null,
                player_ids: selectedPlayerIds,
                submitted_at: new Date().toISOString(),
                status: "SUBMITTED",
            },
            { onConflict: "tournament_id,district_id" }
        );

        if (upsertError) {
            // Fallback: If table name differs or column is json
            const { error: altError } = await supabase.from("squads").upsert(
                {
                    tournament_id: tournamentId,
                    district_id: session.districtId,
                    coach_name: coachName,
                    coach_mobile: coachMobile,
                    manager_name: managerName || null,
                    manager_mobile: managerMobile || null,
                    player_ids: selectedPlayerIds,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "tournament_id,district_id" }
            );

            if (altError) {
                return { success: false, error: upsertError.message };
            }
        }

        revalidatePath(`/district/competitions`);
        revalidatePath(`/district/competitions/${tournamentId}`);
        revalidatePath(`/district/dashboard`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "संघ सबमिट करताना त्रुटी आली." };
    }
}
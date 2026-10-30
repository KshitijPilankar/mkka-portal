"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getVerifiedDistrictSession } from "@/lib/auth/district-session";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import { submitDistrictSquadAction as originalSubmitDistrictSquadAction } from "./squad-actions";

export async function submitDistrictSquadAction(payload: {
    tournamentId: string;
    playerIds: string[];
    coachName: string;
    coachMobile: string;
    managerName?: string;
    managerMobile?: string;
}) {
    // 1. Session verification (Admin or District)
    const isAdmin = await verifyAdminSession();
    const districtSession = await getVerifiedDistrictSession();

    if (!isAdmin && !districtSession) {
        return {
            success: false,
            error: "अनधिकृत प्रवेश! संघ सबमिट करण्यासाठी कृपया जिल्हा लॉगिन करा. (Unauthorized)",
        };
    }

    // 2. Multi-Tenant validation: Validate requesting session matches the target district_id (SEC-05)
    if (!isAdmin && districtSession) {
        const supabase = await createServerSupabase();
        const { data: dbPlayers, error } = await supabase
            .from("players")
            .select("id, playing_district_id")
            .in("id", payload.playerIds);

        if (error || !dbPlayers || dbPlayers.length === 0) {
            return {
                success: false,
                error: "निवडलेल्या खेळाडूंची पडताळणी अयशस्वी झाली.",
            };
        }

        const mismatchedPlayer = dbPlayers.find(
            (p) => p.playing_district_id !== districtSession.districtId
        );

        if (mismatchedPlayer) {
            return {
                success: false,
                error: "सुरक्षा त्रुटी: तुम्ही फक्त तुमच्याच अधिकृत जिल्ह्याचे खेळाडू संघात निवडू शकता. (Unauthorized District)",
            };
        }
    }

    return await originalSubmitDistrictSquadAction(payload);
}

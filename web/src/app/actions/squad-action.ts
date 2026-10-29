"use server";

import { submitDistrictSquadAction as originalSubmitDistrictSquadAction } from "./squad-actions";

export async function submitDistrictSquadAction(payload: {
    tournamentId: string;
    playerIds: string[];
    coachName: string;
    coachMobile: string;
    managerName?: string;
    managerMobile?: string;
}) {
    return await originalSubmitDistrictSquadAction(payload);
}


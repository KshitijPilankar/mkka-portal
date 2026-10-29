"use server";

import {
    getTournamentsAction as _getTournamentsAction,
    saveTournamentAwardsAction as _saveTournamentAwardsAction,
    createTournamentAction as _createTournamentAction,
    deleteTournamentAction as _deleteTournamentAction,
} from "./tournament-actions";

export async function getTournamentsAction() {
    return await _getTournamentsAction();
}

export async function saveTournamentAwardsAction(payload: any) {
    return await _saveTournamentAwardsAction(payload);
}

export async function createTournamentAction(input: any) {
    return await _createTournamentAction(input);
}

export async function deleteTournamentAction(payload: {
    tournamentId: string;
    adminPin: string;
    confirmName: string;
    expectedName: string;
}) {
    return await _deleteTournamentAction(payload);
}

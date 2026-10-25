'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// १. स्पर्धेचा संपूर्ण आढावा, दाखल झालेले संघ व पुरस्कार माहिती आणणे
export async function getTournamentOverviewAction(tournamentId: string) {
    try {
        const supabase = await createServerSupabase();

        // A. स्पर्धेची माहिती आणि वैयक्तिक पुरस्कार रकाने
        const { data: tournament, error: tournamentError } = await supabase
            .from('tournaments')
            .select(`
        id,
        name_mr,
        name_en,
        category,
        start_date,
        end_date,
        venue_ground,
        champion_district_id,
        runner_up_district_id,
        best_player_name,
        best_player_district,
        best_attacker_name,
        best_attacker_district,
        best_defender_name,
        best_defender_district,
        venue_district:districts!tournaments_venue_district_id_fkey (
          id,
          name_mr,
          code
        )
      `)
            .eq('id', tournamentId)
            .single();

        if (tournamentError) {
            throw new Error(tournamentError.message);
        }

        // B. स्पर्धेत दाखल झालेले सर्व जिल्हा संघ आणि त्यांचे १२ खेळाडू
        const { data: squads, error: squadsError } = await supabase
            .from('tournament_squads')
            .select(`
        id,
        tournament_id,
        district_id,
        coach_name,
        manager_name,
        created_at,
        district:districts (
          id,
          name_mr,
          name_en,
          code
        ),
        tournament_squad_players (
          id,
          jersey_no,
          role,
          player:players (
            id,
            first_name,
            middle_name,
            surname,
            player_id_number,
            photo_path
          )
        )
      `)
            .eq('tournament_id', tournamentId)
            .order('created_at', { ascending: true });

        if (squadsError) {
            throw new Error(squadsError.message);
        }

        return {
            success: true,
            tournament,
            squads: squads || [],
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Tournament overview fetch failed',
            tournament: null,
            squads: [],
        };
    }
}

// २. विशिष्ट जिल्ह्याचा स्क्वाड व खेळाडू आणणे
export async function getDistrictSquadAction(tournamentId: string, districtId: string) {
    try {
        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('tournament_squads')
            .select(`
        id,
        tournament_id,
        district_id,
        coach_name,
        manager_name,
        tournament_squad_players (
          id,
          jersey_no,
          role,
          player_id,
          player:players (
            id,
            first_name,
            middle_name,
            surname,
            player_id_number,
            dob,
            photo_path
          )
        )
      `)
            .eq('tournament_id', tournamentId)
            .eq('district_id', districtId)
            .maybeSingle();

        if (error) throw new Error(error.message);

        return { success: true, squad: data || null };
    } catch (err: any) {
        return { success: false, error: err.message, squad: null };
    }
}

// ३. नवीन जिल्हा संघ (Squad) व १२ खेळाडूंची यादी नोंदवणे / अपडेट करणे
export async function submitTournamentSquadAction(payload: {
    tournamentId: string;
    districtId: string;
    coachName: string;
    managerName: string;
    players: Array<{
        playerId: string;
        jerseyNo: number;
        role: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER';
    }>;
}) {
    try {
        const supabase = await createServerSupabase();

        // A. tournament_squads मध्ये नोंद करा किंवा अपडेट करा
        const { data: squadData, error: squadErr } = await supabase
            .from('tournament_squads')
            .upsert(
                {
                    tournament_id: payload.tournamentId,
                    district_id: payload.districtId,
                    coach_name: payload.coachName,
                    manager_name: payload.managerName,
                },
                { onConflict: 'tournament_id, district_id' }
            )
            .select('id')
            .single();

        if (squadErr) throw new Error(squadErr.message);

        const squadId = squadData.id;

        // B. जुने खेळाडू रिप्लेस करण्यासाठी हटवा
        await supabase
            .from('tournament_squad_players')
            .delete()
            .eq('squad_id', squadId);

        // C. नवीन १२ खेळाडूंची जोडणी करा
        if (payload.players && payload.players.length > 0) {
            const playersToInsert = payload.players.map((p) => ({
                squad_id: squadId,
                player_id: p.playerId,
                jersey_no: p.jerseyNo,
                role: p.role,
            }));

            const { error: playersErr } = await supabase
                .from('tournament_squad_players')
                .insert(playersToInsert);

            if (playersErr) throw new Error(playersErr.message);
        }

        revalidatePath(`/tournaments/${payload.tournamentId}`);
        revalidatePath(`/tournaments/${payload.tournamentId}/squad-entry`);
        return { success: true, squadId };
    } catch (err: any) {
        return { success: false, error: err.message || 'Squad submission failed' };
    }
}
// ४. विशिष्ट जिल्ह्यातील पात्र (Approved & Age Eligible) खेळाडूंची यादी आणणे
export async function getEligibleDistrictPlayersAction(
    districtId: string,
    tournamentCategory: string,
    tournamentId: string
) {
    try {
        const supabase = await createServerSupabase();

        // A. जिल्ह्याचे सर्व मान्यताप्राप्त (APPROVED) खेळाडू आणा
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('id, first_name, middle_name, surname, dob, gender, player_id_number, photo_path, status')
            .eq('playing_district_id', districtId)
            .eq('status', 'APPROVED')
            .order('first_name', { ascending: true });

        if (playersError) throw new Error(playersError.message);

        // B. वयाची पात्रता तपासणी (DOB Cutoff Logic)
        const currentYear = new Date().getFullYear();
        const eligiblePlayers = (players || []).map((p) => {
            const birthYear = p.dob ? new Date(p.dob).getFullYear() : 2000;
            const age = currentYear - birthYear;

            let isEligible = true;
            let eligibilityNote = 'पात्र (Eligible)';

            if (tournamentCategory === 'SUB_JUNIOR' && age > 14) {
                isEligible = false;
                eligibilityNote = 'वयाधिक (वय १४ पेक्षा जास्त)';
            } else if (tournamentCategory === 'JUNIOR' && age > 18) {
                isEligible = false;
                eligibilityNote = 'वयाधिक (वय १८ पेक्षा जास्त)';
            }

            return {
                ...p,
                age,
                isEligible,
                eligibilityNote,
            };
        });

        // C. जर या स्पर्धेसाठी पथक आधीच भरले असेल तर ते खेळाडू आणा
        const { data: existingSquad } = await supabase
            .from('tournament_squads')
            .select(`
        id,
        coach_name,
        manager_name,
        tournament_squad_players (
          player_id,
          jersey_no,
          role
        )
      `)
            .eq('tournament_id', tournamentId)
            .eq('district_id', districtId)
            .maybeSingle();

        return {
            success: true,
            players: eligiblePlayers,
            existingSquad: existingSquad || null,
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Eligible players fetch failed', players: [] };
    }
}
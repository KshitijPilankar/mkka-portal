'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/auth/admin-session';

// 1. Tournament ke sabhi matches fetch karna
export async function getTournamentMatchesAction(tournamentId: string) {
    try {
        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('tournament_matches')
            .select(`
        id,
        match_number,
        round_type,
        pool,
        court_number,
        scheduled_time,
        team_a_score,
        team_b_score,
        status,
        team_a:districts!tournament_matches_team_a_district_id_fkey (name_mr, name_en, code),
        team_b:districts!tournament_matches_team_b_district_id_fkey (name_mr, name_en, code),
        winner:districts!tournament_matches_winner_district_id_fkey (name_mr, code)
      `)
            .eq('tournament_id', tournamentId)
            .order('match_number', { ascending: true });

        if (error) throw new Error(error.message);
        return { success: true, matches: data || [] };
    } catch (err: any) {
        return { success: false, error: err.message || 'Matches fetch failed', matches: [] };
    }
}

// 2. Naya match schedule karna (SEC-09: Requires authenticated session)
export async function createMatchFixtureAction(payload: {
    tournamentId: string;
    matchNumber: number;
    roundType: string;
    pool: string;
    teamADistrictId: string;
    teamBDistrictId: string;
    courtNumber: string;
    scheduledTime: string;
}) {
    try {
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! सामना तयार करण्यासाठी प्रशासक किंवा सामनाधिकारी लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('tournament_matches')
            .insert({
                tournament_id: payload.tournamentId,
                match_number: payload.matchNumber,
                round_type: payload.roundType,
                pool: payload.pool,
                team_a_district_id: payload.teamADistrictId,
                team_b_district_id: payload.teamBDistrictId,
                court_number: payload.courtNumber,
                scheduled_time: payload.scheduledTime,
                status: 'SCHEDULED',
            })
            .select('id')
            .single();

        if (error) throw new Error(error.message);

        revalidatePath(`/tournaments/${payload.tournamentId}`);
        return { success: true, matchId: data.id };
    } catch (err: any) {
        return { success: false, error: err.message || 'Match creation failed' };
    }
}

// 3. Match details fetch karna
export async function getMatchDetailsAction(matchId: string) {
    try {
        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('tournament_matches')
            .select(`
        id,
        tournament_id,
        match_number,
        round_type,
        pool,
        court_number,
        scheduled_time,
        team_a_score,
        team_b_score,
        status,
        winner_district_id,
        tournament:tournaments (
          name_mr,
          name_en,
          category
        ),
        team_a:districts!tournament_matches_team_a_district_id_fkey (id, name_mr, name_en, code),
        team_b:districts!tournament_matches_team_b_district_id_fkey (id, name_mr, name_en, code),
        winner:districts!tournament_matches_winner_district_id_fkey (id, name_mr, code)
      `)
            .eq('id', matchId)
            .single();

        if (error) throw new Error(error.message);
        return { success: true, match: data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Match fetch failed', match: null };
    }
}

// 4. Match Score update karna + Audit Log insert karna (SEC-09: Requires authenticated session)
export async function updateMatchScoreAction(payload: {
    matchId: string;
    tournamentId: string;
    teamAScore: number;
    teamBScore: number;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
    winnerDistrictId?: string | null;
    note?: string;
}) {
    try {
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! गुण नोंदवण्यासाठी प्रशासक किंवा सामनाधिकारी लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        const supabase = await createServerSupabase();

        // A. Match table update karein
        const { error: matchError } = await supabase
            .from('tournament_matches')
            .update({
                team_a_score: payload.teamAScore,
                team_b_score: payload.teamBScore,
                status: payload.status,
                winner_district_id: payload.winnerDistrictId || null,
            })
            .eq('id', payload.matchId);

        if (matchError) throw new Error(matchError.message);

        // B. Call Log / Audit History mein entry dalein
        await supabase.from('match_score_logs').insert({
            match_id: payload.matchId,
            team_a_score: payload.teamAScore,
            team_b_score: payload.teamBScore,
            status: payload.status,
            winner_district_id: payload.winnerDistrictId || null,
            note: payload.note || (payload.status === 'COMPLETED' ? 'अंतिम निकाल घोषित / बदल' : 'गुण नोंदणी बदल'),
        });

        revalidatePath(`/tournaments/${payload.tournamentId}`);
        revalidatePath(`/tournaments/${payload.tournamentId}/matches/${payload.matchId}`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Score update failed' };
    }
}

// 5. Match ke sabhi revision/audit logs fetch karna
export async function getMatchScoreLogsAction(matchId: string) {
    try {
        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('match_score_logs')
            .select(`
        id,
        team_a_score,
        team_b_score,
        status,
        note,
        created_at,
        winner:districts!match_score_logs_winner_district_id_fkey (name_mr, code)
      `)
            .eq('match_id', matchId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return { success: true, logs: data || [] };
    } catch (err: any) {
        return { success: false, logs: [] };
    }
}

// 6. Scoresheet data fetch karna
export async function getMatchScoresheetDetailsAction(matchId: string) {
    try {
        const supabase = await createServerSupabase();

        const { data: match, error: matchErr } = await supabase
            .from('tournament_matches')
            .select(`
        id,
        tournament_id,
        match_number,
        round_type,
        pool,
        court_number,
        scheduled_time,
        team_a_score,
        team_b_score,
        status,
        team_a_district_id,
        team_b_district_id,
        winner_district_id,
        tournament:tournaments (
          name_mr,
          name_en,
          category,
          venue_ground
        ),
        team_a:districts!tournament_matches_team_a_district_id_fkey (id, name_mr, name_en, code),
        team_b:districts!tournament_matches_team_b_district_id_fkey (id, name_mr, name_en, code),
        winner:districts!tournament_matches_winner_district_id_fkey (id, name_mr, code)
      `)
            .eq('id', matchId)
            .maybeSingle();

        if (matchErr || !match) {
            throw new Error(matchErr?.message || 'Match not found');
        }

        const [teamASquadRes, teamBSquadRes] = await Promise.all([
            supabase
                .from('tournament_squads')
                .select(`
          coach_name,
          manager_name,
          tournament_squad_players (
            jersey_no,
            role,
            player:players (first_name, surname, player_id_number)
          )
        `)
                .eq('tournament_id', match.tournament_id)
                .eq('district_id', match.team_a_district_id)
                .maybeSingle(),
            supabase
                .from('tournament_squads')
                .select(`
          coach_name,
          manager_name,
          tournament_squad_players (
            jersey_no,
            role,
            player:players (first_name, surname, player_id_number)
          )
        `)
                .eq('tournament_id', match.tournament_id)
                .eq('district_id', match.team_b_district_id)
                .maybeSingle(),
        ]);

        return {
            success: true,
            match,
            teamASquad: teamASquadRes.data || null,
            teamBSquad: teamBSquadRes.data || null,
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Scoresheet fetch failed' };
    }
}

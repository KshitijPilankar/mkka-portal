'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export interface TeamStanding {
    districtId: string;
    districtNameMr: string;
    districtCode: string;
    pool: string;
    played: number;
    won: number;
    lost: number;
    scoreFor: number;
    scoreAgainst: number;
    scoreDiff: number;
    points: number;
}

export async function getTournamentPoolStandingsAction(tournamentId: string) {
    try {
        const supabase = await createServerSupabase();

        // १. स्पर्धेसाठी दाखल झालेले सर्व संघ आणि पूर्ण झालेले सामने आणा
        const [squadsRes, matchesRes] = await Promise.all([
            supabase
                .from('tournament_squads')
                .select(`
          district_id,
          district:districts (id, name_mr, code)
        `)
                .eq('tournament_id', tournamentId),
            supabase
                .from('tournament_matches')
                .select(`
          pool,
          team_a_district_id,
          team_b_district_id,
          team_a_score,
          team_b_score,
          winner_district_id,
          status
        `)
                .eq('tournament_id', tournamentId)
                .eq('status', 'COMPLETED'),
        ]);

        const squads = squadsRes.data || [];
        const completedMatches = matchesRes.data || [];

        // २. प्रत्येक जिल्ह्यासाठी स्टॅटिस्टिक्स तयार करा
        const standingsMap: Record<string, TeamStanding> = {};

        squads.forEach((sq: any) => {
            const d = sq.district;
            standingsMap[d.id] = {
                districtId: d.id,
                districtNameMr: d.name_mr,
                districtCode: d.code,
                pool: 'Pool A',
                played: 0,
                won: 0,
                lost: 0,
                scoreFor: 0,
                scoreAgainst: 0,
                scoreDiff: 0,
                points: 0,
            };
        });

        // ३. पूर्ण झालेल्या सामन्यांवरून गुणांची गणना करा
        completedMatches.forEach((m: any) => {
            const teamA = standingsMap[m.team_a_district_id];
            const teamB = standingsMap[m.team_b_district_id];

            if (teamA) {
                teamA.played += 1;
                teamA.scoreFor += m.team_a_score || 0;
                teamA.scoreAgainst += m.team_b_score || 0;
                teamA.pool = m.pool || 'Pool A';
                if (m.winner_district_id === m.team_a_district_id) {
                    teamA.won += 1;
                    teamA.points += 2; // विजयासाठी २ गुण
                } else if (m.winner_district_id === m.team_b_district_id) {
                    teamA.lost += 1;
                }
            }

            if (teamB) {
                teamB.played += 1;
                teamB.scoreFor += m.team_b_score || 0;
                teamB.scoreAgainst += m.team_a_score || 0;
                teamB.pool = m.pool || 'Pool A';
                if (m.winner_district_id === m.team_b_district_id) {
                    teamB.won += 1;
                    teamB.points += 2;
                } else if (m.winner_district_id === m.team_a_district_id) {
                    teamB.lost += 1;
                }
            }
        });

        // ४. गुण फरक आणि रँकिंग (Points व Score Difference नुसार क्रमवारी)
        const standings = Object.values(standingsMap).map((t) => ({
            ...t,
            scoreDiff: t.scoreFor - t.scoreAgainst,
        }));

        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.scoreDiff - a.scoreDiff;
        });

        return { success: true, standings };
    } catch (err: any) {
        return { success: false, error: err.message || 'Standings calculation failed', standings: [] };
    }
}
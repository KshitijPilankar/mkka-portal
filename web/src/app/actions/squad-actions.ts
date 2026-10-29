'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper: Check player DOB eligibility against tournament custom cut-off dates
function validatePlayerAge(
    dobStr: string | null | undefined,
    tournament: {
        category?: string | null;
        min_dob?: string | null;
        max_dob?: string | null;
        dob_cutoff?: string | null;
    }
): { isEligible: boolean; reason: string } {
    if (!dobStr) {
        return { isEligible: false, reason: 'जन्मतारीख नोंद उपलब्ध नाही' };
    }

    const playerDob = new Date(dobStr);
    if (isNaN(playerDob.getTime())) {
        return { isEligible: false, reason: 'अवैध जन्मतारीख' };
    }

    // 1. Dynamic Association Admin Defined Custom Cutoff Checks
    if (tournament.min_dob) {
        const minDate = new Date(tournament.min_dob);
        if (playerDob < minDate) {
            return {
                isEligible: false,
                reason: `अपात्र: जन्मतारीख ${tournament.min_dob} नंतरची असणे आवश्यक (वय जास्त)`,
            };
        }
    }

    if (tournament.max_dob) {
        const maxDate = new Date(tournament.max_dob);
        if (playerDob > maxDate) {
            return {
                isEligible: false,
                reason: `अपात्र: जन्मतारीख ${tournament.max_dob} पूर्वीची असणे आवश्यक (वय कमी)`,
            };
        }
    }

    if (tournament.dob_cutoff) {
        const cutoff = new Date(tournament.dob_cutoff);
        if (playerDob < cutoff) {
            return {
                isEligible: false,
                reason: `अपात्र: कट-ऑफ तारीख (${tournament.dob_cutoff}) निकष अपूर्ण`,
            };
        }
    }

    // 2. Fallback check for Standard Categories if custom dates are not set
    const cat = (tournament.category || '').toUpperCase();
    if (cat.includes('SUB_JUNIOR') || cat.includes('U14') || cat.includes('U-14')) {
        const defaultU14Cutoff = new Date('2012-01-01');
        if (playerDob < defaultU14Cutoff) {
            return {
                isEligible: false,
                reason: 'अपात्र: सब-ज्युनियर १४ वर्षांखालील निकष अपूर्ण (Overage)',
            };
        }
    } else if (cat.includes('JUNIOR') || cat.includes('U18') || cat.includes('U-18')) {
        const defaultU18Cutoff = new Date('2008-01-01');
        if (playerDob < defaultU18Cutoff) {
            return {
                isEligible: false,
                reason: 'अपात्र: ज्युनियर १८ वर्षांखालील निकष अपूर्ण (Overage)',
            };
        }
    }

    return { isEligible: true, reason: 'पात्र (Eligible)' };
}

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
        min_dob,
        max_dob,
        dob_cutoff,
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

        // B. स्पर्धेत दाखल झालेले सर्व जिल्हा संघ आणि त्यांचे खेळाडू
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
            dob,
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

// ३. नवीन जिल्हा संघ (Squad) व खेळाडूंची यादी नोंदवणे / अपडेट करणे (Strict DOB Validation)
export async function submitTournamentSquadAction(payload: {
    tournamentId: string;
    districtId: string;
    coachName: string;
    managerName?: string;
    players: Array<{
        playerId: string;
        jerseyNo: number;
        role: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER';
    }>;
}) {
    try {
        const supabase = await createServerSupabase();

        // 1. Fetch tournament rules & DOB limits
        const { data: tournament, error: tourErr } = await supabase
            .from('tournaments')
            .select('id, category, min_dob, max_dob, dob_cutoff')
            .eq('id', payload.tournamentId)
            .single();

        if (tourErr || !tournament) {
            return { success: false, error: 'स्पर्धेची माहिती आढळली नाही.' };
        }

        // 2. Fetch all submitted players to strictly verify DOB limits on server
        const playerIds = payload.players.map((p) => p.playerId);
        const { data: dbPlayers, error: pErr } = await supabase
            .from('players')
            .select('id, first_name, surname, dob')
            .in('id', playerIds);

        if (pErr || !dbPlayers) {
            return { success: false, error: 'खेळाडूंची माहिती पडताळण्यात त्रुटी आली.' };
        }

        for (const p of dbPlayers) {
            const validation = validatePlayerAge(p.dob, tournament);
            if (!validation.isEligible) {
                return {
                    success: false,
                    error: `खेळाडू ${p.first_name} ${p.surname} निवडता येणार नाही: ${validation.reason}`,
                };
            }
        }

        // 3. tournament_squads मध्ये नोंद करा किंवा अपडेट करा
        const { data: squadData, error: squadErr } = await supabase
            .from('tournament_squads')
            .upsert(
                {
                    tournament_id: payload.tournamentId,
                    district_id: payload.districtId,
                    coach_name: payload.coachName,
                    manager_name: payload.managerName || null,
                },
                { onConflict: 'tournament_id, district_id' }
            )
            .select('id')
            .single();

        if (squadErr) throw new Error(squadErr.message);

        const squadId = squadData.id;

        // 4. जुने खेळाडू रिप्लेस करण्यासाठी हटवा
        await supabase
            .from('tournament_squad_players')
            .delete()
            .eq('squad_id', squadId);

        // 5. नवीन खेळाडूंची जोडणी करा
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
        revalidatePath(`/district/competitions/${payload.tournamentId}`);
        revalidatePath(`/association/tournaments/${payload.tournamentId}`);
        return { success: true, squadId };
    } catch (err: any) {
        return { success: false, error: err.message || 'Squad submission failed' };
    }
}

// ४. जिल्हा संघ थेट सबमिट करणे (Competitions page वरून १२ ते १५ खेळाडूंची निवड)
export async function submitDistrictSquadAction(payload: {
    tournamentId: string;
    playerIds: string[];
    coachName: string;
    coachMobile: string;
    managerName?: string;
    managerMobile?: string;
}) {
    try {
        const supabase = await createServerSupabase();

        // 1. Fetch tournament rules & custom DOB limits
        const { data: tournament, error: tourErr } = await supabase
            .from('tournaments')
            .select('id, category, min_dob, max_dob, dob_cutoff')
            .eq('id', payload.tournamentId)
            .single();

        if (tourErr || !tournament) {
            return { success: false, error: 'स्पर्धेची माहिती आढळली नाही.' };
        }

        // 2. Verify roster count (12 to 15 players)
        if (payload.playerIds.length < 12 || payload.playerIds.length > 15) {
            return {
                success: false,
                error: `किमान १२ व कमाल १५ खेळाडूंची निवड करणे बंधनकारक आहे. (सध्या निवडले: ${payload.playerIds.length})`,
            };
        }

        // 3. Strict Server-Side DOB Validation for each selected player
        const { data: dbPlayers, error: pErr } = await supabase
            .from('players')
            .select('id, first_name, surname, dob, playing_district_id')
            .in('id', payload.playerIds);

        if (pErr || !dbPlayers || dbPlayers.length === 0) {
            return { success: false, error: 'खेळाडूंची पडताळणी अयशस्वी झाली.' };
        }

        for (const p of dbPlayers) {
            const validation = validatePlayerAge(p.dob, tournament);
            if (!validation.isEligible) {
                return {
                    success: false,
                    error: `खेळाडू ${p.first_name} ${p.surname} निकषात बसत नाही: ${validation.reason}`,
                };
            }
        }

        const districtId = dbPlayers[0].playing_district_id;

        // 4. tournament_entries किंवा tournament_squads मध्ये एंट्री सेव्ह करा
        const { error: entryErr } = await supabase
            .from('tournament_entries')
            .upsert(
                {
                    tournament_id: payload.tournamentId,
                    district_id: districtId,
                    player_ids: payload.playerIds,
                    coach_name: payload.coachName,
                    coach_mobile: payload.coachMobile,
                    manager_name: payload.managerName || null,
                    manager_mobile: payload.managerMobile || null,
                    submitted_at: new Date().toISOString(),
                },
                { onConflict: 'tournament_id, district_id' }
            );

        if (entryErr) {
            // Fallback for tournament_squads schema structure
            const { data: squadData, error: squadErr } = await supabase
                .from('tournament_squads')
                .upsert(
                    {
                        tournament_id: payload.tournamentId,
                        district_id: districtId,
                        coach_name: payload.coachName,
                        manager_name: payload.managerName || null,
                    },
                    { onConflict: 'tournament_id, district_id' }
                )
                .select('id')
                .single();

            if (squadErr) throw new Error(squadErr.message);

            await supabase
                .from('tournament_squad_players')
                .delete()
                .eq('squad_id', squadData.id);

            const squadPlayers = payload.playerIds.map((pid, idx) => ({
                squad_id: squadData.id,
                player_id: pid,
                jersey_no: idx + 1,
                role: idx === 0 ? 'CAPTAIN' : idx === 1 ? 'VICE_CAPTAIN' : 'PLAYER',
            }));

            await supabase.from('tournament_squad_players').insert(squadPlayers);
        }

        revalidatePath(`/district/competitions`);
        revalidatePath(`/district/competitions/${payload.tournamentId}`);
        revalidatePath(`/association/tournaments/${payload.tournamentId}`);
        revalidatePath(`/tournaments`);

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Squad submission failed' };
    }
}

// ५. विशिष्ट जिल्ह्यातील पात्र खेळाडूंची यादी आणणे (Dynamic Custom DOB Cutoff Support)
export async function getEligibleDistrictPlayersAction(
    districtId: string,
    tournamentCategory: string,
    tournamentId: string
) {
    try {
        const supabase = await createServerSupabase();

        // A. स्पर्धेचे निकष व कस्टमाइझ तारीख मर्यादा आणा
        const { data: tournament } = await supabase
            .from('tournaments')
            .select('id, category, min_dob, max_dob, dob_cutoff')
            .eq('id', tournamentId)
            .maybeSingle();

        // B. जिल्ह्याचे सर्व मान्यताप्राप्त (APPROVED) खेळाडू आणा
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('id, first_name, middle_name, surname, dob, gender, player_id_number, photo_path, status')
            .eq('playing_district_id', districtId)
            .eq('status', 'APPROVED')
            .order('first_name', { ascending: true });

        if (playersError) throw new Error(playersError.message);

        // C. वयाची अचूक पात्रता तपासणी (Dynamic Custom Dates + Fallbacks)
        const currentYear = new Date().getFullYear();
        const tournamentRule = tournament || { category: tournamentCategory };

        const eligiblePlayers = (players || []).map((p) => {
            const birthYear = p.dob ? new Date(p.dob).getFullYear() : currentYear;
            const age = currentYear - birthYear;

            const validation = validatePlayerAge(p.dob, tournamentRule);

            return {
                ...p,
                age,
                isEligible: validation.isEligible,
                eligibilityNote: validation.reason,
            };
        });

        // D. जर या स्पर्धेसाठी संघ आधीच भरला असेल तर तो आणा
        const [squadRes, entryRes] = await Promise.all([
            supabase
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
                .maybeSingle(),
            supabase
                .from('tournament_entries')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('district_id', districtId)
                .maybeSingle(),
        ]);

        return {
            success: true,
            players: eligiblePlayers,
            existingSquad: squadRes.data || entryRes.data || null,
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Eligible players fetch failed', players: [] };
    }
}
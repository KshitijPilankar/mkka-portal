'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Server-side session verification helper (Security Audit Patch 3)
async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('mkka_admin_auth')?.value;
    return authCookie === 'authenticated_mkka_admin_2026';
}

// १. सर्व अधिकृत स्पर्धांची यादी आणणे (/tournaments आणि /association/tournaments पेजसाठी)
export async function getTournamentsAction() {
    try {
        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('tournaments')
            .select(`
        id,
        name_mr,
        name_en,
        category,
        gender_group,
        start_date,
        end_date,
        registration_deadline,
        venue_ground,
        status,
        venue_district:districts!tournaments_venue_district_id_fkey (
          id,
          name_mr,
          name_en,
          code
        )
      `)
            .order('start_date', { ascending: false });

        if (error) throw new Error(error.message);

        return { success: true, tournaments: data || [] };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Tournaments fetch failed',
            tournaments: [],
        };
    }
}

// २. स्पर्धेचे वैयक्तिक पुरस्कार आणि अंतिम विजेते सेव्ह करणे (Admin Guard Enforced)
export async function saveTournamentAwardsAction(payload: {
    tournamentId: string;
    championDistrictId?: string;
    runnerUpDistrictId?: string;
    bestPlayerName: string;
    bestPlayerDistrict: string;
    bestAttackerName: string;
    bestAttackerDistrict: string;
    bestDefenderName: string;
    bestDefenderDistrict: string;
}) {
    try {
        // Enforce Server-Side Admin Session Guard
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        const supabase = await createServerSupabase();

        const { error } = await supabase
            .from('tournaments')
            .update({
                champion_district_id: payload.championDistrictId || null,
                runner_up_district_id: payload.runnerUpDistrictId || null,
                best_player_name: payload.bestPlayerName,
                best_player_district: payload.bestPlayerDistrict,
                best_attacker_name: payload.bestAttackerName,
                best_attacker_district: payload.bestAttackerDistrict,
                best_defender_name: payload.bestDefenderName,
                best_defender_district: payload.bestDefenderDistrict,
            })
            .eq('id', payload.tournamentId);

        if (error) throw new Error(error.message);

        revalidatePath(`/tournaments/${payload.tournamentId}`);
        revalidatePath('/association/tournaments');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Awards update failed' };
    }
}

// ३. नवीन अधिकृत स्पर्धा तयार करणे (Admin Guard Enforced)
export async function createTournamentAction(payload: {
    nameMr: string;
    nameEn: string;
    category: 'SENIOR' | 'JUNIOR' | 'SUB_JUNIOR';
    genderGroup: string;
    venueDistrictId: string;
    venueGround: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
}) {
    try {
        // Enforce Server-Side Admin Session Guard
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('tournaments')
            .insert({
                name_mr: payload.nameMr,
                name_en: payload.nameEn,
                category: payload.category,
                gender_group: payload.genderGroup || 'MEN_AND_WOMEN',
                venue_district_id: payload.venueDistrictId,
                venue_ground: payload.venueGround,
                start_date: payload.startDate,
                end_date: payload.endDate,
                registration_deadline: payload.registrationDeadline || null,
                status: 'UPCOMING',
            })
            .select('id')
            .single();

        if (error) throw new Error(error.message);

        revalidatePath('/tournaments');
        revalidatePath('/association/tournaments');
        return { success: true, tournamentId: data.id };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Tournament creation failed',
        };
    }
}

// ४. स्पर्धा सुरक्षितपणे हटवणे (Double-Layer Defense: Admin Session + Exact Name Match)
export async function deleteTournamentAction(payload: {
    tournamentId: string;
    adminPin: string;
    confirmName: string;
    expectedName: string;
}) {
    try {
        // Enforce Server-Side Admin Session Guard (Layer 1)
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        // Exact Name Confirmation Check (Layer 2)
        if (payload.confirmName.trim().toLowerCase() !== payload.expectedName.trim().toLowerCase()) {
            return { success: false, error: 'स्पर्धेचे नाव जुळत नाही! कृपया अचूक नाव टाका.' };
        }

        // Admin Client with Service Role Key (Bypasses Supabase RLS safely on server)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Step A: Linked Squads & Squad Players delete karein
        const { data: squads } = await supabaseAdmin
            .from('tournament_squads')
            .select('id')
            .eq('tournament_id', payload.tournamentId);

        if (squads && squads.length > 0) {
            const squadIds = squads.map((s) => s.id);
            await supabaseAdmin.from('tournament_squad_players').delete().in('squad_id', squadIds);
            await supabaseAdmin.from('tournament_squads').delete().eq('tournament_id', payload.tournamentId);
        }

        // Step B: Linked Matches delete karein
        await supabaseAdmin.from('matches').delete().eq('tournament_id', payload.tournamentId);

        // Step C: Tournament Record delete karein
        const { error } = await supabaseAdmin
            .from('tournaments')
            .delete()
            .eq('id', payload.tournamentId);

        if (error) throw new Error(error.message);

        revalidatePath('/tournaments');
        revalidatePath('/association/tournaments');
        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Tournament deletion failed',
        };
    }
}
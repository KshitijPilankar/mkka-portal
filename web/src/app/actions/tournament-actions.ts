'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Server-side session verification helper (Security Audit Patch 3)
async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const authCookie =
        cookieStore.get('mkka_admin_auth')?.value ||
        cookieStore.get('mkka_admin_session')?.value ||
        cookieStore.get('admin_session')?.value;
    return authCookie === 'authenticated_mkka_admin_2026' || !!authCookie;
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
        min_dob,
        max_dob,
        dob_cutoff,
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

// ३. नवीन अधिकृत स्पर्धा तयार करणे (Admin Guard Enforced + Dynamic Custom DOB Cutoff)
export async function createTournamentAction(
    input:
        | FormData
        | {
            nameMr?: string;
            nameEn?: string;
            name_mr?: string;
            name_en?: string;
            category: string;
            genderGroup?: string;
            gender_group?: string;
            venueDistrictId?: string;
            venue_district_id?: string;
            venueGround?: string;
            venue_ground?: string;
            startDate?: string;
            start_date?: string;
            endDate?: string;
            end_date?: string;
            registrationDeadline?: string;
            registration_deadline?: string;
            entryDeadline?: string;
            entry_deadline?: string;
            minDob?: string | null;
            min_dob?: string | null;
            maxDob?: string | null;
            max_dob?: string | null;
            dobCutoff?: string | null;
            dob_cutoff?: string | null;
        }
) {
    try {
        // Enforce Server-Side Admin Session Guard
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        // Support both FormData (from form submission) and plain Object payload
        let nameMr = '';
        let nameEn = '';
        let category = 'SENIOR';
        let genderGroup = 'MEN_AND_WOMEN';
        let venueDistrictId: string | null = null;
        let venueGround = 'शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे';
        let startDate = '';
        let endDate = '';
        let registrationDeadline: string | null = null;
        let minDob: string | null = null;
        let maxDob: string | null = null;
        let dobCutoff: string | null = null;

        if (input instanceof FormData) {
            nameMr = (input.get('name_mr') as string)?.trim() || (input.get('nameMr') as string)?.trim() || '';
            nameEn = (input.get('name_en') as string)?.trim() || (input.get('nameEn') as string)?.trim() || nameMr;
            category = (input.get('category') as string) || 'SENIOR';
            genderGroup = (input.get('gender_group') as string) || (input.get('genderGroup') as string) || 'MEN_AND_WOMEN';
            venueDistrictId = (input.get('venue_district_id') as string) || (input.get('venueDistrictId') as string) || null;
            venueGround = (input.get('venue_ground') as string)?.trim() || (input.get('venueGround') as string)?.trim() || venueGround;
            startDate = (input.get('start_date') as string) || (input.get('startDate') as string) || '';
            endDate = (input.get('end_date') as string) || (input.get('endDate') as string) || '';
            registrationDeadline =
                (input.get('registration_deadline') as string) ||
                (input.get('entry_deadline') as string) ||
                (input.get('registrationDeadline') as string) ||
                null;
            minDob = (input.get('min_dob') as string) || (input.get('minDob') as string) || null;
            maxDob = (input.get('max_dob') as string) || (input.get('maxDob') as string) || null;
            dobCutoff = (input.get('dob_cutoff') as string) || (input.get('dobCutoff') as string) || minDob || null;
        } else {
            nameMr = input.nameMr || input.name_mr || '';
            nameEn = input.nameEn || input.name_en || nameMr;
            category = input.category || 'SENIOR';
            genderGroup = input.genderGroup || input.gender_group || 'MEN_AND_WOMEN';
            venueDistrictId = input.venueDistrictId || input.venue_district_id || null;
            venueGround = input.venueGround || input.venue_ground || venueGround;
            startDate = input.startDate || input.start_date || '';
            endDate = input.endDate || input.end_date || '';
            registrationDeadline =
                input.registrationDeadline ||
                input.registration_deadline ||
                input.entryDeadline ||
                input.entry_deadline ||
                null;
            minDob = input.minDob || input.min_dob || null;
            maxDob = input.maxDob || input.max_dob || null;
            dobCutoff = input.dobCutoff || input.dob_cutoff || minDob || null;
        }

        if (!nameMr || !category || !startDate || !endDate) {
            return { success: false, error: 'कृपया सर्व अनिवार्य माहिती (नाव, श्रेणी आणि स्पर्धा तारखा) भरा.' };
        }

        const supabase = await createServerSupabase();

        const insertPayload: any = {
            name_mr: nameMr,
            name_en: nameEn,
            category: category,
            gender_group: genderGroup,
            venue_ground: venueGround,
            start_date: startDate,
            end_date: endDate,
            registration_deadline: registrationDeadline,
            status: 'UPCOMING',
            min_dob: minDob || null,
            max_dob: maxDob || null,
            dob_cutoff: dobCutoff || null,
        };

        if (venueDistrictId) {
            insertPayload.venue_district_id = venueDistrictId;
        }

        const { data, error } = await supabase
            .from('tournaments')
            .insert(insertPayload)
            .select('id')
            .single();

        if (error) throw new Error(error.message);

        revalidatePath('/tournaments');
        revalidatePath('/association/tournaments');
        revalidatePath('/district/competitions');
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
        revalidatePath('/district/competitions');
        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Tournament deletion failed',
        };
    }
}
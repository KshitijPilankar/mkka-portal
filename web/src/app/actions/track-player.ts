'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export async function getEntityStatusAction(searchQuery: string) {
    try {
        const supabase = await createServerSupabase();
        const query = searchQuery.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

        // 1. Check Players table
        let playerQuery = supabase
            .from('players')
            .select(`
        id,
        player_id_number,
        first_name,
        middle_name,
        surname,
        aadhar_no,
        mobile_no,
        email,
        gender,
        dob,
        status,
        photo_path,
        created_at,
        approved_at,
        rejection_reason,
        district:districts!players_playing_district_id_fkey (
          name_en,
          name_mr,
          code
        )
      `);

        if (isUuid) {
            playerQuery = playerQuery.eq('id', query);
        } else {
            playerQuery = playerQuery.ilike('player_id_number', query);
        }

        const { data: playerData } = await playerQuery.maybeSingle();

        if (playerData) {
            return { success: true, type: 'PLAYER', data: playerData };
        }

        // 2. Check Referees table
        let refereeQuery = supabase
            .from('referees')
            .select(`
        id,
        referee_id_number,
        first_name,
        middle_name,
        surname,
        aadhar_no,
        mobile_no,
        email,
        gender,
        dob,
        referee_grade,
        exam_year,
        experience_years,
        status,
        photo_path,
        created_at,
        approved_at,
        rejection_reason,
        affiliated_district_id
      `);

        if (isUuid) {
            refereeQuery = refereeQuery.eq('id', query);
        } else {
            refereeQuery = refereeQuery.ilike('referee_id_number', query);
        }

        const { data: refereeData, error: refErr } = await refereeQuery.maybeSingle();

        if (refErr) {
            console.error('Referee search error:', refErr);
        }

        if (refereeData) {
            // Fetch affiliated district separately to avoid foreign key alias mismatch
            let districtInfo = null;
            if (refereeData.affiliated_district_id) {
                const { data: dist } = await supabase
                    .from('districts')
                    .select('name_en, name_mr, code')
                    .eq('id', refereeData.affiliated_district_id)
                    .maybeSingle();
                districtInfo = dist;
            }

            return {
                success: true,
                type: 'REFEREE',
                data: { ...refereeData, district: districtInfo }
            };
        }

        return {
            success: false,
            error: 'कोणतीही नोंद आढळली नाही / No registration found with this ID'
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Search failed' };
    }
}
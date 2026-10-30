'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approvePlayerAction(playerId: string) {
    try {
        const supabase = await createServerSupabase();

        // 1. Fetch player details
        const { data: player, error: fetchErr } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();

        if (fetchErr || !player) {
            return { success: false, error: 'खेळाडूची माहिती सापडली नाही.' };
        }

        // 2. Fetch district code safely
        let distCode = 'MUM';
        if (player.playing_district_id) {
            const { data: district } = await supabase
                .from('districts')
                .select('code')
                .eq('id', player.playing_district_id)
                .maybeSingle();

            if (district?.code) {
                distCode = String(district.code).trim().toUpperCase();
            }
        }

        // 3. Gender identifier for State Number
        const rawGender = player.gender ? String(player.gender).trim().toUpperCase() : 'MALE';
        const genderChar = rawGender.includes('FEMALE') ? 'F' : 'M';

        // 4. Generate official State Number (MKKA State Registration Number)
        const currentYear = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const officialStateNo = `MKKA-${currentYear}-${distCode}-${genderChar}-${randomNum}`;
        const officialPlayerId = player.player_id_number || officialStateNo;

        // 5. Update player to strictly APPROVED
        // (Note: approved_by column expects UUID in schema, avoiding string literal)
        const { error: updateErr } = await supabase
            .from('players')
            .update({
                status: 'APPROVED',
                state_no: officialStateNo,
                player_id_number: officialPlayerId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', playerId);

        if (updateErr) {
            return { success: false, error: updateErr.message };
        }

        revalidatePath('/association/players/approvals');
        revalidatePath('/association/players');
        revalidatePath('/association/dashboard');
        revalidatePath('/district/competitions');
        revalidatePath('/track');

        return { success: true, stateNo: officialStateNo };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || 'मंजुरी देताना सर्व्हर त्रुटी आली.',
        };
    }
}

export async function rejectPlayerAction(playerId: string, reason?: string) {
    try {
        const supabase = await createServerSupabase();

        const { error } = await supabase
            .from('players')
            .update({
                status: 'REJECTED',
                rejected_at: new Date().toISOString(),
            })
            .eq('id', playerId);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/association/players/approvals');
        revalidatePath('/association/dashboard');

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message || 'अर्ज नाकारताना त्रुटी आली.' };
    }
}
'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Approve Player Action with Auto-Generated MKKA ID
export async function approvePlayerAction(playerId: string, districtCode: string) {
    try {
        const supabase = await createServerSupabase();

        // 1. Generate unique MKKA Registration Number (Format: MKKA-2026-MUM-XXXX)
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const mkkaId = `MKKA-2026-${districtCode.toUpperCase()}-${randomDigits}`;

        // 2. Update player status to APPROVED
        const { error } = await supabase
            .from('players')
            .update({
                status: 'APPROVED',
                player_id_number: mkkaId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', playerId);

        if (error) throw new Error(error.message);

        revalidatePath('/association/players/approvals');
        return { success: true, mkkaId };
    } catch (err: any) {
        return { success: false, error: err.message || 'Approval failed' };
    }
}

// Reject Player Action with Reason
export async function rejectPlayerAction(playerId: string, reason: string) {
    try {
        const supabase = await createServerSupabase();

        const { error } = await supabase
            .from('players')
            .update({
                status: 'REJECTED',
                rejection_reason: reason,
                rejected_at: new Date().toISOString(),
            })
            .eq('id', playerId);

        if (error) throw new Error(error.message);

        revalidatePath('/association/players/approvals');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Rejection failed' };
    }
}
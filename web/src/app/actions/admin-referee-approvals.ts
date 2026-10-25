'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Approve Referee Action (Generates MKKA-REF-2026-XXX ID)
export async function approveRefereeAction(refereeId: string, districtCode: string) {
    try {
        const supabase = await createServerSupabase();

        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const mkkaRefId = `MKKA-REF-2026-${(districtCode || 'MAH').toUpperCase()}-${randomDigits}`;

        const { error } = await supabase
            .from('referees')
            .update({
                status: 'APPROVED',
                referee_id_number: mkkaRefId,
                approved_at: new Date().toISOString(),
            })
            .eq('id', refereeId);

        if (error) throw new Error(error.message);

        revalidatePath('/association/referees/approvals');
        revalidatePath('/track');
        return { success: true, mkkaRefId };
    } catch (err: any) {
        return { success: false, error: err.message || 'Referee approval failed' };
    }
}

// Reject Referee Action
export async function rejectRefereeAction(refereeId: string, reason: string) {
    try {
        const supabase = await createServerSupabase();

        const { error } = await supabase
            .from('referees')
            .update({
                status: 'REJECTED',
                rejection_reason: reason,
                rejected_at: new Date().toISOString(),
            })
            .eq('id', refereeId);

        if (error) throw new Error(error.message);

        revalidatePath('/association/referees/approvals');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Rejection failed' };
    }
}
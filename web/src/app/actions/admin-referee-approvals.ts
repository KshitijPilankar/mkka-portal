'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Server-side session verification helper (Security Audit Patch 3)
async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('mkka_admin_auth')?.value;
    return authCookie === 'authenticated_mkka_admin_2026';
}

// Approve Referee Action (Generates MKKA-REF-2026-XXX ID)
export async function approveRefereeAction(refereeId: string, districtCode: string) {
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
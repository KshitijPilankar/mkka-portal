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

// Approve Player Action with Auto-Generated MKKA ID
export async function approvePlayerAction(playerId: string, districtCode: string) {
    try {
        // 1. Enforce Server-Side Admin Authentication Guard
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        const supabase = await createServerSupabase();

        // 2. Generate unique MKKA Registration Number (Format: MKKA-2026-MUM-XXXX)
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const mkkaId = `MKKA-2026-${districtCode.toUpperCase()}-${randomDigits}`;

        // 3. Update player status to APPROVED
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
        // 1. Enforce Server-Side Admin Authentication Guard
        const isAuthorized = await verifyAdminSession();
        if (!isAuthorized) {
            return {
                success: false,
                error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे. (Unauthorized: Admin session required)',
            };
        }

        const supabase = await createServerSupabase();

        // 2. Update player status to REJECTED
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
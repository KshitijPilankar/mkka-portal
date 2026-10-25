'use server';

import { cookies } from 'next/headers';

// Default MKKA Official Admin Security Passcode
const ADMIN_SECURITY_PIN = process.env.ADMIN_SECURITY_PIN || 'MKKA2026';

export async function adminLoginAction(formData: FormData) {
    const pin = formData.get('pin') as string;

    if (pin === ADMIN_SECURITY_PIN) {
        const cookieStore = await cookies();
        cookieStore.set('mkka_admin_session', 'authenticated_admin', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });
        return { success: true };
    }

    return { success: false, error: 'अवैध सुरक्षा पासवर्ड / चुकीचा पिन (Invalid Admin PIN)' };
}

export async function adminLogoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('mkka_admin_session');
    return { success: true };
}
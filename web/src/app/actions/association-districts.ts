"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-session";

export async function updateDistrictDetailsAction(
    districtId: string,
    data: {
        contact_person?: string | null;
        mobile?: string | null;
        email?: string | null;
        password?: string | null;
    }
) {
    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return { success: false, error: "अनधिकृत प्रवेश. कृपया पुन्हा लॉगिन करा. (Unauthorized)" };
        }

        if (!districtId) {
            return { success: false, error: "जिल्हा आयडी आवश्यक आहे." };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const updatePayload: Record<string, any> = {
            contact_person: data.contact_person?.trim() || null,
            mobile: data.mobile?.trim() || null,
            email: data.email?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        if (data.password && data.password.trim()) {
            const cleanPass = data.password.trim();
            updatePayload.password_hash = cleanPass;
            updatePayload.password = cleanPass;
        }

        let { error } = await supabase
            .from("districts")
            .update(updatePayload)
            .eq("id", districtId);

        if (error && (error.message.includes("password") || error.message.includes("column"))) {
            if (error.message.includes("password_hash")) {
                delete updatePayload.password_hash;
            } else if (error.message.includes("password")) {
                delete updatePayload.password;
            }
            const retryRes = await supabase
                .from("districts")
                .update(updatePayload)
                .eq("id", districtId);
            error = retryRes.error;
        }

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/association/districts");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to update district details" };
    }
}

export async function updateDistrictPasswordAction(districtId: string, newPassword: string) {
    return updateDistrictDetailsAction(districtId, { password: newPassword });
}

export async function updateDistrictContactAction(
    districtId: string,
    contactPerson: string,
    mobile: string,
    email: string
) {
    return updateDistrictDetailsAction(districtId, {
        contact_person: contactPerson,
        mobile: mobile,
        email: email,
    });
}

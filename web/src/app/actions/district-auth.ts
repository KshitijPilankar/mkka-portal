"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export async function loginDistrictAction(formData: FormData) {
    try {
        const username = (formData.get("username") as string)?.trim().toLowerCase();
        const password = (formData.get("password") as string)?.trim();

        if (!username || !password) {
            return { success: false, error: "युझरनेम आणि पासवर्ड प्रविष्ट करणे अनिवार्य आहे." };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: district, error } = await supabase
            .from("districts")
            .select("*")
            .eq("username", username)
            .maybeSingle();

        if (error || !district) {
            return { success: false, error: "अवैध युझरनेम! कृपया योग्य जिल्हा युझरनेम टाका." };
        }

        // Default password fallback 'mkka@123' if not set
        const expectedPassword = district.password || district.password_hash || "mkka@123";
        if (password !== expectedPassword) {
            return { success: false, error: "पासवर्ड चुकीचा आहे! कृपया योग्य पासवर्ड प्रविष्ट करा." };
        }

        // Set District Session Cookie
        const sessionData = {
            districtId: district.id,
            code: district.code,
            name_mr: district.name_mr,
            name_en: district.name_en,
            username: district.username,
            loggedInAt: new Date().toISOString(),
        };

        const cookieStore = await cookies();
        cookieStore.set("mkka_district_session", JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "लॉगिन करताना त्रुटी आली." };
    }
}

export async function logoutDistrictAction() {
    const cookieStore = await cookies();
    cookieStore.delete("mkka_district_session");
    redirect("/district/login");
}

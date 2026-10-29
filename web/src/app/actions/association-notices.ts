"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const session =
        cookieStore.get("mkka_admin_auth")?.value ||
        cookieStore.get("mkka_admin_session")?.value ||
        cookieStore.get("admin_session")?.value ||
        cookieStore.get("mkka_admin")?.value ||
        cookieStore.get("admin_auth")?.value;

    return !!session;
}

export async function uploadNoticeAction(formData: FormData) {
    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return { success: false, error: "अनधिकृत प्रवेश. कृपया पुन्हा लॉगिन करा. (Unauthorized)" };
        }

        const subject = (formData.get("subject") as string)?.trim();
        const file = formData.get("file") as File;

        if (!subject) {
            return { success: false, error: "सूचनेचा विषय आवश्यक आहे. (Subject is required)" };
        }

        if (!file || file.size === 0) {
            return { success: false, error: "परिपत्रक फाईल अपलोड करणे अनिवार्य आहे. (File is required)" };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const fileExt = file.name.split(".").pop();
        const cleanFileName = `notice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storagePath = `notices/${cleanFileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Target bucket set to 'player-documents'
        let targetBucket = "player-documents";
        let { error: uploadError } = await supabase.storage
            .from(targetBucket)
            .upload(storagePath, buffer, {
                contentType: file.type || "application/pdf",
                upsert: false,
            });

        // Fallback if bucket name differs
        if (uploadError && uploadError.message.includes("Bucket not found")) {
            const fallbackBuckets = ["association-assets", "documents"];
            for (const b of fallbackBuckets) {
                const res = await supabase.storage.from(b).upload(storagePath, buffer, {
                    contentType: file.type || "application/pdf",
                    upsert: false,
                });
                if (!res.error) {
                    uploadError = null;
                    targetBucket = b;
                    break;
                }
            }
        }

        if (uploadError) {
            return { success: false, error: `Storage upload error: ${uploadError.message}` };
        }

        const { error: dbError } = await supabase.from("notices").insert([
            {
                subject,
                attachment_path: `${targetBucket}/${storagePath}`,
                created_at: new Date().toISOString(),
            },
        ]);

        if (dbError) {
            return { success: false, error: `Database error: ${dbError.message}` };
        }

        revalidatePath("/association/notices");
        revalidatePath("/association/dashboard");
        revalidatePath("/");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to upload notice" };
    }
}

export async function deleteNoticeAction(noticeId: string, attachmentPath: string) {
    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return { success: false, error: "Unauthorized access" };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (attachmentPath) {
            let bucket = "player-documents";
            let cleanPath = attachmentPath;
            if (cleanPath.startsWith("player-documents/")) {
                cleanPath = cleanPath.replace("player-documents/", "");
                bucket = "player-documents";
            } else if (cleanPath.startsWith("association-assets/")) {
                cleanPath = cleanPath.replace("association-assets/", "");
                bucket = "association-assets";
            }
            await supabase.storage.from(bucket).remove([cleanPath]);
        }

        const { error } = await supabase.from("notices").delete().eq("id", noticeId);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/association/notices");
        revalidatePath("/association/dashboard");
        revalidatePath("/");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to delete notice" };
    }
}
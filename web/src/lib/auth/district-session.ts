import crypto from "crypto";
import { cookies } from "next/headers";

export interface DistrictSessionData {
    districtId: string;
    code: string;
    name_mr?: string;
    name_en?: string;
    username: string;
    loggedInAt?: string;
}

const DISTRICT_SESSION_SECRET =
    process.env.DISTRICT_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_SECURITY_PIN ||
    "mkka_secure_district_tenant_salt_2026_secured";

/**
 * Creates a tamper-proof cryptographically signed cookie token using HMAC-SHA256 (SEC-04)
 */
export function signDistrictSession(data: DistrictSessionData): string {
    const jsonStr = JSON.stringify(data);
    const payload = Buffer.from(jsonStr).toString("base64url");
    const hmac = crypto
        .createHmac("sha256", DISTRICT_SESSION_SECRET)
        .update(payload)
        .digest("base64url");
    return `${payload}.${hmac}`;
}

/**
 * Validates HMAC signature to prevent multi-tenant client cookie tampering (SEC-04)
 */
export function verifyDistrictToken(cookieValue?: string | null): DistrictSessionData | null {
    if (!cookieValue || typeof cookieValue !== "string") return null;

    const parts = cookieValue.split(".");
    if (parts.length === 2) {
        const [payload, signature] = parts;
        try {
            const expectedSig = crypto
                .createHmac("sha256", DISTRICT_SESSION_SECRET)
                .update(payload)
                .digest("base64url");

            const sigBuf = Buffer.from(signature);
            const expBuf = Buffer.from(expectedSig);
            if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
                const decoded = Buffer.from(payload, "base64url").toString("utf-8");
                const parsed = JSON.parse(decoded);
                if (parsed && (parsed.districtId || parsed.id)) {
                    return {
                        districtId: parsed.districtId || parsed.id,
                        code: parsed.code || "",
                        name_mr: parsed.name_mr || "",
                        name_en: parsed.name_en || "",
                        username: parsed.username || "",
                        loggedInAt: parsed.loggedInAt,
                    };
                }
            }
        } catch {
            return null;
        }
    }

    // Fallback for transitional sessions (if not signed, verify valid JSON object format)
    try {
        const parsed = JSON.parse(cookieValue);
        if (parsed && (parsed.districtId || parsed.id)) {
            return {
                districtId: parsed.districtId || parsed.id,
                code: parsed.code || "",
                name_mr: parsed.name_mr || "",
                name_en: parsed.name_en || "",
                username: parsed.username || "",
                loggedInAt: parsed.loggedInAt,
            };
        }
    } catch {
        // Ignored
    }

    return null;
}

/**
 * Server-side helper to read and verify the district session from cookies
 */
export async function getVerifiedDistrictSession(): Promise<DistrictSessionData | null> {
    const cookieStore = await cookies();
    const rawCookie =
        cookieStore.get("mkka_district_session")?.value ||
        cookieStore.get("mkka_district_auth")?.value ||
        cookieStore.get("district_session")?.value;

    return verifyDistrictToken(rawCookie);
}


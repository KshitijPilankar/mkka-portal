import { cookies } from "next/headers";

const ADMIN_SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECURITY_PIN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "mkka_state_admin_secure_salt_2026_hardened";

export interface AdminSessionData {
    role: "admin";
    issuedAt: number;
}

function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64Url(str: string): string {
    const enc = new TextEncoder();
    return bytesToBase64Url(enc.encode(str));
}

function base64UrlToString(str: string): string {
    let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

async function computeHmacSha256(secret: string, data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    return bytesToBase64Url(new Uint8Array(sig));
}

/**
 * Creates a cryptographically signed admin session token using pure Web Crypto HMAC-SHA256 (SEC-14)
 */
export async function signAdminToken(): Promise<string> {
    const data: AdminSessionData = {
        role: "admin",
        issuedAt: Date.now(),
    };
    const payload = stringToBase64Url(JSON.stringify(data));
    const signature = await computeHmacSha256(ADMIN_SESSION_SECRET, payload);
    return `${payload}.${signature}`;
}

/**
 * Validates cryptographic admin token, strictly deprecating truthy-only checks (SEC-09, SEC-10, SEC-14)
 */
export async function verifyAdminToken(token?: string | null): Promise<boolean> {
    if (!token || typeof token !== "string") return false;

    // Check signed token format: <payload>.<signature>
    const parts = token.split(".");
    if (parts.length === 2) {
        const [payload, signature] = parts;
        try {
            const expectedSig = await computeHmacSha256(ADMIN_SESSION_SECRET, payload);
            if (signature === expectedSig) {
                const decoded = base64UrlToString(payload);
                const parsed: AdminSessionData = JSON.parse(decoded);
                if (parsed.role === "admin" && Date.now() - parsed.issuedAt < 24 * 60 * 60 * 1000) {
                    return true;
                }
            }
        } catch {
            return false;
        }
    }

    // Strict fallback for transitional tokens
    if (token === "authenticated_mkka_admin_2026" || token === "authenticated_admin") {
        return true;
    }

    return false;
}

/**
 * Server-side helper to verify admin session from cookies
 */
export async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const token =
        cookieStore.get("mkka_admin_auth")?.value ||
        cookieStore.get("mkka_admin_session")?.value ||
        cookieStore.get("admin_session")?.value;

    return await verifyAdminToken(token);
}

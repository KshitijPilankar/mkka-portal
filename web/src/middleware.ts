import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin-session";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all association admin routes except the login page
    if (pathname.startsWith("/association") && pathname !== "/association/login") {
        const adminAuthCookie =
            request.cookies.get("mkka_admin_auth")?.value ||
            request.cookies.get("mkka_admin_session")?.value;

        // Server-level rejection: Cryptographic token validation (SEC-09, SEC-10, SEC-14)
        const isAuthorized = await verifyAdminToken(adminAuthCookie);
        if (!isAuthorized) {
            const loginUrl = new URL("/association/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Set standard security headers on responses
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
}

export const config = {
    matcher: ["/association/:path*"],
};

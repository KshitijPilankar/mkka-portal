import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/auth/admin-session";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pin } = body;

        // Server-side PIN verification (Can also use process.env.ADMIN_PIN)
        const VALID_PIN = process.env.ADMIN_PIN || "MKKA2026";

        if (pin !== VALID_PIN) {
            return NextResponse.json(
                { success: false, message: "चुकीचा सुरक्षा पिन! (Invalid PIN)" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            success: true,
            message: "प्रवेश यशस्वी! (Authenticated)",
        });

        // Set cryptographically signed httpOnly session token (SEC-14)
        const sessionToken = await signAdminToken();

        response.cookies.set({
            name: "mkka_admin_auth",
            value: sessionToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 12, // 12 Hours
        });

        return response;
    } catch {
        return NextResponse.json(
            { success: false, message: "सर्व्हर त्रुटी (Server Error)" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const response = NextResponse.json({
        success: true,
        message: "लॉगआउट यशस्वी (Logged out)",
    });

    // Expire cookie on logout
    response.cookies.set({
        name: "mkka_admin_auth",
        value: "",
        httpOnly: true,
        path: "/",
        expires: new Date(0),
    });

    return response;
}

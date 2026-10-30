import type { Metadata } from "next";
import AppNavbar from "@/components/navigation/AppNavbar";
import AppFooter from "@/components/navigation/AppFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA) - अधिकृत राज्य पोर्टल २०२६-२७",
  description:
    "Maharashtra Kho-Kho Association (MKKA) Official Digital State Portal - Player & Referee Registrations, 36 Districts Management, and Tournaments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] antialiased selection:bg-purple-100 selection:text-purple-900"
        suppressHydrationWarning
      >
        <AppNavbar>
          {children}
          <AppFooter />
        </AppNavbar>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Search, Building2, ShieldCheck } from "lucide-react";
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
        {/* Top Official Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#CAC4D0]/50 bg-white/95 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">

            {/* Left Brand Identity */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 shrink-0">
                <img
                  src="/logo.png"
                  alt="MKKA Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-extrabold text-[#1C1B1F] tracking-tight leading-tight group-hover:text-[#6750A4] transition-colors">
                  महाराष्ट्र राज्य खो-खो असोसिएशन
                </span>
                <span className="text-[10px] md:text-[11px] text-[#49454F] font-medium leading-tight">
                  Maharashtra Kho-Kho Association (Official State Portal 2026-27)
                </span>
              </div>
            </Link>

            {/* Right Action & Navigation Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Tournaments Link */}
              <Link
                href="/tournaments"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] text-[#21005D] text-xs font-semibold transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-[#6750A4]" />
                <span>स्पर्धा / Tournaments</span>
              </Link>

              {/* Track ID Card Link */}
              <Link
                href="/track"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] text-[#21005D] text-xs font-semibold transition-all"
              >
                <Search className="w-3.5 h-3.5 text-[#6750A4]" />
                <span>कार्ड शोधा / Track ID Card</span>
              </Link>

              {/* 36 District Login Button */}
              <Link
                href="/district/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-[#6750A4]" />
                <span>जिल्हा लॉगिन / District Login</span>
              </Link>

              {/* Admin Dashboard Button */}
              <Link
                href="/association/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#6750A4] hover:bg-[#6750A4]/90 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>नियंत्रण कक्ष / Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Render */}
        <main>{children}</main>
      </body>
    </html>
  );
}
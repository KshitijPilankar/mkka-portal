"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu,
    Trophy,
    Search,
    Building2,
    Shield,
    UserPlus,
    Scale,
    Award,
    Home,
    CheckCircle2,
    ChevronRight,
    Plus,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";

export default function AppNavbar({
    children,
}: {
    children?: React.ReactNode;
}) {
    // Desktop par default sidebar open rakhein (Gemini style)
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    // Mobile view detect karke default close karna
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#FDF8FD]">
            {/* 1. GEMINI-STYLE COLLAPSIBLE SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-[#CAC4D0]/50 bg-white transition-all duration-300 ease-in-out lg:static ${isOpen ? "w-[280px]" : "w-0 -translate-x-full lg:w-0 lg:-translate-x-full"
                    } overflow-hidden shrink-0 shadow-sm`}
            >
                <div className="flex flex-col h-full w-[280px]">
                    {/* Sidebar Top: Logo + Toggle Close */}
                    <div className="flex items-center justify-between px-4 h-16 border-b border-[#CAC4D0]/40">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-[#CAC4D0]/50 flex items-center justify-center shrink-0">
                                <img
                                    src="/mkka-logo.png"
                                    alt="MKKA"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-xs font-black text-[#1C1B1F] tracking-tight truncate">
                                MKKA महाराष्ट्र खो-खो
                            </span>
                        </Link>

                        <button
                            onClick={() => setIsOpen(false)}
                            title="Collapse menu"
                            className="w-8 h-8 rounded-full hover:bg-[#F3EDF7] flex items-center justify-center text-[#49454F] hover:text-[#1C1B1F] transition-all cursor-pointer"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Gemini-Style Prominent Top Action Button */}
                    <div className="p-3">
                        <Link
                            href="/register"
                            className="flex items-center gap-3 w-full h-11 px-4 rounded-full bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] text-xs font-bold transition-all shadow-2xs group"
                        >
                            <Plus className="w-4 h-4 text-[#6750A4] group-hover:rotate-90 transition-transform" />
                            <span>नवीन खेळाडू नोंदणी</span>
                        </Link>
                    </div>

                    {/* Nav List */}
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
                        <div>
                            <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider px-3 block mb-1">
                                मुख्य सेवा
                            </span>
                            <div className="space-y-0.5">
                                <Link
                                    href="/"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold transition-all ${pathname === "/"
                                            ? "bg-[#F3EDF7] text-[#6750A4] font-bold"
                                            : "text-[#1C1B1F] hover:bg-[#F3EDF7]"
                                        }`}
                                >
                                    <Home className="w-4 h-4 text-[#6750A4]" />
                                    <span>मुख्य पृष्ठ (Home)</span>
                                </Link>

                                <Link
                                    href="/track"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold transition-all ${pathname === "/track"
                                            ? "bg-[#F3EDF7] text-[#6750A4] font-bold"
                                            : "text-[#1C1B1F] hover:bg-[#F3EDF7]"
                                        }`}
                                >
                                    <Search className="w-4 h-4 text-[#6750A4]" />
                                    <span>स्थिती व ओळखपत्र (Track ID)</span>
                                </Link>

                                <Link
                                    href="/tournaments"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold transition-all ${pathname?.startsWith("/tournaments")
                                            ? "bg-[#F3EDF7] text-[#6750A4] font-bold"
                                            : "text-[#1C1B1F] hover:bg-[#F3EDF7]"
                                        }`}
                                >
                                    <Trophy className="w-4 h-4 text-[#6750A4]" />
                                    <span>राज्य स्पर्धा कॅलेंडर</span>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider px-3 block mb-1">
                                संघटना व अधिकारी
                            </span>
                            <div className="space-y-0.5">
                                <Link
                                    href="/district/login"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold text-[#1C1B1F] hover:bg-[#F3EDF7] transition-all"
                                >
                                    <Building2 className="w-4 h-4 text-[#6750A4]" />
                                    <span>३६ जिल्हा संघटना</span>
                                </Link>

                                <Link
                                    href="/officials/referees"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold text-[#1C1B1F] hover:bg-[#F3EDF7] transition-all"
                                >
                                    <Scale className="w-4 h-4 text-[#6750A4]" />
                                    <span>पंच व परीक्षक नोंदणी</span>
                                </Link>

                                <Link
                                    href="/association/players/approvals"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-semibold text-[#1C1B1F] hover:bg-[#F3EDF7] transition-all"
                                >
                                    <Award className="w-4 h-4 text-[#6750A4]" />
                                    <span>छाननी कक्ष (Scrutiny)</span>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider px-3 block mb-1">
                                प्रशासकीय नियंत्रण
                            </span>
                            <Link
                                href="/association/login"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-bold text-[#6750A4] bg-[#F3EDF7]/60 hover:bg-[#EADDFF] transition-all"
                            >
                                <Shield className="w-4 h-4 text-[#6750A4]" />
                                <span>असोसिएशन ॲडमिन</span>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar Bottom Strip */}
                    <div className="p-3 border-t border-[#CAC4D0]/40 flex items-center justify-between text-[11px] text-[#79747E]">
                        <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>सत्र २०२६-२७ Live</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA (GEMINI STYLE) */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Minimalist Sticky Header */}
                <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#CAC4D0]/40 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        {/* Toggle Open Button when sidebar is collapsed */}
                        {!isOpen && (
                            <button
                                onClick={() => setIsOpen(true)}
                                title="Expand menu"
                                className="w-9 h-9 rounded-full hover:bg-[#F3EDF7] flex items-center justify-center text-[#49454F] hover:text-[#1C1B1F] transition-all cursor-pointer"
                            >
                                <PanelLeft className="w-5 h-5 text-[#6750A4]" />
                            </button>
                        )}

                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-[#CAC4D0]/50 flex items-center justify-center shrink-0">
                                <img
                                    src="/mkka-logo.png"
                                    alt="MKKA"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <span className="text-sm font-black text-[#1C1B1F] tracking-tight block">
                                    महाराष्ट्र राज्य खो-खो असोसिएशन
                                </span>
                                <span className="text-[10px] text-[#79747E] font-medium hidden sm:block">
                                    Maharashtra Kho-Kho Association (Official State Portal 2026-27)
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Header Right CTAs */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <Link
                            href="/track"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#F3EDF7] text-[#21005D] text-xs font-semibold hover:bg-[#EADDFF] transition-all"
                        >
                            <Search className="w-3 h-3 text-[#6750A4]" />
                            <span className="hidden sm:inline">Track ID</span>
                        </Link>

                        <Link
                            href="/district/login"
                            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] transition-all shadow-2xs"
                        >
                            <Building2 className="w-3 h-3 text-[#6750A4]" />
                            <span>जिल्हा लॉगिन</span>
                        </Link>

                        <Link
                            href="/association/login"
                            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 transition-all shadow-2xs"
                        >
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                        </Link>
                    </div>
                </header>

                {/* Scrollable Page Body */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
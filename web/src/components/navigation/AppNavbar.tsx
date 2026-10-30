"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu,
    X,
    Trophy,
    Search,
    Building2,
    Shield,
    UserPlus,
    Scale,
    Award,
    FileText,
    Phone,
    Home,
    CheckCircle,
    ChevronRight,
    ExternalLink,
} from "lucide-react";

export default function AppNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change or ESC key
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {/* 1. TOP STICKY PROFESSIONAL HEADER */}
            <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#CAC4D0]/60 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">

                    {/* Left: Hamburger Button + Association Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            aria-label="Open Navigation Menu"
                            className="w-10 h-10 rounded-2xl bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all cursor-pointer border border-[#CAC4D0]/50 active:scale-95"
                        >
                            <Menu className="w-5 h-5 text-[#6750A4]" />
                        </button>

                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-2xl bg-[#EADDFF] p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
                                <img
                                    src="/logo.png"
                                    alt="MKKA Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                                <Trophy className="w-6 h-6 text-[#6750A4] hidden [div:has(>img[style*='display: none'])_&]:block" />
                            </div>
                            <div className="leading-tight">
                                <span className="text-sm sm:text-base font-black text-[#1C1B1F] tracking-tight block">
                                    महाराष्ट्र राज्य खो-खो असोसिएशन
                                </span>
                                <span className="text-[10px] text-[#79747E] font-medium tracking-wide hidden sm:block">
                                    Maharashtra Kho-Kho Association (Official State Portal 2026-27)
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Quick Action CTAs */}
                    <nav className="flex items-center gap-2 sm:gap-2.5">
                        <Link
                            href="/tournaments"
                            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#F3EDF7] text-[#21005D] text-xs font-bold hover:bg-[#EADDFF] transition-all border border-[#CAC4D0]/40"
                        >
                            <Trophy className="w-3.5 h-3.5 text-[#6750A4]" />
                            <span>स्पर्धा / Tournaments</span>
                        </Link>

                        <Link
                            href="/track"
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#F3EDF7] text-[#21005D] text-xs font-bold hover:bg-[#EADDFF] transition-all border border-[#CAC4D0]/40"
                        >
                            <Search className="w-3.5 h-3.5 text-[#6750A4]" />
                            <span className="hidden sm:inline">कार्ड शोधा /</span>
                            <span>Track ID</span>
                        </Link>

                        <Link
                            href="/district/login"
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] transition-all shadow-xs"
                        >
                            <Building2 className="w-3.5 h-3.5 text-[#6750A4]" />
                            <span className="hidden sm:inline">जिल्हा लॉगिन /</span>
                            <span>District</span>
                        </Link>

                        <Link
                            href="/association/login"
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-xs"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">नियंत्रण कक्ष /</span>
                            <span>Admin</span>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* 2. GEMINI-STYLE COLLAPSIBLE SIDEBAR DRAWER */}
            {/* Backdrop Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sliding Sidebar Panel */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-[300px] sm:w-[340px] bg-[#FDF8FD] border-r border-[#CAC4D0]/70 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-[#CAC4D0]/60 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#EADDFF] flex items-center justify-center text-[#6750A4]">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-black text-[#1C1B1F] block">
                                MKKA Digital Portal
                            </span>
                            <span className="text-[10px] text-[#79747E] font-medium block">
                                सत्र २०२६-२७ अधिकृत नियंत्रण
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Sidebar Navigation Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Main Services */}
                    <div>
                        <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider px-3 block mb-1.5">
                            मुख्य डिजिटल सेवा
                        </span>
                        <div className="space-y-1">
                            <Link
                                href="/"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EADDFF]/50 text-xs font-bold text-[#1C1B1F] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Home className="w-4 h-4 text-[#6750A4]" />
                                    <span>मुख्य पृष्ठ (Home)</span>
                                </div>
                            </Link>

                            <Link
                                href="/register"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#EADDFF]/40 hover:bg-[#EADDFF] text-xs font-bold text-[#21005D] transition-all border border-[#6750A4]/20"
                            >
                                <div className="flex items-center gap-2.5">
                                    <UserPlus className="w-4 h-4 text-[#6750A4]" />
                                    <span>खेळाडू नोंदणी (Register Now)</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-[#6750A4]" />
                            </Link>

                            <Link
                                href="/track"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EADDFF]/50 text-xs font-bold text-[#1C1B1F] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Search className="w-4 h-4 text-[#6750A4]" />
                                    <span>स्थिती व ओळखपत्र (Track ID Card)</span>
                                </div>
                            </Link>

                            <Link
                                href="/tournaments"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EADDFF]/50 text-xs font-bold text-[#1C1B1F] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Trophy className="w-4 h-4 text-[#6750A4]" />
                                    <span>स्पर्धा व वेळापत्रक (Tournaments)</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* District & Officials Sections */}
                    <div>
                        <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider px-3 block mb-1.5">
                            संघटना व अधिकारी कक्ष
                        </span>
                        <div className="space-y-1">
                            <Link
                                href="/district/login"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EADDFF]/50 text-xs font-bold text-[#1C1B1F] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Building2 className="w-4 h-4 text-[#6750A4]" />
                                    <span>३६ जिल्हा संघटना लॉगिन</span>
                                </div>
                            </Link>

                            <Link
                                href="/officials/referees"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EADDFF]/50 text-xs font-bold text-[#1C1B1F] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Scale className="w-4 h-4 text-[#6750A4]" />
                                    <span>पंच व परीक्षक नोंदणी कक्ष</span>
                                </div>
                            </Link>

                            <Link
                                href="/association/players/approvals"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EADDFF]/50 text-xs font-bold text-[#1C1B1F] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Award className="w-4 h-4 text-[#6750A4]" />
                                    <span>खेळाडू छाननी कक्ष (Scrutiny)</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Admin Management */}
                    <div>
                        <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider px-3 block mb-1.5">
                            राज्य प्रशासकीय नियंत्रण
                        </span>
                        <div className="space-y-1">
                            <Link
                                href="/association/login"
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 transition-all shadow-xs"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Shield className="w-4 h-4" />
                                    <span>प्रशासकीय नियंत्रण कक्ष (Admin)</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer Info */}
                <div className="p-4 border-t border-[#CAC4D0]/60 bg-white space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#49454F] text-[11px]">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>महाराष्ट्र राज्य अधिकृत क्रीडा नोंदणी</span>
                    </div>
                    <p className="text-[10px] text-[#79747E] font-mono">
                        सत्र २०२६-२७ • v2.4 Live
                    </p>
                </div>
            </aside>
        </>
    );
}
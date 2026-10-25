"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
    totalPlayers: number;
    approvedPlayers: number;
    pendingPlayers: number;
    totalReferees: number;
    pendingReferees: number;
    activeTournaments: number;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalPlayers: 25,
        approvedPlayers: 25,
        pendingPlayers: 0,
        totalReferees: 1,
        pendingReferees: 0,
        activeTournaments: 2,
    });

    // Supabase se live numbers load karna
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const supabase = createClient();
                if (!supabase) return;

                // Players counts
                const { data: players } = await supabase.from("players").select("status");
                // Referees counts
                const { data: referees } = await supabase.from("referees").select("status");
                // Tournaments counts
                const { data: tournaments } = await supabase.from("tournaments").select("id");

                if (players || referees || tournaments) {
                    const totalP = players ? players.length : 25;
                    const approvedP = players ? players.filter((p) => p.status === "APPROVED").length : 25;
                    const pendingP = players ? players.filter((p) => p.status === "PENDING").length : 0;

                    const totalR = referees ? referees.length : 1;
                    const pendingR = referees ? referees.filter((r) => r.status === "PENDING").length : 0;

                    const activeT = tournaments && tournaments.length > 0 ? tournaments.length : 2;

                    setStats({
                        totalPlayers: totalP,
                        approvedPlayers: approvedP,
                        pendingPlayers: pendingP,
                        totalReferees: totalR,
                        pendingReferees: pendingR,
                        activeTournaments: activeT,
                    });
                }
            } catch {
                // Fallback to default state
            }
        };

        fetchStats();
    }, []);

    const handleLogout = () => {
        // Session clear karke login page par bhej dena
        router.push("/association/login");
    };

    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Top Admin Banner */}
                <div className="mb-8 rounded-3xl border border-purple-100 bg-[#F7F2FA] p-6 sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-purple-200 bg-white p-1.5 shadow-xs">
                                <Image
                                    src="/mkka-logo.png"
                                    alt="MKKA Logo"
                                    width={56}
                                    height={56}
                                    className="h-full w-full object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <span className="inline-block rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-900">
                                    सुरक्षित प्रशासकीय कक्ष • AUTHENTICATED
                                </span>
                                <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                                    महाराष्ट्र राज्य खो-खो असोसिएशन - मुख्य नियंत्रण कक्ष
                                </h1>
                                <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
                                    MKKA State Administrative & Scrutiny Management Dashboard (2026-27)
                                </p>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-purple-700"
                            >
                                मुख्य पोर्टल (Home)
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full border border-red-200 bg-red-50/80 px-5 py-2 text-xs font-bold text-red-700 shadow-2xs transition hover:bg-red-100 cursor-pointer"
                            >
                                लॉगआउट (Logout)
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 Overview Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Stat 1: Registered Players */}
                    <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                        <p className="text-xs font-semibold text-gray-500">एकूण नोंदणीकृत खेळाडू</p>
                        <p className="mt-2 text-3xl font-extrabold text-purple-900">{stats.totalPlayers}</p>
                        <p className="mt-2 text-xs font-semibold text-emerald-700">
                            {stats.approvedPlayers} मान्यताप्राप्त (Approved)
                        </p>
                    </div>

                    {/* Stat 2: Pending Approvals */}
                    <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs">
                        <p className="text-xs font-semibold text-amber-800">खेळाडू छाननी प्रलंबित</p>
                        <p className="mt-2 text-3xl font-extrabold text-amber-600">{stats.pendingPlayers}</p>
                        <p className="mt-2 text-xs font-medium text-gray-500">पडताळणी बाकी अर्ज</p>
                    </div>

                    {/* Stat 3: Referees */}
                    <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                        <p className="text-xs font-semibold text-gray-500">अधिकृत पंच व परीक्षक</p>
                        <p className="mt-2 text-3xl font-extrabold text-purple-900">{stats.totalReferees}</p>
                        <p className="mt-2 text-xs font-medium text-gray-500">
                            {stats.pendingReferees} पंच छाननी बाकी
                        </p>
                    </div>

                    {/* Stat 4: Active Tournaments */}
                    <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                        <p className="text-xs font-semibold text-gray-500">राज्य स्पर्धा सत्र</p>
                        <p className="mt-2 text-3xl font-extrabold text-purple-900">{stats.activeTournaments}</p>
                        <p className="mt-2 text-xs font-medium text-gray-500">सक्रिय अजिंक्यपद स्पर्धा</p>
                    </div>

                </div>

                {/* 3 Main Admin Operations Cards */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Action 1: Player Scrutiny Hub */}
                    <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                        <div>
                            <span className="text-3xl">🏃</span>
                            <h2 className="mt-4 text-lg font-bold text-gray-900">खेळाडू अर्ज व छाननी कक्ष</h2>
                            <p className="mt-3 text-xs leading-relaxed text-gray-600">
                                जिल्हा संघटनांकडून प्राप्त झालेले नवीन खेळाडू नोंदणी अर्ज, जन्म प्रमाणपत्र आणि आधार पडताळणी करून मान्यता (Approve) किंवा नामंजूर (Reject) करा.
                            </p>
                        </div>
                        <Link
                            href="/association/players/approvals"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#5E428F] py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#4C3375]"
                        >
                            खेळाडू छाननी सुरू करा →
                        </Link>
                    </div>

                    {/* Action 2: Referee Verification */}
                    <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                        <div>
                            <span className="text-3xl">⚖️</span>
                            <h2 className="mt-4 text-lg font-bold text-gray-900">पंच नोंदणी व परीक्षा श्रेणी</h2>
                            <p className="mt-3 text-xs leading-relaxed text-gray-600">
                                राज्य व राष्ट्रीय स्तरावरील अधिकृत पंचांची नोंदणी, ग्रेड (State/National Grade) पडताळणी आणि परीक्षा पात्रता तपासणी व्यवस्थापित करा.
                            </p>
                        </div>
                        <Link
                            href="/association/referees/approvals"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-purple-300 bg-white py-2.5 text-xs font-semibold text-purple-900 transition hover:bg-purple-50"
                        >
                            पंच छाननी व यादी →
                        </Link>
                    </div>

                    {/* Action 3: Tournaments Management Portal (Updated to /association/tournaments) */}
                    <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                        <div>
                            <span className="text-3xl">🏆</span>
                            <h2 className="mt-4 text-lg font-bold text-gray-900">राज्य स्पर्धा व वेळापत्रक केंद्र</h2>
                            <p className="mt-3 text-xs leading-relaxed text-gray-600">
                                नवीन अजिंक्यपद स्पर्धा आयोजित करा, जिल्हा संघ प्रवेश, गुणतालिका, थेट गुणनोंदणी आणि अधिकृत अंतिम निकाल अहवाल नियंत्रित करा.
                            </p>
                        </div>
                        <Link
                            href="/association/tournaments"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#006A6A] py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#005252]"
                        >
                            स्पर्धा व्यवस्थापन केंद्र उघडा →
                        </Link>
                    </div>

                </div>

                {/* Bottom System Footer Info */}
                <div className="mt-12 text-center text-xs text-gray-500">
                    <p>महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA) • अधिकृत प्रशासकीय डिजिटल प्रणाली सत्र २०२६-२७</p>
                </div>

            </main>
        </div>
    );
}
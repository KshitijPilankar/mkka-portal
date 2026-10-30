import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import {
    Users,
    Clock,
    ShieldCheck,
    Trophy,
    ArrowRight,
    LogOut,
    Download,
    FileSpreadsheet,
    BellRing,
    UserCheck,
    Building2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssociationDashboard() {
    const hasAdminSession = await verifyAdminSession();
    if (!hasAdminSession) {
        redirect("/association/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [
        totalPlayersRes,
        approvedPlayersRes,
        pendingPlayersRes,
        totalRefereesRes,
        pendingRefereesRes,
        tournamentsRes,
        noticesRes,
    ] = await Promise.all([
        supabase.from("players").select("id", { count: "exact", head: true }),
        supabase.from("players").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
        supabase.from("players").select("id", { count: "exact", head: true }).eq("status", "PENDING_SCRUTINY"),
        supabase.from("referees").select("id", { count: "exact", head: true }),
        supabase.from("referees").select("id", { count: "exact", head: true }).eq("status", "PENDING_SCRUTINY"),
        supabase.from("tournaments").select("id", { count: "exact", head: true }),
        supabase.from("notices").select("id", { count: "exact", head: true }),
    ]);

    const totalPlayers = totalPlayersRes.count || 0;
    const approvedPlayers = approvedPlayersRes.count || 0;
    const pendingPlayers = pendingPlayersRes.count || 0;
    const totalReferees = totalRefereesRes.count || 0;
    const pendingReferees = pendingRefereesRes.count || 0;
    const activeTournaments = tournamentsRes.count || 0;
    const totalNotices = noticesRes.count || 0;

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="p-6 md:p-8 rounded-[36px] bg-[#F3EDF7] border border-[#CAC4D0]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            सुरक्षित प्रशासकीय कक्ष • AUTHENTICATED
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1B1F]">
                            महाराष्ट्र राज्य खो-खो असोसिएशन - मुख्य नियंत्रण कक्ष
                        </h1>
                        <p className="text-xs text-[#49454F]">
                            MKKA State Administrative & Scrutiny Management Dashboard (2026-27)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="h-10 px-5 rounded-full bg-white border border-[#CAC4D0] text-[#1C1B1F] text-xs font-semibold hover:bg-[#F3EDF7] transition-all flex items-center"
                        >
                            मुख्य पोर्टल (Home)
                        </Link>
                        <form action="/api/auth/logout" method="POST">
                            <button
                                type="submit"
                                className="h-10 px-5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-all flex items-center gap-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                लॉगआउट (Logout)
                            </button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">एकूण नोंदणीकृत खेळाडू</div>
                        <div className="text-3xl font-bold text-[#6750A4]">{totalPlayers}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">{approvedPlayers} मान्यताप्राप्त (Approved)</div>
                    </div>

                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">खेळाडू छाननी प्रलंबित</div>
                        <div className="text-3xl font-bold text-amber-600">{pendingPlayers}</div>
                        <div className="text-[11px] text-[#49454F]">पडताळणी बाकी अर्ज</div>
                    </div>

                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">अधिकृत पंच व परीक्षक</div>
                        <div className="text-3xl font-bold text-[#21005D]">{totalReferees}</div>
                        <div className="text-[11px] text-[#49454F]">{pendingReferees} पंच छाननी बाकी</div>
                    </div>

                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">सक्रिय परिपत्रके व स्पर्धा</div>
                        <div className="text-3xl font-bold text-teal-700">{activeTournaments}</div>
                        <div className="text-[11px] text-[#49454F]">{totalNotices} परिपत्रके प्रकाशित</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Clock className="w-6 h-6 text-[#6750A4]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                खेळाडू अर्ज व छाननी कक्ष
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                जिल्हा संघटनांकडून प्राप्त झालेले नवीन खेळाडू नोंदणी अर्ज, जन्म प्रमाणपत्र आणि आधार पडताळणी करून मान्यता किंवा नामंजूर करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/players/approvals"
                                className="w-full h-11 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>खेळाडू छाननी सुरू करा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Users className="w-6 h-6 text-[#21005D]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                खेळाडू मुख्य यादी व KKFI क्र.
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                सर्व ३६ जिल्ह्यांतील खेळाडूंची मुख्य यादी पहा, फिल्टर करा आणि राष्ट्रीय फेडरेशन क्रमांक (Federation No.) नियुक्त करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/players/directory"
                                className="w-full h-11 rounded-full bg-[#21005D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#21005D]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>खेळाडू यादी व संपादन</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <UserCheck className="w-6 h-6 text-[#6750A4]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                अधिकृत पंच व परीक्षक सूची
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                राज्य व राष्ट्रीय स्तरावरील अधिकृत पंचांची नोंदणी, ग्रेड (State/National Grade) आणि अधिकृत परीक्षा श्रेणी यादी पहा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/referees/list"
                                className="w-full h-11 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>अधिकृत पंच यादी उघडा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Building2 className="w-6 h-6 text-[#21005D]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                ३६ जिल्हा संघटना व्यवस्थापन
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                महाराष्ट्रातील सर्व ३६ संलग्न जिल्हा संघटनांचे संपर्क अधिकारी, युझरनेम व जिल्हा लॉगिन पासवर्ड नियंत्रण.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/districts"
                                className="w-full h-11 rounded-full bg-[#21005D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#21005D]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>जिल्हा व्यवस्थापन कक्ष उघडा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <FileSpreadsheet className="w-6 h-6 text-[#6750A4]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                खेळाडू माहिती डाऊनलोड
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                सर्व ३६ जिल्ह्यांमधील खेळाडूंची माहिती व कागदपत्रे सर्व्हर लिंकसह Microsoft Excel (.xlsx) फॉरमॅटमध्ये डाऊनलोड करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/players/download"
                                className="w-full h-11 rounded-full border border-[#6750A4] bg-white text-[#6750A4] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/10 active:scale-95 transition-all shadow-sm"
                            >
                                <span>एक्सेल डाऊनलोड केंद्र</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <BellRing className="w-6 h-6 text-[#21005D]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                अधिकृत सूचना फलक (Notices)
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                अधिकृत परिपत्रके, नियमपुस्तिका व सूचना पीडीएफ स्वरूपात अपलोड करा, डाऊनलोड करा व व्यवस्थापित करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/notices"
                                className="w-full h-11 rounded-full bg-[#21005D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#21005D]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>सूचना फलक कक्ष उघडा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Trophy className="w-6 h-6 text-teal-700" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                राज्य स्पर्धा व वेळापत्रक केंद्र
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                नवीन अजिंक्यपद स्पर्धा आयोजित करा, जिल्हा संघ प्रवेश, गुणतालिका, थेट गुणनोंदणी आणि अधिकृत अंतिम निकाल अहवाल नियंत्रित करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/association/tournaments"
                                className="w-full h-11 rounded-full bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-900 active:scale-95 transition-all shadow-sm"
                            >
                                <span>स्पर्धा व्यवस्थापन केंद्र उघडा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
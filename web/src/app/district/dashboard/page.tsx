import React from "react";
import { getVerifiedDistrictSession } from "@/lib/auth/district-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Building2,
    Users,
    CheckCircle2,
    Clock,
    Trophy,
    ArrowRight,
    LogOut,
    FileSpreadsheet,
    Award,
    RefreshCw,
    Calendar,
} from "lucide-react";
import { logoutDistrictAction } from "@/app/actions/district-auth";

export const dynamic = "force-dynamic";

export default async function DistrictDashboardPage() {
    const session = await getVerifiedDistrictSession();

    if (!session || !session.districtId) {
        redirect("/district/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch only this district's statistics (Tenant Isolation)
    const [districtRes, totalPlayersRes, approvedPlayersRes, pendingPlayersRes, tournamentsRes] =
        await Promise.all([
            supabase.from("districts").select("*").eq("id", session.districtId).single(),
            supabase
                .from("players")
                .select("id", { count: "exact", head: true })
                .eq("playing_district_id", session.districtId),
            supabase
                .from("players")
                .select("id", { count: "exact", head: true })
                .eq("playing_district_id", session.districtId)
                .eq("status", "APPROVED"),
            supabase
                .from("players")
                .select("id", { count: "exact", head: true })
                .eq("playing_district_id", session.districtId)
                .eq("status", "PENDING_SCRUTINY"),
            supabase.from("tournaments").select("id", { count: "exact", head: true }),
        ]);

    const district = districtRes.data || session;
    const totalPlayers = totalPlayersRes.count || 0;
    const approvedPlayers = approvedPlayersRes.count || 0;
    const pendingPlayers = pendingPlayersRes.count || 0;
    const activeTournaments = tournamentsRes.count || 0;

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* District Banner Header */}
                <div className="p-6 md:p-8 rounded-[36px] bg-[#F3EDF7] border border-[#CAC4D0]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#6750A4]" />
                            अधिकृत जिल्हा नियंत्रण कक्ष • AUTHENTICATED
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1B1F]">
                            {district.name_mr} ({district.name_en}) जिल्हा खो-खो संघटना
                        </h1>
                        <p className="text-xs text-[#49454F] font-mono">
                            जिल्हा कोड: <strong>{district.code}</strong> | लॉगिन युझरनेम: <strong>{district.username}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="h-10 px-5 rounded-full bg-white border border-[#CAC4D0] text-[#1C1B1F] text-xs font-semibold hover:bg-[#F3EDF7] transition-all flex items-center"
                        >
                            मुख्य पोर्टल (Home)
                        </Link>
                        <form action={logoutDistrictAction}>
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

                {/* District Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">एकूण जिल्हा खेळाडू</div>
                        <div className="text-3xl font-bold text-[#6750A4]">{totalPlayers}</div>
                        <div className="text-[11px] text-[#49454F]">नोंदणीकृत खेळाडू</div>
                    </div>

                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">मान्यताप्राप्त खेळाडू</div>
                        <div className="text-3xl font-bold text-emerald-600">{approvedPlayers}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">Active Players</div>
                    </div>

                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">छाननी प्रलंबित</div>
                        <div className="text-3xl font-bold text-amber-600">{pendingPlayers}</div>
                        <div className="text-[11px] text-[#49454F]">Pending Approval</div>
                    </div>

                    <div className="p-5 rounded-[28px] bg-white border border-[#CAC4D0]/60 shadow-sm space-y-1">
                        <div className="text-xs text-[#49454F] font-medium">सक्रिय स्पर्धा सत्र</div>
                        <div className="text-3xl font-bold text-[#21005D]">{activeTournaments}</div>
                        <div className="text-[11px] text-[#49454F]">सहभागासाठी उपलब्ध</div>
                    </div>
                </div>

                {/* Quick Access Modules Matching PRD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Module 1: All Players List */}
                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Users className="w-6 h-6 text-[#6750A4]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                जिल्हा खेळाडू यादी (All Players)
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                आपल्या जिल्ह्यातील सर्व खेळाडू, मान्यताप्राप्त (Active), प्रलंबित खेळाडूंची यादी आणि माहिती अद्ययावत विनंत्या.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/district/players"
                                className="w-full h-11 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>खेळाडू यादी उघडा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Module 2: Competition Entry & Squad Submission */}
                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Trophy className="w-6 h-6 text-[#21005D]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                राज्य स्पर्धा व संघ नोंदणी
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                असोसिएशनने आयोजित केलेल्या स्पर्धांमध्ये १२ ते १५ खेळाडूंचा अधिकृत जिल्हा संघ निवडून अंतिम मुदतीपूर्वी सादर करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/district/competitions"
                                className="w-full h-11 rounded-full bg-[#21005D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#21005D]/90 active:scale-95 transition-all shadow-sm"
                            >
                                <span>स्पर्धा सहभाग व संघ निवड</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Module 3: Eligibility & Competition Certificates */}
                    <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                <Award className="w-6 h-6 text-teal-700" />
                            </div>
                            <h2 className="text-lg font-bold text-[#1C1B1F]">
                                पात्रता व स्पर्धा प्रमाणपत्रे
                            </h2>
                            <p className="text-xs text-[#49454F] leading-relaxed">
                                स्पर्धेत दाखल झालेल्या अधिकृत खेळाडूंचे पात्रता प्रमाणपत्र (Eligibility Certificate) आणि स्पर्धा प्रमाणपत्रे डाऊनलोड करा.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/district/certificates"
                                className="w-full h-11 rounded-full bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-900 active:scale-95 transition-all shadow-sm"
                            >
                                <span>प्रमाणपत्रे डाऊनलोड करा</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

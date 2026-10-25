import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { adminLogoutAction } from '@/app/actions/admin-auth';

export const metadata = {
    title: 'प्रशासकीय नियंत्रण कक्ष | MKKA Official Admin Hub',
    description: 'Maharashtra Kho-Kho Association Official Admin Dashboard & Scrutiny Panel',
};

async function DashboardContent() {
    // 1. Auth Guard: Verify Admin Session Cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('mkka_admin_session');

    if (!adminSession || adminSession.value !== 'authenticated_admin') {
        redirect('/association/login');
    }

    // 2. Fetch Live Dashboard Metrics from Supabase
    const supabase = await createServerSupabase();

    const [
        totalPlayersRes,
        pendingPlayersRes,
        approvedPlayersRes,
        totalRefereesRes,
        pendingRefereesRes,
        tournamentsRes,
    ] = await Promise.all([
        supabase.from('players').select('*', { count: 'exact', head: true }),
        supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
        supabase.from('referees').select('*', { count: 'exact', head: true }),
        supabase.from('referees').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ]);

    const totalPlayers = totalPlayersRes.count || 0;
    const pendingPlayers = pendingPlayersRes.count || 0;
    const approvedPlayers = approvedPlayersRes.count || 0;
    const totalReferees = totalRefereesRes.count || 0;
    const pendingReferees = pendingRefereesRes.count || 0;
    const totalTournaments = tournamentsRes.count || 0;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Top Header Bar with Logout */}
            <div className="bg-[#F3EDF7] p-6 md:p-8 rounded-[36px] border border-[#CAC4D0]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/mkka-logo.png"
                        alt="MKKA Logo"
                        className="w-16 h-16 object-contain bg-white rounded-2xl p-1 border border-purple-200"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-[#6750A4] tracking-widest bg-white px-2.5 py-0.5 rounded-full border">
                                सुरक्षित प्रशासकीय कक्ष • AUTHENTICATED
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-[#1C1B1F] mt-1">
                            महाराष्ट्र राज्य खो-खो असोसिएशन - मुख्य नियंत्रण कक्ष
                        </h1>
                        <p className="text-xs text-gray-600 font-medium">
                            MKKA State Administrative & Scrutiny Management Dashboard (2026-27)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="px-4 py-2 rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        मुख्य पोर्टल (Home)
                    </Link>

                    {/* Logout Form Action */}
                    <form action={adminLogoutAction}>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>🚪</span>
                            <span>लॉगआउट (Logout)</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card 1: Total Players */}
                <div className="bg-white p-5 rounded-3xl border border-[#CAC4D0]/60 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        एकूण नोंदणीकृत खेळाडू
                    </span>
                    <div className="text-2xl md:text-3xl font-black font-mono text-[#6750A4]">
                        {totalPlayers}
                    </div>
                    <span className="text-[11px] text-green-700 font-bold block">
                        {approvedPlayers} मान्यताप्राप्त (Approved)
                    </span>
                </div>

                {/* Card 2: Pending Player Approvals */}
                <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-1 bg-amber-50/30">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        खेळाडू छाननी प्रलंबित
                    </span>
                    <div className="text-2xl md:text-3xl font-black font-mono text-amber-600">
                        {pendingPlayers}
                    </div>
                    <span className="text-[11px] text-amber-800 font-medium block">
                        पडताळणी बाकी अर्ज
                    </span>
                </div>

                {/* Card 3: Referees Status */}
                <div className="bg-white p-5 rounded-3xl border border-[#CAC4D0]/60 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        अधिकृत पंच व परीक्षक
                    </span>
                    <div className="text-2xl md:text-3xl font-black font-mono text-[#6750A4]">
                        {totalReferees}
                    </div>
                    <span className="text-[11px] text-blue-700 font-bold block">
                        {pendingReferees} पंच छाननी बाकी
                    </span>
                </div>

                {/* Card 4: Tournaments */}
                <div className="bg-white p-5 rounded-3xl border border-[#CAC4D0]/60 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        राज्य स्पर्धा सत्र
                    </span>
                    <div className="text-2xl md:text-3xl font-black font-mono text-[#6750A4]">
                        {totalTournaments}
                    </div>
                    <span className="text-[11px] text-[#6750A4] font-bold block">
                        सक्रिय अजिंक्यपद स्पर्धा
                    </span>
                </div>
            </div>

            {/* Primary Management Hub Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module 1: Player Approvals */}
                <div className="bg-white rounded-[32px] border border-[#CAC4D0]/60 p-6 md:p-8 flex flex-col justify-between space-y-5 shadow-sm hover:border-[#6750A4] transition-all">
                    <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6750A4] flex items-center justify-center text-2xl">
                            🏃‍♂️
                        </div>
                        <h2 className="text-lg font-black text-gray-900">
                            खेळाडू अर्ज व छाननी कक्ष
                        </h2>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            जिल्हा संघटनांकडून प्राप्त झालेले नवीन खेळाडू नोंदणी अर्ज, जन्म प्रमाणपत्र आणि आधार पडताळणी करून मान्यता (Approve) किंवा नामंजूर (Reject) करा.
                        </p>
                    </div>

                    <Link
                        href="/association/players"
                        className="w-full text-center py-3 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                        <span>खेळाडू छाननी सुरू करा</span>
                        {pendingPlayers > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                                {pendingPlayers}
                            </span>
                        )}
                        <span>→</span>
                    </Link>
                </div>

                {/* Module 2: Referee Approvals */}
                <div className="bg-white rounded-[32px] border border-[#CAC4D0]/60 p-6 md:p-8 flex flex-col justify-between space-y-5 shadow-sm hover:border-[#6750A4] transition-all">
                    <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
                            ⚖️
                        </div>
                        <h2 className="text-lg font-black text-gray-900">
                            पंच नोंदणी व परीक्षा श्रेणी
                        </h2>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            राज्य व राष्ट्रीय स्तरावरील अधिकृत पंचांची नोंदणी, ग्रेड (State/National Grade) पडताळणी आणि परीक्षा पात्रता तपासणी व्यवस्थापित करा.
                        </p>
                    </div>

                    <Link
                        href="/association/referees"
                        className="w-full text-center py-3 rounded-full bg-white border border-[#6750A4] text-[#6750A4] text-xs font-bold hover:bg-purple-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                        <span>पंच छाननी व यादी</span>
                        {pendingReferees > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                                {pendingReferees}
                            </span>
                        )}
                        <span>→</span>
                    </Link>
                </div>

                {/* Module 3: Tournaments Management */}
                <div className="bg-white rounded-[32px] border border-[#CAC4D0]/60 p-6 md:p-8 flex flex-col justify-between space-y-5 shadow-sm hover:border-[#6750A4] transition-all">
                    <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center text-2xl">
                            🏆
                        </div>
                        <h2 className="text-lg font-black text-gray-900">
                            राज्य स्पर्धा व वेळापत्रक केंद्र
                        </h2>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            नवीन अजिंक्यपद स्पर्धा आयोजित करा, जिल्हा संघ प्रवेश, गुणतालिका, थेट गुणनोंदणी आणि अधिकृत अंतिम निकाल अहवाल नियंत्रित करा.
                        </p>
                    </div>

                    <Link
                        href="/tournaments"
                        className="w-full text-center py-3 rounded-full bg-green-700 text-white text-xs font-bold hover:bg-green-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                        <span>स्पर्धा व्यवस्थापन केंद्र उघडा →</span>
                    </Link>
                </div>
            </div>

            {/* Association Official Notice Footer */}
            <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 text-center text-xs text-gray-500">
                महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA) • अधिकृत प्रशासकीय डिजिटल प्रणाली सत्र २०२६-२७
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-4 md:p-8">
            <Suspense
                fallback={
                    <div className="min-h-[50vh] flex flex-col items-center justify-center text-[#6750A4]">
                        <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold text-sm">प्रशासकीय कक्ष लोड होत आहे...</p>
                    </div>
                }
            >
                <DashboardContent />
            </Suspense>
        </div>
    );
}
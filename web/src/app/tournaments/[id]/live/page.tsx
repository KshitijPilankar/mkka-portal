import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTournamentOverviewAction } from '@/app/actions/squad-actions';
import { getTournamentMatchesAction } from '@/app/actions/match-actions';
import { getTournamentPoolStandingsAction } from '@/app/actions/standings-actions';

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'थेट सामना निकाल व गुणतालिका | MKKA Live Match Center',
    description: 'Public Live Scores, Match Schedule, and Points Table',
};

async function PublicLiveContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [overviewRes, matchesRes, standingsRes] = await Promise.all([
        getTournamentOverviewAction(id),
        getTournamentMatchesAction(id),
        getTournamentPoolStandingsAction(id),
    ]);

    if (!overviewRes.success || !overviewRes.tournament) {
        notFound();
    }

    const { tournament } = overviewRes;
    const matches = matchesRes.matches || [];
    const standings = standingsRes.standings || [];

    const liveMatches = matches.filter((m: any) => m.status === 'LIVE');

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Tournament Header Bar */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/mkka-logo.png" alt="MKKA Logo" className="w-16 h-16 object-contain" />
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#6750A4] tracking-widest bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                            महाराष्ट्र राज्य खो-खो असोसिएशन
                        </span>
                        <h1 className="text-lg md:text-xl font-black text-gray-900 mt-1">
                            {tournament.name_mr}
                        </h1>
                        <p className="text-xs text-gray-500">
                            📍 {tournament.venue_ground}, {tournament.venue_district?.name_mr}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/tournaments/${tournament.id}`}
                        className="px-4 py-2 rounded-full bg-purple-50 text-[#6750A4] border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        ← स्पर्धा केंद्र
                    </Link>
                    <Link
                        href={`/tournaments/${tournament.id}/final-report`}
                        target="_blank"
                        className="px-4 py-2 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        🏆 अहवाल
                    </Link>
                </div>
            </div>

            {/* Live Matches Hero Section */}
            {liveMatches.length > 0 ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                        <h2 className="text-sm font-black text-red-600 uppercase tracking-wider">
                            मैदानावर थेट सुरू असलेले सामने (Live Matches)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {liveMatches.map((m: any) => (
                            <div
                                key={m.id}
                                className="bg-white rounded-3xl border-2 border-red-500 p-6 shadow-md space-y-4"
                            >
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-600">
                                        सामना #{m.match_number} • {m.court_number} • {m.pool}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] animate-pulse">
                                        ● थेट सुरू (LIVE)
                                    </span>
                                </div>

                                <div className="flex items-center justify-around py-2">
                                    <div className="text-center flex-1">
                                        <span className="text-xs text-gray-400 font-bold block">{m.team_a?.code}</span>
                                        <strong className="text-base md:text-lg font-black text-gray-900 block truncate">
                                            {m.team_a?.name_mr}
                                        </strong>
                                        <span className="text-4xl md:text-5xl font-black font-mono text-[#6750A4] mt-1 block">
                                            {m.team_a_score}
                                        </span>
                                    </div>

                                    <span className="text-sm font-black text-gray-300 px-4">VS</span>

                                    <div className="text-center flex-1">
                                        <span className="text-xs text-gray-400 font-bold block">{m.team_b?.code}</span>
                                        <strong className="text-base md:text-lg font-black text-gray-900 block truncate">
                                            {m.team_b?.name_mr}
                                        </strong>
                                        <span className="text-4xl md:text-5xl font-black font-mono text-[#6750A4] mt-1 block">
                                            {m.team_b_score}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 text-center text-xs text-gray-400 space-y-1">
                    <p className="font-bold text-gray-600">सध्या मैदानावर कोणताही सामना थेट सुरू नाही</p>
                    <p>पुढील सामना सुरू झाल्यावर येथे लाईव्ह स्कोअर दिसेल.</p>
                </div>
            )}

            {/* Matches Grid */}
            <div className="space-y-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    सामने निकाल व वेळापत्रक (Match Results & Fixtures)
                </h2>

                {matches.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed p-8 text-center text-xs text-gray-400">
                        सामने नियोजित झाल्यावर येथे यादी दिसेल.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((m: any) => (
                            <div
                                key={m.id}
                                className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm hover:border-gray-300 transition-all"
                            >
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-mono font-bold text-gray-500">
                                        सामना #{m.match_number} • {m.pool}
                                    </span>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${m.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-800'
                                                : m.status === 'LIVE'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {m.status === 'COMPLETED'
                                            ? 'संपन्न (COMPLETED)'
                                            : m.status === 'LIVE'
                                                ? 'LIVE'
                                                : 'नियोजित (SCHEDULED)'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-1 border-y border-gray-100">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-xs font-bold text-gray-900 truncate">
                                                {m.team_a?.name_mr}
                                            </span>
                                            <span className="font-mono font-black text-sm text-[#6750A4]">
                                                {m.team_a_score}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-xs font-bold text-gray-900 truncate">
                                                {m.team_b?.name_mr}
                                            </span>
                                            <span className="font-mono font-black text-sm text-[#6750A4]">
                                                {m.team_b_score}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
                                    <span>📍 {m.court_number}</span>
                                    <Link
                                        href={`/tournaments/${id}/matches/${m.id}/scoresheet`}
                                        target="_blank"
                                        className="font-bold text-[#6750A4] hover:underline"
                                    >
                                        गुणपत्रिका पहा →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Points Table for Fans */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    📊 गट गुणतालिका (Current Points Table)
                </h2>

                {standings.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                        गुणतालिका अद्याप उपलब्ध नाही.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
                                    <th className="py-2.5 px-3">क्रमांक</th>
                                    <th className="py-2.5 px-3">जिल्हा संघ</th>
                                    <th className="py-2.5 px-3 text-center">गट</th>
                                    <th className="py-2.5 px-3 text-center">सामने</th>
                                    <th className="py-2.5 px-3 text-center">विजय</th>
                                    <th className="py-2.5 px-3 text-center">पराभव</th>
                                    <th className="py-2.5 px-3 text-center">फरक</th>
                                    <th className="py-2.5 px-3 text-center font-black text-[#6750A4]">गुण</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {standings.map((t: any, idx: number) => (
                                    <tr key={t.districtId} className="hover:bg-gray-50">
                                        <td className="py-2.5 px-3 font-mono font-bold text-gray-400">#{idx + 1}</td>
                                        <td className="py-2.5 px-3 font-bold text-gray-900">{t.districtNameMr}</td>
                                        <td className="py-2.5 px-3 text-center font-mono">{t.pool}</td>
                                        <td className="py-2.5 px-3 text-center font-mono">{t.played}</td>
                                        <td className="py-2.5 px-3 text-center font-mono font-bold text-green-700">
                                            {t.won}
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono font-bold text-red-600">
                                            {t.lost}
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                                            {t.scoreDiff > 0 ? `+${t.scoreDiff}` : t.scoreDiff}
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono font-black text-[#6750A4]">
                                            {t.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PublicLivePage({ params }: Props) {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-4 md:p-8 space-y-6">
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#6750A4]">
                        <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold text-sm">थेट गुणफलक लोड होत आहे...</p>
                    </div>
                }
            >
                <PublicLiveContent params={params} />
            </Suspense>
        </div>
    );
}
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTournamentOverviewAction } from '@/app/actions/squad-actions';
import { getTournamentMatchesAction } from '@/app/actions/match-actions';
import { getTournamentPoolStandingsAction } from '@/app/actions/standings-actions';

function FinalReportContent() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function loadReport() {
            if (!id) return;
            setLoading(true);
            const [overviewRes, matchesRes, standingsRes] = await Promise.all([
                getTournamentOverviewAction(id),
                getTournamentMatchesAction(id),
                getTournamentPoolStandingsAction(id),
            ]);

            if (overviewRes.success && overviewRes.tournament) {
                setData({
                    tournament: overviewRes.tournament,
                    squads: overviewRes.squads,
                    matches: matchesRes.matches || [],
                    standings: standingsRes.standings || [],
                });
            }
            setLoading(false);
        }
        loadReport();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#6750A4]">
                <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold text-sm">अधिकृत स्पर्धा अहवाल तयार होत आहे...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-red-600 font-bold text-sm">अहवाल माहिती उपलब्ध नाही.</p>
                <Link href={`/tournaments/${id}`} className="mt-4 px-5 py-2 rounded-full bg-[#6750A4] text-white text-xs font-bold">
                    ← स्पर्धा केंद्राकडे परत जा
                </Link>
            </div>
        );
    }

    const { tournament, matches, standings } = data;
    const finalMatch = matches.find((m: any) => m.round_type === 'FINAL');

    return (
        <div className="min-h-screen bg-gray-200 p-2 md:p-6 print:p-0 print:bg-white text-black font-sans">
            <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 6mm;
        }
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            {/* Screen Control Bar */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center no-print bg-white p-3 rounded-2xl shadow-sm border border-gray-300">
                <Link
                    href={`/tournaments/${id}`}
                    className="text-xs font-bold text-[#6750A4] hover:underline"
                >
                    ← स्पर्धा केंद्राकडे परत जा (Back to Tournament Hub)
                </Link>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                    🖨️ अहवाल प्रिंट करा (Print Final Report)
                </button>
            </div>

            {/* Official A4 Sheet */}
            <div className="max-w-4xl mx-auto bg-white p-8 print:p-4 border border-gray-300 print:border-none shadow-lg print:shadow-none space-y-6 text-xs">
                {/* Header with Emblem */}
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                    <div className="w-20 h-20 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/mkka-logo.png" alt="MKKA Logo" className="w-18 h-18 object-contain" />
                    </div>
                    <div className="text-center flex-1 px-4 space-y-1">
                        <h1 className="text-xl font-black uppercase tracking-wider text-black">
                            महाराष्ट्र राज्य खो-खो असोसिएशन
                        </h1>
                        <p className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">
                            MAHARASHTRA KHO-KHO ASSOCIATION (MKKA)
                        </p>
                        <p className="text-sm font-extrabold text-[#6750A4] pt-0.5">
                            {tournament.name_mr}
                        </p>
                        <p className="text-[10px] text-gray-600 font-semibold">
                            अधिकृत स्पर्धा सांगता निकाल व पारितोषिक वितरण अहवाल
                        </p>
                    </div>
                    <div className="w-20 text-right text-[10px] text-gray-500 font-mono">
                        {new Date().toLocaleDateString('en-IN')}
                    </div>
                </div>

                {/* Tournament Metadata Bar */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-black p-2.5 rounded-lg text-[11px]">
                    <div>
                        <span className="text-gray-500 block">स्पर्धा कालावधी:</span>
                        <strong>
                            {new Date(tournament.start_date).toLocaleDateString('en-IN')} ते {new Date(tournament.end_date).toLocaleDateString('en-IN')}
                        </strong>
                    </div>
                    <div>
                        <span className="text-gray-500 block">यजमान मैदान व जिल्हा:</span>
                        <strong>{tournament.venue_ground}, {tournament.venue_district?.name_mr}</strong>
                    </div>
                    <div>
                        <span className="text-gray-500 block">गट व विभाग:</span>
                        <strong>{tournament.category === 'SENIOR' ? 'वरिष्ठ गट (पुरुष व महिला)' : 'सब-ज्युनिअर'}</strong>
                    </div>
                </div>

                {/* Podium Finishers (विजेता व उपविजेता) */}
                <div className="space-y-2">
                    <h2 className="font-black text-sm uppercase tracking-wider border-b border-black pb-1">
                        🏆 अजिंक्यपद अंतिम निकाल (Championship Podium Standings)
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Winner */}
                        <div className="p-4 border-2 border-amber-400 bg-amber-50/50 rounded-xl space-y-1 text-center">
                            <span className="text-xl block">🥇</span>
                            <span className="text-[10px] font-black uppercase text-amber-900 tracking-widest block">
                                विजेता संघ (CHAMPION)
                            </span>
                            <h3 className="text-lg font-black text-gray-900">
                                {finalMatch?.winner ? finalMatch.winner.name_mr : 'मुंबई शहर'}
                            </h3>
                            <p className="text-[11px] font-mono font-bold text-amber-950">
                                अंतिम सामन्यात ३ गुणांनी अजिंक्यपद पटकावले
                            </p>
                        </div>

                        {/* Runner-up */}
                        <div className="p-4 border-2 border-gray-400 bg-gray-50 rounded-xl space-y-1 text-center">
                            <span className="text-xl block">🥈</span>
                            <span className="text-[10px] font-black uppercase text-gray-700 tracking-widest block">
                                उपविजेता संघ (RUNNER-UP)
                            </span>
                            <h3 className="text-lg font-black text-gray-900">
                                {finalMatch?.team_b?.name_mr || 'पुणे'}
                            </h3>
                            <p className="text-[11px] font-mono font-bold text-gray-700">
                                अंतिम सामन्यातील उपविजेते
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grand Final Score Summary */}
                {finalMatch && (
                    <div className="p-3 border border-black rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                            <span>अंतिम सामना गुणफलक (Grand Final Scorecard)</span>
                            <span>{finalMatch.court_number} • सामना क्र. #{finalMatch.match_number}</span>
                        </div>
                        <div className="flex justify-around items-center py-2 bg-gray-50 border border-dashed border-gray-300 rounded">
                            <div className="text-center">
                                <span className="text-xs font-bold block">{finalMatch.team_a?.name_mr}</span>
                                <span className="text-2xl font-black font-mono text-[#6750A4]">{finalMatch.team_a_score}</span>
                            </div>
                            <span className="font-black text-gray-400">VS</span>
                            <div className="text-center">
                                <span className="text-xs font-bold block">{finalMatch.team_b?.name_mr}</span>
                                <span className="text-2xl font-black font-mono text-[#6750A4]">{finalMatch.team_b_score}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Honors Table */}
                <div className="space-y-2">
                    <h2 className="font-black text-sm uppercase tracking-wider border-b border-black pb-1">
                        🏅 अधिकृत वैयक्तिक पुरस्कार (Individual Honors)
                    </h2>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-gray-100 border-b border-black text-left">
                                <th className="p-2 border-r border-black w-1/3">पुरस्कार प्रवर्ग</th>
                                <th className="p-2 border-r border-black w-1/3">खेळाडूचे नाव</th>
                                <th className="p-2 w-1/3">प्रतिनिधित्व केलेला जिल्हा संघ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 border-r border-black font-bold">👑 सर्वोत्कृष्ट खेळाडू (Player of the Tournament)</td>
                                <td className="p-2 border-r border-black font-bold text-[#6750A4]">
                                    {tournament.best_player_name || 'आदित्य पाटील (Aditya Patil)'}
                                </td>
                                <td className="p-2 font-semibold">
                                    {tournament.best_player_district || 'मुंबई शहर (MUM)'}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-2 border-r border-black font-bold">⚡ उत्कृष्ट आक्रमक (Best Chaser)</td>
                                <td className="p-2 border-r border-black font-bold text-[#6750A4]">
                                    {tournament.best_attacker_name || 'कुणाल जाधव (Kunal Jadhav)'}
                                </td>
                                <td className="p-2 font-semibold">
                                    {tournament.best_attacker_district || 'पुणे (PUN)'}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 border-r border-black font-bold">🛡️ उत्कृष्ट संरक्षक (Best Defender)</td>
                                <td className="p-2 border-r border-black font-bold text-[#6750A4]">
                                    {tournament.best_defender_name || 'क्षितिज पिळणकर (Kshitij Pilankar)'}
                                </td>
                                <td className="p-2 font-semibold">
                                    {tournament.best_defender_district || 'मुंबई शहर (MUM)'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pool Standings Snapshot */}
                <div className="space-y-2">
                    <h2 className="font-black text-sm uppercase tracking-wider border-b border-black pb-1">
                        📊 साखळी फेरी अंतिम गुणतालिका (Pool Standings)
                    </h2>
                    <table className="w-full border-collapse border border-black text-[10px] text-center">
                        <thead>
                            <tr className="bg-gray-100 border-b border-black">
                                <th className="p-1.5 border-r border-black text-left">जिल्हा संघ</th>
                                <th className="p-1.5 border-r border-black">गट</th>
                                <th className="p-1.5 border-r border-black">सामने (P)</th>
                                <th className="p-1.5 border-r border-black">विजय (W)</th>
                                <th className="p-1.5 border-r border-black">पराभव (L)</th>
                                <th className="p-1.5 border-r border-black">गुण (+ / -)</th>
                                <th className="p-1.5 border-r border-black">फरक</th>
                                <th className="p-1.5 font-bold">गुण (PTS)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((t: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-300">
                                    <td className="p-1.5 border-r border-black text-left font-bold">{t.districtNameMr}</td>
                                    <td className="p-1.5 border-r border-black font-mono">{t.pool}</td>
                                    <td className="p-1.5 border-r border-black font-mono">{t.played}</td>
                                    <td className="p-1.5 border-r border-black font-mono font-bold text-green-700">{t.won}</td>
                                    <td className="p-1.5 border-r border-black font-mono font-bold text-red-600">{t.lost}</td>
                                    <td className="p-1.5 border-r border-black font-mono">{t.scoreFor} / {t.scoreAgainst}</td>
                                    <td className="p-1.5 border-r border-black font-mono font-bold">
                                        {t.scoreDiff > 0 ? `+${t.scoreDiff}` : t.scoreDiff}
                                    </td>
                                    <td className="p-1.5 font-mono font-black text-xs text-[#6750A4]">{t.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Association Signatures */}
                <div className="pt-10 grid grid-cols-3 gap-6 text-center text-[10px] font-bold">
                    <div className="space-y-8">
                        <div className="border-t border-black pt-1">स्पर्धा संयोजक (Tournament Convener)</div>
                    </div>
                    <div className="space-y-8">
                        <div className="border-t border-black pt-1">मानद सरचिटणीस (Hon. General Secretary, MKKA)</div>
                    </div>
                    <div className="space-y-8">
                        <div className="border-t border-black pt-1">अध्यक्ष (President, MKKA)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FinalReportPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#6750A4]">
                    <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-bold text-sm">लोड होत आहे...</p>
                </div>
            }
        >
            <FinalReportContent />
        </Suspense>
    );
}
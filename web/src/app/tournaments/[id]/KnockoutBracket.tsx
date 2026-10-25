'use client';

import React from 'react';
import Link from 'next/link';

interface MatchItem {
    id: string;
    match_number: number;
    round_type: string;
    pool: string;
    court_number: string;
    scheduled_time: string;
    team_a_score: number;
    team_b_score: number;
    status: string;
    team_a?: { name_mr: string; name_en: string; code: string };
    team_b?: { name_mr: string; name_en: string; code: string };
    winner?: { name_mr: string; code: string };
}

interface Props {
    tournamentId: string;
    matches: MatchItem[];
}

export default function KnockoutBracket({ tournamentId, matches }: Props) {
    const quarterFinals = matches.filter((m) => m.round_type === 'QUARTER_FINAL');
    const semiFinals = matches.filter((m) => m.round_type === 'SEMI_FINAL');
    const finals = matches.filter((m) => m.round_type === 'FINAL');

    const hasKnockouts = quarterFinals.length > 0 || semiFinals.length > 0 || finals.length > 0;

    function renderMatchCard(match?: MatchItem, label: string = 'सामना') {
        if (!match) {
            return (
                <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 text-center text-xs text-gray-400 space-y-2">
                    <span className="font-bold block text-[11px] text-gray-500 uppercase">{label}</span>
                    <p>संघ निश्चित झाले नाहीत (TBD)</p>
                </div>
            );
        }

        const isCompleted = match.status === 'COMPLETED';
        const isLive = match.status === 'LIVE';

        return (
            <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-[#6750A4] transition-all space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono font-bold text-[#6750A4] bg-[#F3EDF7] px-2 py-0.5 rounded-md border border-purple-100">
                        #{match.match_number} • {label}
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full font-bold ${isLive
                                ? 'bg-red-500 text-white animate-pulse'
                                : isCompleted
                                    ? 'bg-green-700 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {isLive ? 'LIVE' : isCompleted ? 'संपन्न' : 'नियोजित'}
                    </span>
                </div>

                {/* Team 1 */}
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs font-extrabold text-gray-900 truncate">
                        {match.team_a?.name_mr || 'संघ १'}
                    </span>
                    <span className="font-mono font-black text-sm text-[#6750A4]">
                        {match.team_a_score}
                    </span>
                </div>

                {/* Team 2 */}
                <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-extrabold text-gray-900 truncate">
                        {match.team_b?.name_mr || 'संघ २'}
                    </span>
                    <span className="font-mono font-black text-sm text-[#6750A4]">
                        {match.team_b_score}
                    </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500">
                    <span>{match.court_number}</span>
                    <Link
                        href={`/tournaments/${tournamentId}/matches/${match.id}`}
                        className="text-[#6750A4] font-bold hover:underline"
                    >
                        गुण नोंदणी →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <h2 className="text-lg font-black text-[#1C1B1F]">
                        🏆 बाद फेरी व विजेतेपद वृक्ष (Knockout Bracket Tree)
                    </h2>
                    <p className="text-xs text-gray-500">
                        साखळी सामन्यानंतरची उपांत्यपूर्व, उपांत्य व अंतिम फेरीची क्रमवारी
                    </p>
                </div>
                <span className="text-xs font-bold text-[#6750A4] bg-[#EADDFF] px-3.5 py-1.5 rounded-full">
                    बाद फेरी सामने
                </span>
            </div>

            {!hasKnockouts ? (
                <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-3xl space-y-2">
                    <p className="font-bold text-sm text-gray-600">अद्याप बाद फेरीचे सामने जोडलेले नाहीत</p>
                    <p>
                        वर <strong>"+ नवीन सामना नियोजित करा"</strong> बटणावर क्लिक करून फेरी (Round) मध्ये{' '}
                        <strong>उपांत्यपूर्व (QF)</strong>, <strong>उपांत्य (SF)</strong> किंवा{' '}
                        <strong>अंतिम सामना (Final)</strong> निवडून सामने जोडा.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-center">
                    {/* Column 1: Quarter Finals */}
                    <div className="space-y-4">
                        <div className="text-center font-bold text-xs bg-gray-100 py-1.5 rounded-xl border text-gray-700 uppercase tracking-wider">
                            उपांत्यपूर्व फेरी (Quarter Finals)
                        </div>
                        <div className="space-y-4">
                            {quarterFinals.length > 0 ? (
                                quarterFinals.map((m, idx) => (
                                    <div key={m.id}>{renderMatchCard(m, `QF ${idx + 1}`)}</div>
                                ))
                            ) : (
                                <>
                                    {renderMatchCard(undefined, 'QF 1')}
                                    {renderMatchCard(undefined, 'QF 2')}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Semi Finals */}
                    <div className="space-y-4">
                        <div className="text-center font-bold text-xs bg-purple-50 py-1.5 rounded-xl border border-purple-200 text-[#6750A4] uppercase tracking-wider">
                            उपांत्य फेरी (Semi Finals)
                        </div>
                        <div className="space-y-4">
                            {semiFinals.length > 0 ? (
                                semiFinals.map((m, idx) => (
                                    <div key={m.id}>{renderMatchCard(m, `SF ${idx + 1}`)}</div>
                                ))
                            ) : (
                                <>
                                    {renderMatchCard(undefined, 'SF 1')}
                                    {renderMatchCard(undefined, 'SF 2')}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Grand Final */}
                    <div className="space-y-4">
                        <div className="text-center font-black text-xs bg-amber-50 py-1.5 rounded-xl border border-amber-300 text-amber-900 uppercase tracking-wider">
                            👑 अजिंक्यपद अंतिम सामना (Grand Final)
                        </div>
                        <div className="space-y-4">
                            {finals.length > 0 ? (
                                finals.map((m) => (
                                    <div key={m.id} className="border-2 border-amber-400 rounded-3xl p-1 bg-amber-50/30">
                                        {renderMatchCard(m, 'FINAL')}
                                        {m.winner && (
                                            <div className="mt-2 p-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl text-center text-white font-black text-xs shadow-md">
                                                🎉 स्पर्धा विजेता संघ: {m.winner.name_mr} ({m.winner.code}) 🏆
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                renderMatchCard(undefined, 'FINAL')
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
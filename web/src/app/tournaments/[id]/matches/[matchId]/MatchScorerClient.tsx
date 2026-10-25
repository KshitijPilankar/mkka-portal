'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updateMatchScoreAction, getMatchScoreLogsAction } from '@/app/actions/match-actions';

interface Props {
    match: any;
    initialLogs?: any[];
}

export default function MatchScorerClient({ match, initialLogs = [] }: Props) {
    const [teamAScore, setTeamAScore] = useState<number>(match.team_a_score || 0);
    const [teamBScore, setTeamBScore] = useState<number>(match.team_b_score || 0);
    const [status, setStatus] = useState<'SCHEDULED' | 'LIVE' | 'COMPLETED'>(
        match.status || 'SCHEDULED'
    );
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>(initialLogs);
    const [editNote, setEditNote] = useState<string>('');

    function adjustScore(team: 'A' | 'B', delta: number) {
        if (team === 'A') {
            setTeamAScore((prev) => Math.max(0, prev + delta));
        } else {
            setTeamBScore((prev) => Math.max(0, prev + delta));
        }
    }

    let determinedWinnerId: string | null = null;
    let winnerText = '';

    if (teamAScore > teamBScore) {
        determinedWinnerId = match.team_a?.id;
        winnerText = `${match.team_a?.name_mr} ${teamAScore - teamBScore} गुणांनी आघाडीवर / विजयी`;
    } else if (teamBScore > teamAScore) {
        determinedWinnerId = match.team_b?.id;
        winnerText = `${match.team_b?.name_mr} ${teamBScore - teamAScore} गुणांनी आघाडीवर / विजयी`;
    } else {
        winnerText = 'गुण समान (Match Tied)';
    }

    async function handleSaveScore() {
        setSaving(true);
        setMessage(null);

        const noteToSave = editNote.trim() || (status === 'COMPLETED' ? 'निकाल अंतिम घोषित' : 'गुणफलक अपडेट');

        const res = await updateMatchScoreAction({
            matchId: match.id,
            tournamentId: match.tournament_id,
            teamAScore,
            teamBScore,
            status,
            winnerDistrictId: status === 'COMPLETED' ? determinedWinnerId : null,
            note: noteToSave,
        });

        if (res.success) {
            setMessage('गुणफलक व बदल इतिहास (Log) यशस्वीरीत्या सेव्ह झाला! ✓');
            setEditNote('');
            // Refresh logs
            const updatedLogsRes = await getMatchScoreLogsAction(match.id);
            if (updatedLogsRes.success) {
                setLogs(updatedLogsRes.logs);
            }
        } else {
            setMessage('त्रुटी: गुण सेव्ह करता आले नाहीत.');
        }
        setSaving(false);
    }

    return (
        <div className="space-y-6">
            {/* Top Back Navigation & Scoresheet Link */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <Link
                    href={`/tournaments/${match.tournament_id}`}
                    className="text-xs font-bold text-[#6750A4] hover:underline flex items-center gap-1"
                >
                    ← स्पर्धा केंद्राकडे परत जा (Back to Tournament Hub)
                </Link>
                <Link
                    href={`/tournaments/${match.tournament_id}/matches/${match.id}/scoresheet`}
                    target="_blank"
                    className="px-5 py-2 rounded-full bg-white border border-[#CAC4D0] text-xs font-bold text-gray-800 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                    🖨️ अधिकृत कोरी गुणपत्रिका प्रिंट करा (Official Scoresheet) →
                </Link>
            </div>

            {/* Match Header Banner */}
            <div className="bg-[#F3EDF7] p-6 md:p-8 rounded-[36px] border border-[#CAC4D0]/40 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-mono font-bold text-xs bg-white text-[#6750A4] px-3.5 py-1 rounded-full border">
                        सामना क्र. #{match.match_number} • {match.pool}
                    </span>
                    <span
                        className={`px-3.5 py-1 rounded-full text-xs font-bold ${status === 'LIVE'
                                ? 'bg-red-500 text-white animate-pulse'
                                : status === 'COMPLETED'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-purple-100 text-[#6750A4]'
                            }`}
                    >
                        ● {status === 'LIVE' ? 'थेट सुरू (LIVE)' : status === 'COMPLETED' ? 'पूर्ण (COMPLETED)' : 'नियोजित (SCHEDULED)'}
                    </span>
                </div>

                <h1 className="text-xl md:text-2xl font-black text-[#1C1B1F]">
                    {match.tournament?.name_mr}
                </h1>
                <p className="text-xs text-gray-600">
                    📍 {match.court_number} • {new Date(match.scheduled_time).toLocaleDateString('en-IN')} रोजी वेळ{' '}
                    {new Date(match.scheduled_time).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>

            {message && (
                <div className="p-4 bg-green-100 text-green-900 rounded-2xl text-xs font-bold text-center">
                    {message}
                </div>
            )}

            {/* Live Digital Scoreboard */}
            <div className="bg-white rounded-[36px] border border-[#CAC4D0]/60 p-6 md:p-10 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    {/* Team A */}
                    <div className="md:col-span-2 text-center p-6 bg-[#FDF8FD] rounded-3xl border border-purple-100 space-y-4">
                        <span className="text-xs font-mono font-bold text-[#6750A4] bg-white px-3 py-1 rounded-full border">
                            {match.team_a?.code}
                        </span>
                        <h2 className="text-xl font-black text-gray-900 mt-2 truncate">
                            {match.team_a?.name_mr}
                        </h2>
                        <div className="text-6xl font-black font-mono text-[#6750A4] tracking-tight">
                            {teamAScore}
                        </div>

                        <div className="flex justify-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => adjustScore('A', -1)}
                                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                            >
                                -1
                            </button>
                            <button
                                type="button"
                                onClick={() => adjustScore('A', +1)}
                                className="px-4 h-9 rounded-full bg-[#6750A4] text-white font-bold text-xs hover:bg-[#523e85]"
                            >
                                +1 गुण
                            </button>
                            <button
                                type="button"
                                onClick={() => adjustScore('A', +2)}
                                className="px-3 h-9 rounded-full bg-[#EADDFF] text-[#21005D] font-bold text-xs hover:bg-[#D0BCFF]"
                            >
                                +2
                            </button>
                        </div>
                    </div>

                    {/* VS Divider */}
                    <div className="text-center space-y-2">
                        <span className="text-sm font-black text-gray-300">VS</span>
                        <div className="text-[11px] font-bold text-gray-600 bg-gray-50 p-2 rounded-xl border">
                            {winnerText}
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="md:col-span-2 text-center p-6 bg-[#FDF8FD] rounded-3xl border border-purple-100 space-y-4">
                        <span className="text-xs font-mono font-bold text-[#6750A4] bg-white px-3 py-1 rounded-full border">
                            {match.team_b?.code}
                        </span>
                        <h2 className="text-xl font-black text-gray-900 mt-2 truncate">
                            {match.team_b?.name_mr}
                        </h2>
                        <div className="text-6xl font-black font-mono text-[#6750A4] tracking-tight">
                            {teamBScore}
                        </div>

                        <div className="flex justify-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => adjustScore('B', -1)}
                                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                            >
                                -1
                            </button>
                            <button
                                type="button"
                                onClick={() => adjustScore('B', +1)}
                                className="px-4 h-9 rounded-full bg-[#6750A4] text-white font-bold text-xs hover:bg-[#523e85]"
                            >
                                +1 गुण
                            </button>
                            <button
                                type="button"
                                onClick={() => adjustScore('B', +2)}
                                className="px-3 h-9 rounded-full bg-[#EADDFF] text-[#21005D] font-bold text-xs hover:bg-[#D0BCFF]"
                            >
                                +2
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Note & Status Control */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#49454F] whitespace-nowrap">सामना स्थिती:</span>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full h-10 px-3 rounded-xl border border-[#CAC4D0] bg-[#FDF8FD] text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="SCHEDULED">नियोजित (SCHEDULED)</option>
                                <option value="LIVE">थेट सुरू (LIVE)</option>
                                <option value="COMPLETED">सामना संपन्न (COMPLETED)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2">
                            <span className="text-xs font-bold text-[#49454F] whitespace-nowrap">बदल टीप / शेरा:</span>
                            <input
                                type="text"
                                placeholder="उदा. अंतिम फेरबदल, टाय-ब्रेक, स्कोअर दुरुस्ती..."
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-[#CAC4D0] bg-[#FDF8FD] text-xs font-medium outline-none focus:border-[#6750A4]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={handleSaveScore}
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-md disabled:opacity-50"
                        >
                            {saving ? 'गुण सेव्ह होत आहेत...' : 'गुणफलक व बदल सेव्ह करा (Save & Log Revision) →'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Revision History / Activity Log Section */}
            <div className="bg-white rounded-[36px] border border-[#CAC4D0]/60 p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                            📋 गुण नोंदणी व फेरबदल इतिहास (Score Revision Activity Log)
                        </h3>
                        <p className="text-xs text-gray-500">
                            सामन्याचा स्कोअर कधी, किती वाजता आणि काय अपडेट झाला याची संपूर्ण नोंद
                        </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-50 text-[#6750A4] text-xs font-bold rounded-full border border-purple-200">
                        {logs.length} नोंदी उपलब्ध
                    </span>
                </div>

                {logs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed rounded-2xl">
                        अद्याप कोणताही बदल नोंदवलेला नाही. गुण सेव्ह केल्यावर येथे वेळ व तारीख दिसेल.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                        {logs.map((log: any, idx: number) => {
                            const logDate = new Date(log.created_at);
                            const isLatest = idx === 0;

                            return (
                                <div
                                    key={log.id}
                                    className={`p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${isLatest ? 'bg-purple-50/50' : 'bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {isLatest && (
                                                <span className="px-2 py-0.5 rounded-md bg-[#6750A4] text-white text-[10px] font-black uppercase tracking-wider">
                                                    सध्याचा निकाल
                                                </span>
                                            )}
                                            <span className="text-xs font-extrabold text-gray-900">
                                                {match.team_a?.name_mr}: <span className="font-mono text-[#6750A4]">{log.team_a_score}</span> |{' '}
                                                {match.team_b?.name_mr}: <span className="font-mono text-[#6750A4]">{log.team_b_score}</span>
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            शेरा: <span className="font-medium text-gray-700">{log.note || 'अपडेट'}</span> • स्थिती:{' '}
                                            <span className="font-bold text-gray-800">
                                                {log.status === 'COMPLETED' ? 'सामना संपन्न' : log.status === 'LIVE' ? 'थेट सुरू' : 'नियोजित'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right sm:text-right">
                                        <div className="text-xs font-mono font-bold text-gray-800">
                                            ⏰ {logDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div className="text-[11px] font-medium text-gray-400">
                                            📅 {logDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
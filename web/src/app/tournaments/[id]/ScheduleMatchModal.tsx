'use client';

import React, { useState } from 'react';
import { createMatchFixtureAction } from '@/app/actions/match-actions';

interface DistrictOption {
    id: string;
    name_mr: string;
    name_en: string;
    code: string;
}

interface Props {
    tournamentId: string;
    participatingDistricts: DistrictOption[];
    nextMatchNumber: number;
}

export default function ScheduleMatchModal({
    tournamentId,
    participatingDistricts,
    nextMatchNumber,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form states
    const [matchNumber, setMatchNumber] = useState(nextMatchNumber);
    const [pool, setPool] = useState('Pool A');
    const [roundType, setRoundType] = useState('LEAGUE');
    const [teamAId, setTeamAId] = useState('');
    const [teamBId, setTeamBId] = useState('');
    const [courtNumber, setCourtNumber] = useState('मैदान क्र. १ (Court 1)');
    const [scheduledDate, setScheduledDate] = useState('2026-11-15');
    const [scheduledTime, setScheduledTime] = useState('11:00');

    async function handleScheduleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        if (!teamAId || !teamBId) {
            setErrorMsg('कृपया दोन्ही संघ निवडा.');
            return;
        }

        if (teamAId === teamBId) {
            setErrorMsg('दोन्ही संघ वेगवेगळे असणे आवश्यक आहे.');
            return;
        }

        setLoading(true);

        const fullTimestamp = new Date(`${scheduledDate}T${scheduledTime}:00+05:30`).toISOString();

        const res = await createMatchFixtureAction({
            tournamentId,
            matchNumber: Number(matchNumber),
            roundType,
            pool,
            teamADistrictId: teamAId,
            teamBDistrictId: teamBId,
            courtNumber,
            scheduledTime: fullTimestamp,
        });

        setLoading(false);

        if (res.success) {
            setIsOpen(false);
            setTeamAId('');
            setTeamBId('');
            setMatchNumber((prev) => prev + 1);
        } else {
            setErrorMsg(res.error || 'सामना नियोजित करता आला नाही.');
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
                + नवीन सामना नियोजित करा (Schedule Match)
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    नवीन सामना वेळापत्रक (Schedule Match)
                                </h3>
                                <p className="text-xs text-gray-500">
                                    गटनिहाय सामना, संघ आणि मैदान निश्चित करा
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                        सामना क्र.
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={matchNumber}
                                        onChange={(e) => setMatchNumber(Number(e.target.value))}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 font-mono font-bold text-xs outline-none focus:border-[#6750A4]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                        गट (Pool)
                                    </label>
                                    <select
                                        value={pool}
                                        onChange={(e) => setPool(e.target.value)}
                                        className="w-full h-10 px-2 rounded-xl border border-gray-300 font-bold text-xs outline-none bg-gray-50"
                                    >
                                        <option value="Pool A">Pool A</option>
                                        <option value="Pool B">Pool B</option>
                                        <option value="Pool C">Pool C</option>
                                        <option value="Pool D">Pool D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                        फेरी (Round)
                                    </label>
                                    <select
                                        value={roundType}
                                        onChange={(e) => setRoundType(e.target.value)}
                                        className="w-full h-10 px-2 rounded-xl border border-gray-300 font-bold text-xs outline-none bg-gray-50"
                                    >
                                        <option value="LEAGUE">साखळी (League)</option>
                                        <option value="QUARTER_FINAL">उपांत्यपूर्व (QF)</option>
                                        <option value="SEMI_FINAL">उपांत्य (SF)</option>
                                        <option value="FINAL">अंतिम सामना (Final)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Team A vs Team B */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FDF8FD] p-4 rounded-2xl border border-purple-100">
                                <div>
                                    <label className="text-xs font-bold text-[#6750A4] block mb-1">
                                        संघ १ (Team A) *
                                    </label>
                                    <select
                                        required
                                        value={teamAId}
                                        onChange={(e) => setTeamAId(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold outline-none"
                                    >
                                        <option value="">-- संघ निवडा --</option>
                                        {participatingDistricts.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name_mr} ({d.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[#6750A4] block mb-1">
                                        संघ २ (Team B) *
                                    </label>
                                    <select
                                        required
                                        value={teamBId}
                                        onChange={(e) => setTeamBId(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold outline-none"
                                    >
                                        <option value="">-- संघ निवडा --</option>
                                        {participatingDistricts.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name_mr} ({d.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Court & Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                        मैदान (Court)
                                    </label>
                                    <select
                                        value={courtNumber}
                                        onChange={(e) => setCourtNumber(e.target.value)}
                                        className="w-full h-10 px-2 rounded-xl border border-gray-300 text-xs font-medium outline-none bg-white"
                                    >
                                        <option value="मैदान क्र. १ (Court 1)">मैदान क्र. १ (Court 1)</option>
                                        <option value="मैदान क्र. २ (Court 2)">मैदान क्र. २ (Court 2)</option>
                                        <option value="मैदान क्र. ३ (Court 3)">मैदान क्र. ३ (Court 3)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                        तारीख (Date)
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                        वेळ (Time)
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 text-xs font-mono outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2.5 rounded-full border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    रद्द करा (Cancel)
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-md disabled:opacity-50"
                                >
                                    {loading ? 'नियोजित करत आहे...' : 'वेळापत्रकात जोडा (Save Fixture) ✓'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
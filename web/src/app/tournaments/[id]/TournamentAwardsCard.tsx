'use client';

import React, { useState } from 'react';
import { saveTournamentAwardsAction } from '@/app/actions/tournament-actions';

interface Props {
    tournament: any;
    squads: any[];
}

export default function TournamentAwardsCard({ tournament, squads }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [bestPlayer, setBestPlayer] = useState({
        name: tournament.best_player_name || 'आदित्य पाटील (Aditya Patil)',
        district: tournament.best_player_district || 'मुंबई शहर (MUM)',
    });

    const [bestAttacker, setBestAttacker] = useState({
        name: tournament.best_attacker_name || 'कुणाल जाधव (Kunal Jadhav)',
        district: tournament.best_attacker_district || 'पुणे (PUN)',
    });

    const [bestDefender, setBestDefender] = useState({
        name: tournament.best_defender_name || 'क्षितिज पिळणकर (Kshitij Pilankar)',
        district: tournament.best_defender_district || 'मुंबई शहर (MUM)',
    });

    async function handleSaveAwards(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const res = await saveTournamentAwardsAction({
            tournamentId: tournament.id,
            bestPlayerName: bestPlayer.name,
            bestPlayerDistrict: bestPlayer.district,
            bestAttackerName: bestAttacker.name,
            bestAttackerDistrict: bestAttacker.district,
            bestDefenderName: bestDefender.name,
            bestDefenderDistrict: bestDefender.district,
        });

        setLoading(false);
        if (res.success) {
            setMessage('पुरस्कार यशस्वीरीत्या सेव्ह झाले! ✓');
            setIsEditing(false);
        } else {
            setMessage('त्रुटी: पुरस्कार सेव्ह करता आले नाहीत.');
        }
    }

    return (
        <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFDE7] rounded-[36px] border-2 border-amber-300 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏅</span>
                    <div>
                        <h2 className="text-lg font-black text-amber-950">
                            स्पर्धेतील वैयक्तिक पारितोषिके व सन्मान (Individual Honors & Awards)
                        </h2>
                        <p className="text-xs text-amber-800 font-medium">
                            महाराष्ट्र राज्य खो-खो असोसिएशनचे अधिकृत वैयक्तिक पुरस्कार
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-1.5 rounded-full bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all shadow-sm"
                >
                    {isEditing ? 'रद्द करा (Close)' : '✏️ पुरस्कार संपादित करा'}
                </button>
            </div>

            {message && (
                <div className="p-3 bg-green-100 text-green-900 rounded-xl text-xs font-bold text-center">
                    {message}
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSaveAwards} className="space-y-4 bg-white/80 p-5 rounded-2xl border border-amber-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Best Player */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-amber-950 block">
                                👑 सर्वोत्कृष्ट खेळाडू (Best All-Rounder):
                            </label>
                            <input
                                type="text"
                                required
                                value={bestPlayer.name}
                                onChange={(e) => setBestPlayer({ ...bestPlayer, name: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                                placeholder="खेळाडूचे नाव"
                            />
                            <input
                                type="text"
                                required
                                value={bestPlayer.district}
                                onChange={(e) => setBestPlayer({ ...bestPlayer, district: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs"
                                placeholder="जिल्हा संघ"
                            />
                        </div>

                        {/* Best Attacker */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-amber-950 block">
                                ⚡ उत्कृष्ट आक्रमक (Best Chaser):
                            </label>
                            <input
                                type="text"
                                required
                                value={bestAttacker.name}
                                onChange={(e) => setBestAttacker({ ...bestAttacker, name: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                                placeholder="खेळाडूचे नाव"
                            />
                            <input
                                type="text"
                                required
                                value={bestAttacker.district}
                                onChange={(e) => setBestAttacker({ ...bestAttacker, district: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs"
                                placeholder="जिल्हा संघ"
                            />
                        </div>

                        {/* Best Defender */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-amber-950 block">
                                🛡️ उत्कृष्ट संरक्षक (Best Defender):
                            </label>
                            <input
                                type="text"
                                required
                                value={bestDefender.name}
                                onChange={(e) => setBestDefender({ ...bestDefender, name: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                                placeholder="खेळाडूचे नाव"
                            />
                            <input
                                type="text"
                                required
                                value={bestDefender.district}
                                onChange={(e) => setBestDefender({ ...bestDefender, district: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs"
                                placeholder="जिल्हा संघ"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-full bg-amber-500 text-amber-950 font-black text-xs hover:bg-amber-400 active:scale-95 shadow-md"
                        >
                            {loading ? 'सेव्ह होत आहे...' : 'पुरस्कार जतन करा (Save Honors) ✓'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2 text-center">
                        <span className="text-2xl block">👑</span>
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                            सर्वोत्कृष्ट खेळाडू
                        </span>
                        <h3 className="text-base font-black text-gray-900">{bestPlayer.name}</h3>
                        <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                            {bestPlayer.district}
                        </span>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2 text-center">
                        <span className="text-2xl block">⚡</span>
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                            उत्कृष्ट आक्रमक
                        </span>
                        <h3 className="text-base font-black text-gray-900">{bestAttacker.name}</h3>
                        <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                            {bestAttacker.district}
                        </span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2 text-center">
                        <span className="text-2xl block">🛡️</span>
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                            उत्कृष्ट संरक्षक
                        </span>
                        <h3 className="text-base font-black text-gray-900">{bestDefender.name}</h3>
                        <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                            {bestDefender.district}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
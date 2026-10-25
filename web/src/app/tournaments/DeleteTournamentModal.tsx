'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTournamentAction } from '@/app/actions/tournament-actions';

interface Props {
    tournamentId: string;
    tournamentName: string;
}

export default function DeleteTournamentModal({ tournamentId, tournamentName }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [adminPin, setAdminPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await deleteTournamentAction({
            tournamentId,
            adminPin,
            confirmName,
            expectedName: tournamentName,
        });

        setLoading(false);
        if (res.success) {
            setIsOpen(false);
            setConfirmName('');
            setAdminPin('');
            router.refresh();
        } else {
            setError(res.error || 'स्पर्धा हटवता आली नाही.');
        }
    }

    const isFormValid =
        confirmName.trim().toLowerCase() === tournamentName.trim().toLowerCase() &&
        adminPin.trim().length >= 4;

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all cursor-pointer"
                title="स्पर्धा हटवा (Delete Tournament)"
            >
                <span className="text-sm">🗑️</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[32px] max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 text-left border border-red-200">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">
                                    ⚠️
                                </span>
                                <div>
                                    <h3 className="text-base font-black text-red-700">
                                        स्पर्धा कायमची हटवा (Delete)
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        सुरक्षित २-स्तरीय प्रमाणीकरण (2FA)
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Warning Message */}
                        <div className="p-3 bg-red-50 text-red-800 rounded-2xl text-xs space-y-1 border border-red-200">
                            <p className="font-bold">सावधान: ही क्रिया पूर्ववत करता येणार नाही!</p>
                            <p className="text-[11px] text-red-700">
                                या स्पर्धेचे सर्व सामने, दाखल संघ आणि गुणपत्रिका पूर्णपणे नष्ट होतील.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 text-red-900 rounded-xl text-xs font-bold">
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleDelete} className="space-y-4 text-xs font-semibold">
                            {/* Factor 1: Exact Name Confirmation */}
                            <div className="space-y-1.5">
                                <label className="text-gray-700 block">
                                    १. खात्रीसाठी खालील स्पर्धेचे नाव अचूक टाईप करा:
                                </label>
                                <div className="p-2 bg-gray-100 text-gray-800 rounded-xl font-mono text-[11px] break-all border border-gray-200 select-all">
                                    {tournamentName}
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="येथे नाव टाईप करा..."
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-red-500 bg-[#FDF8FD]"
                                />
                            </div>

                            {/* Factor 2: Admin Security PIN */}
                            <div className="space-y-1.5">
                                <label className="text-gray-700 block">
                                    २. अधिकृत ॲडमिन सुरक्षा पिन (Admin Security PIN):
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="सुरक्षा पिन टाका (Default: MKKA2026)"
                                    value={adminPin}
                                    onChange={(e) => setAdminPin(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-red-500 bg-[#FDF8FD] font-mono tracking-widest"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                                >
                                    रद्द करा
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !isFormValid}
                                    className="px-5 py-2 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                                >
                                    {loading ? 'हटवत आहे...' : '🗑️ कायमचे हटवा (Permanently Delete)'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
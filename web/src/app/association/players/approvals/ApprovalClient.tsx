'use client';

import React, { useState } from 'react';
import { approvePlayerAction, rejectPlayerAction } from '@/app/actions/admin-approvals';

export default function ApprovalClient({ initialPlayers }: { initialPlayers: any[] }) {
    const [players, setPlayers] = useState(initialPlayers);
    const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const getDocUrl = (path: string) => {
        return `${supabaseUrl}/storage/v1/object/public/player-documents/${path}`;
    };

    async function handleApprove(player: any) {
        if (!confirm(`Confirm approval for ${player.first_name} ${player.surname}?`)) return;
        setIsProcessing(true);
        const districtCode = player.playing_district?.code || 'MAH';
        const res = await approvePlayerAction(player.id, districtCode);
        setIsProcessing(false);

        if (res.success) {
            setActionMessage(`मंजूर केले! Generated MKKA ID: ${res.mkkaId}`);
            setPlayers((prev) => prev.filter((p) => p.id !== player.id));
            setSelectedPlayer(null);
        } else {
            alert(`Approval Failed: ${res.error}`);
        }
    }

    async function handleReject(playerId: string) {
        const reason = prompt('नोंदणी नाकारण्याचे कारण नमूद करा (Enter Rejection Reason):');
        if (!reason) return;

        setIsProcessing(true);
        const res = await rejectPlayerAction(playerId, reason);
        setIsProcessing(false);

        if (res.success) {
            setActionMessage('अर्ज यशस्वीरीत्या नाकारला गेला (Application Rejected).');
            setPlayers((prev) => prev.filter((p) => p.id !== playerId));
            setSelectedPlayer(null);
        } else {
            alert(`Rejection Failed: ${res.error}`);
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F3EDF7] p-6 rounded-[28px] gap-4">
                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-semibold mb-2">
                        महाराष्ट्र राज्य खो-खो असोसिएशन • प्रशासकीय नियंत्रण कक्ष
                    </span>
                    <h1 className="text-2xl font-bold text-[#1C1B1F]">
                        खेळाडू नोंदणी छाननी व पडताळणी कक्ष (Player Scrutiny Portal)
                    </h1>
                    <p className="text-sm text-[#49454F]">
                        Total Pending Applications for Verification: <strong className="text-[#6750A4]">{players.length}</strong>
                    </p>
                </div>
            </div>

            {actionMessage && (
                <div className="p-4 rounded-2xl bg-green-100 text-green-900 text-sm font-semibold flex justify-between items-center">
                    <span>{actionMessage}</span>
                    <button onClick={() => setActionMessage(null)} className="text-xs underline">Dismiss</button>
                </div>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#ECE6F0] text-[#49454F] text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">खेळाडूचे नाव (Player Name)</th>
                                <th className="py-4 px-6">जिल्हा (Playing District)</th>
                                <th className="py-4 px-6">आधार क्र. (Aadhaar)</th>
                                <th className="py-4 px-6">मोबाईल (Mobile)</th>
                                <th className="py-4 px-6">अर्ज दिनांक (Submitted)</th>
                                <th className="py-4 px-6 text-center">कृती (Actions)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-sm">
                            {players.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[#79747E] text-sm">
                                        कोणतेही प्रलंबित अर्ज उपलब्ध नाहीत (No pending applications found).
                                    </td>
                                </tr>
                            ) : (
                                players.map((player) => (
                                    <tr key={player.id} className="hover:bg-[#F7F2FA] transition-colors">
                                        <td className="py-4 px-6 font-semibold text-[#1C1B1F]">
                                            {player.first_name} {player.middle_name} {player.surname}
                                        </td>
                                        <td className="py-4 px-6 text-[#49454F]">
                                            <span className="px-2.5 py-1 bg-[#E8DEF8] text-[#1D192B] rounded-full text-xs font-medium">
                                                {player.playing_district?.name_mr || 'जिल्हा'} ({player.playing_district?.name_en})
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-[#49454F]">{player.aadhar_no}</td>
                                        <td className="py-4 px-6 font-mono text-xs text-[#49454F]">{player.mobile_no}</td>
                                        <td className="py-4 px-6 text-xs text-[#49454F]">
                                            {new Date(player.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-center space-x-2">
                                            <button
                                                onClick={() => setSelectedPlayer(player)}
                                                className="px-4 py-1.5 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-semibold hover:bg-[#D0BCFF] transition-all"
                                            >
                                                कागदपत्रे तपासा (Verify Docs)
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scrutiny Modal / Drawer */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#1C1B1F]">
                                    {selectedPlayer.first_name} {selectedPlayer.surname} - कागदपत्र छाननी
                                </h3>
                                <p className="text-xs text-[#49454F]">Tracking ID: {selectedPlayer.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPlayer(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Document Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#6750A4] block mb-2">१. खेळाडू फोटो (Photograph)</span>
                                <a href={getDocUrl(selectedPlayer.photo_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    फोटो उघडा / View Photograph ↗
                                </a>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#6750A4] block mb-2">२. आधार कार्ड (Address Proof)</span>
                                <a href={getDocUrl(selectedPlayer.address_proof_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    आधार कार्ड तपासा / View Aadhaar Proof ↗
                                </a>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#6750A4] block mb-2">३. ओळख पुरावा (ID Proof)</span>
                                <a href={getDocUrl(selectedPlayer.id_proof_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    ओळखपत्र तपासा / View ID Proof ↗
                                </a>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#6750A4] block mb-2">४. जन्म दाखला (DOB Proof)</span>
                                <a href={getDocUrl(selectedPlayer.dob_proof_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    जन्म प्रमाणपत्र तपासा / View DOB Proof ↗
                                </a>
                            </div>
                        </div>

                        {/* Decision CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                            <button
                                disabled={isProcessing}
                                onClick={() => handleReject(selectedPlayer.id)}
                                className="px-6 py-2.5 rounded-full border border-red-500 text-red-600 text-xs font-bold hover:bg-red-50 transition-all"
                            >
                                अर्ज नाकारा (Reject)
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={() => handleApprove(selectedPlayer)}
                                className="px-8 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all shadow-sm"
                            >
                                {isProcessing ? 'मंजूर करत आहे...' : 'पात्र खेळाडू मंजूर करा (Approve & Generate MKKA ID)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
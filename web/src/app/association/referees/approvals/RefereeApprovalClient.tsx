'use client';

import React, { useState } from 'react';
import { approveRefereeAction, rejectRefereeAction } from '@/app/actions/admin-referee-approvals';

export default function RefereeApprovalClient({ initialReferees }: { initialReferees: any[] }) {
    const [referees, setReferees] = useState(initialReferees);
    const [selectedReferee, setSelectedReferee] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const getDocUrl = (path: string) => {
        return `${supabaseUrl}/storage/v1/object/public/player-documents/${path}`;
    };

    async function handleApprove(referee: any) {
        if (!confirm(`Confirm approval for ${referee.first_name} ${referee.surname}?`)) return;
        setIsProcessing(true);
        const districtCode = referee.affiliated_district?.code || 'MAH';
        const res = await approveRefereeAction(referee.id, districtCode);
        setIsProcessing(false);

        if (res.success) {
            setActionMessage(`मंजूर केले! Generated Referee ID: ${res.mkkaRefId}`);
            setReferees((prev) => prev.filter((r) => r.id !== referee.id));
            setSelectedReferee(null);
        } else {
            alert(`Approval Failed: ${res.error}`);
        }
    }

    async function handleReject(refereeId: string) {
        const reason = prompt('नोंदणी नाकारण्याचे कारण नमूद करा (Enter Rejection Reason):');
        if (!reason) return;

        setIsProcessing(true);
        const res = await rejectRefereeAction(refereeId, reason);
        setIsProcessing(false);

        if (res.success) {
            setActionMessage('पंच अर्ज नाकारण्यात आला (Application Rejected).');
            setReferees((prev) => prev.filter((r) => r.id !== refereeId));
            setSelectedReferee(null);
        } else {
            alert(`Rejection Failed: ${res.error}`);
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#FFDDB6]/40 p-6 rounded-[28px] gap-4 border border-[#8B5000]/20">
                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#FFDDB6] text-[#8B5000] text-xs font-semibold mb-2">
                        महाराष्ट्र राज्य खो-खो असोसिएशन • राज्य पंच मंडळ
                    </span>
                    <h1 className="text-2xl font-bold text-[#2A1800]">
                        अधिकृत पंच छाननी व पडताळणी कक्ष (Referee Scrutiny Portal)
                    </h1>
                    <p className="text-sm text-[#554330]">
                        Total Pending Referee Applications: <strong className="text-[#8B5000]">{referees.length}</strong>
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
                            <tr className="bg-[#FFF8F2] text-[#554330] text-xs font-semibold uppercase tracking-wider">
                                <th className="py-4 px-6">पंचाचे नाव (Referee Name)</th>
                                <th className="py-4 px-6">संलग्न जिल्हा (District)</th>
                                <th className="py-4 px-6">श्रेणी (Grade)</th>
                                <th className="py-4 px-6">अनुभव (Exp)</th>
                                <th className="py-4 px-6">मोबाईल (Mobile)</th>
                                <th className="py-4 px-6 text-center">कृती (Actions)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-sm">
                            {referees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[#79747E]">
                                        कोणतेही प्रलंबित पंच अर्ज उपलब्ध नाहीत (No pending applications found).
                                    </td>
                                </tr>
                            ) : (
                                referees.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-[#FFFBF8] transition-colors">
                                        <td className="py-4 px-6 font-semibold text-[#1C1B1F]">
                                            {ref.first_name} {ref.middle_name} {ref.surname}
                                        </td>
                                        <td className="py-4 px-6 text-[#49454F]">
                                            <span className="px-2.5 py-1 bg-[#FFDDB6]/50 text-[#6C3E00] rounded-full text-xs font-medium">
                                                {ref.affiliated_district?.name_mr || 'जिल्हा'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-xs text-[#8B5000]">{ref.referee_grade}</td>
                                        <td className="py-4 px-6 text-xs text-[#49454F]">{ref.experience_years} वर्षे</td>
                                        <td className="py-4 px-6 font-mono text-xs text-[#49454F]">{ref.mobile_no}</td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => setSelectedReferee(ref)}
                                                className="px-4 py-1.5 rounded-full bg-[#FFDDB6] text-[#6C3E00] text-xs font-semibold hover:bg-[#FFC98B] transition-all"
                                            >
                                                तपासा व प्रमाणपत्र पहा (Verify)
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {selectedReferee && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#1C1B1F]">
                                    {selectedReferee.first_name} {selectedReferee.surname} - पंच पडताळणी
                                </h3>
                                <p className="text-xs text-[#49454F]">Tracking ID: {selectedReferee.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedReferee(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Document Preview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#8B5000] block mb-2">१. पासपोर्ट फोटो</span>
                                <a href={getDocUrl(selectedReferee.photo_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    फोटो उघडा / View Photo ↗
                                </a>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#8B5000] block mb-2">२. आधार / ओळखपत्र</span>
                                <a href={getDocUrl(selectedReferee.id_proof_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    ओळख पुरावा तपासा ↗
                                </a>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50">
                                <span className="text-xs font-bold text-[#8B5000] block mb-2">३. पंच परीक्षा प्रमाणपत्र</span>
                                <a href={getDocUrl(selectedReferee.certificate_path)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                    प्रमाणपत्र तपासा ↗
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                            <button
                                disabled={isProcessing}
                                onClick={() => handleReject(selectedReferee.id)}
                                className="px-6 py-2.5 rounded-full border border-red-500 text-red-600 text-xs font-bold hover:bg-red-50"
                            >
                                अर्ज नाकारा (Reject)
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={() => handleApprove(selectedReferee)}
                                className="px-8 py-2.5 rounded-full bg-[#8B5000] text-white text-xs font-bold hover:bg-[#6C3E00] shadow-sm"
                            >
                                {isProcessing ? 'मंजूर करत आहे...' : 'अधिकृत पंच मंजूर करा (Approve & Generate Referee ID)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
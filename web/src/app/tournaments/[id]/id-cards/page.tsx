'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTournamentOverviewAction } from '@/app/actions/squad-actions';

function TournamentIdCardsContent() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('ALL');

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);
            const res = await getTournamentOverviewAction(id);
            if (res.success) {
                setData(res);
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#6750A4]">
                <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold text-sm">खेळाडू ओळखपत्रे तयार होत आहेत... / Generating Accreditation Cards...</p>
            </div>
        );
    }

    if (!data || !data.tournament) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <p className="text-red-600 font-bold text-sm">स्पर्धा माहिती उपलब्ध नाही.</p>
                <Link href={`/tournaments/${id}`} className="px-5 py-2 rounded-full bg-[#6750A4] text-white text-xs font-bold">
                    ← स्पर्धा केंद्राकडे परत जा
                </Link>
            </div>
        );
    }

    const { tournament, squads } = data;

    const filteredSquads = selectedDistrictId === 'ALL'
        ? squads
        : squads.filter((s: any) => s.district_id === selectedDistrictId);

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white text-black font-sans">
            <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm 6mm;
        }
        @media print {
          html, body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .id-card-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

            {/* Screen Control Bar */}
            <div className="max-w-5xl mx-auto mb-6 flex flex-wrap justify-between items-center gap-3 no-print bg-white p-4 rounded-3xl shadow-sm border border-gray-300">
                <Link
                    href={`/tournaments/${id}`}
                    className="text-xs font-bold text-[#6750A4] hover:underline flex items-center gap-1"
                >
                    ← स्पर्धा केंद्राकडे परत जा (Back to Tournament Hub)
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">जिल्हा निवडा:</span>
                        <select
                            value={selectedDistrictId}
                            onChange={(e) => setSelectedDistrictId(e.target.value)}
                            className="h-9 px-3 rounded-xl border border-gray-300 bg-[#FDF8FD] text-xs font-bold outline-none cursor-pointer"
                        >
                            <option value="ALL">सर्व संघ (All Registered Squads)</option>
                            {squads.map((s: any) => (
                                <option key={s.id} value={s.district_id}>
                                    {s.district?.name_mr} ({s.district?.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                        🖨️ सर्व ओळखपत्रे प्रिंट करा (Print ID Cards)
                    </button>
                </div>
            </div>

            {/* Printable ID Cards Grid (A4: 2 columns grid) */}
            <div className="max-w-5xl mx-auto space-y-8">
                {filteredSquads.length === 0 ? (
                    <div className="bg-white p-12 text-center text-xs text-gray-400 rounded-3xl border border-dashed">
                        निवडलेल्या जिल्ह्यासाठी खेळाडूंची यादी उपलब्ध नाही.
                    </div>
                ) : (
                    filteredSquads.map((squad: any) => {
                        const players = squad.tournament_squad_players || [];

                        return (
                            <div key={squad.id} className="space-y-4">
                                <div className="no-print flex justify-between items-center bg-purple-50 p-3 rounded-2xl border border-purple-200">
                                    <h2 className="text-sm font-black text-[#6750A4]">
                                        {squad.district?.name_mr} ({squad.district?.code}) - {players.length} खेळाडू
                                    </h2>
                                    <span className="text-xs text-gray-600">
                                        प्रशिक्षक: <strong>{squad.coach_name}</strong> | व्यवस्थापक: <strong>{squad.manager_name}</strong>
                                    </span>
                                </div>

                                {/* Grid of Cards: 2 Columns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                                    {players.map((sp: any) => {
                                        const p = sp.player;
                                        const fullName = p
                                            ? `${p.first_name || ''} ${p.middle_name || ''} ${p.surname || ''}`.trim()
                                            : 'खेळाडू';

                                        const isCaptain = sp.role === 'CAPTAIN';
                                        const isViceCaptain = sp.role === 'VICE_CAPTAIN';

                                        return (
                                            <div
                                                key={sp.id}
                                                className="id-card-item bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-[235px] relative"
                                            >
                                                {/* Card Header */}
                                                <div className="bg-[#6750A4] text-white px-3 py-1.5 flex items-center justify-between border-b border-black">
                                                    <div className="flex items-center gap-2">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src="/mkka-logo.png"
                                                            alt="MKKA"
                                                            className="w-7 h-7 object-contain bg-white rounded-full p-0.5"
                                                        />
                                                        <div>
                                                            <div className="text-[9px] font-black tracking-wider uppercase leading-tight">
                                                                MAHARASHTRA KHO-KHO ASSOCIATION
                                                            </div>
                                                            <div className="text-[8px] text-purple-200 uppercase font-semibold leading-tight">
                                                                अधिकृत खेळाडू ओळखपत्र (Official Accreditation)
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="font-mono font-black text-xs bg-white text-[#6750A4] px-2 py-0.5 rounded">
                                                        {squad.district?.code}
                                                    </span>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-3 flex gap-3 items-center flex-1">
                                                    {/* Photo & Jersey Box */}
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-20 h-24 bg-gray-100 border-2 border-gray-400 rounded-lg flex items-center justify-center overflow-hidden">
                                                            {p?.photo_path && p.photo_path !== 'demo/player-photo.jpg' ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={p.photo_path}
                                                                    alt={fullName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="text-3xl text-gray-400">👤</div>
                                                            )}
                                                        </div>
                                                        <div className="bg-black text-white text-[10px] font-black font-mono px-2 py-0.5 rounded">
                                                            जर्सी #{sp.jersey_no || '-'}
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 space-y-1 text-left">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {isCaptain && (
                                                                <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded">
                                                                    कर्णधार (C)
                                                                </span>
                                                            )}
                                                            {isViceCaptain && (
                                                                <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                                                                    उपकर्णधार (VC)
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-xs font-black text-gray-900 leading-snug uppercase">
                                                            {fullName}
                                                        </h3>

                                                        <div className="text-[10px] text-gray-700 space-y-0.5">
                                                            <div>
                                                                <span className="text-gray-500">जिल्हा: </span>
                                                                <strong>{squad.district?.name_mr}</strong>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">नोंदणी क्र.: </span>
                                                                <strong className="font-mono">{p?.player_id_number || 'MKKA-REG'}</strong>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">जन्मदिनांक: </span>
                                                                <strong className="font-mono">
                                                                    {p?.dob ? new Date(p.dob).toLocaleDateString('en-IN') : '-'}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Footer Bar */}
                                                <div className="bg-gray-100 border-t border-black px-3 py-1 flex justify-between items-center text-[9px]">
                                                    <span className="font-bold text-gray-700 truncate max-w-[240px]">
                                                        {tournament.name_mr}
                                                    </span>
                                                    <span className="font-bold text-[#6750A4] uppercase">
                                                        {tournament.category === 'SENIOR' ? 'वरिष्ठ' : 'सब-ज्युनिअर'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function TournamentIdCardsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#6750A4]">
                    <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-bold text-sm">ओळखपत्रे लोड होत आहेत...</p>
                </div>
            }
        >
            <TournamentIdCardsContent />
        </Suspense>
    );
}
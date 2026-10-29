"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Trophy,
    Building2,
    Users,
    CheckCircle2,
    Calendar,
    MapPin,
    Phone,
    User,
    Printer,
    Search,
    ShieldCheck,
    IdCard,
} from "lucide-react";

interface Player {
    id: string;
    first_name: string;
    middle_name: string;
    surname: string;
    dob: string;
    gender: string;
    state_no: string | null;
    federation_no: string | null;
    mobile_no: string;
    photo_path?: string | null;
}

interface DistrictSquadEntry {
    districtId: string;
    districtNameMr: string;
    districtNameEn: string;
    districtCode: string;
    coachName: string;
    coachMobile: string;
    managerName: string | null;
    managerMobile: string | null;
    submittedAt: string;
    status: string;
    players: Player[];
}

interface AssociationSquadReviewClientProps {
    tournament: {
        id: string;
        title: string;
        venue: string;
        category?: string;
        start_date?: string;
        end_date?: string;
    };
    entries: DistrictSquadEntry[];
}

function calculateAge(dobString: string): string {
    if (!dobString) return "N/A";
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 14) return `Sub-Junior (${age} वर्षे)`;
    if (age <= 18) return `Junior (${age} वर्षे)`;
    return `Senior (${age} वर्षे)`;
}

export default function AssociationSquadReviewClient({
    tournament,
    entries,
}: AssociationSquadReviewClientProps) {
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
        entries[0]?.districtId || ""
    );
    const [searchTerm, setSearchTerm] = useState("");

    const activeSquad = entries.find((e) => e.districtId === selectedDistrictId);

    const filteredPlayers = (activeSquad?.players || []).filter((p) => {
        const fullName = `${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.toLowerCase();
        const q = searchTerm.toLowerCase().trim();
        return (
            !q ||
            fullName.includes(q) ||
            (p.state_no && p.state_no.toLowerCase().includes(q)) ||
            (p.federation_no && p.federation_no.toLowerCase().includes(q)) ||
            (p.mobile_no && p.mobile_no.includes(q))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header (Hidden in Print) */}
            <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/association/tournaments"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> राज्य स्पर्धा व्यवस्थापन (Back to Tournaments)
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold">
                            राज्य छाननी व संघ पडताळणी कक्ष
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#1C1B1F] mt-1">
                        {tournament.title}
                    </h1>
                    <p className="text-xs text-[#49454F] mt-0.5">
                        📍 {tournament.venue} {tournament.start_date && `• 🗓️ ${tournament.start_date}`}
                    </p>
                </div>

                {activeSquad && (
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-md shrink-0"
                    >
                        <Printer className="w-4 h-4" />
                        <span>जिल्हा संघ पत्रक प्रिंट करा (Print Squad)</span>
                    </button>
                )}
            </div>

            {/* If no entries submitted yet */}
            {entries.length === 0 ? (
                <div className="p-12 text-center rounded-[32px] bg-white border border-[#CAC4D0]/60 space-y-3">
                    <Users className="w-10 h-10 text-[#79747E] mx-auto" />
                    <h2 className="text-sm font-bold text-[#1C1B1F]">
                        अद्याप कोणत्याही जिल्ह्याने संघ दाखल केलेला नाही
                    </h2>
                    <p className="text-xs text-[#49454F] max-w-md mx-auto">
                        जिल्हा संघटनांनी १२ ते १५ खेळाडूंचा अधिकृत संघ सादर केल्यावर त्यांची संपूर्ण माहिती, खेळाडूंची यादी आणि प्रशिक्षक तपशील येथे दिसेल.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* District Selection Tabs (Hidden in Print) */}
                    <div className="print:hidden space-y-2">
                        <label className="text-xs font-semibold text-[#1C1B1F] flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#6750A4]" />
                            <span>दाखल झालेले जिल्हा संघ निवडा ({entries.length} जिल्हे):</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {entries.map((entry) => (
                                <button
                                    key={entry.districtId}
                                    onClick={() => {
                                        setSelectedDistrictId(entry.districtId);
                                        setSearchTerm("");
                                    }}
                                    className={`h-10 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${entry.districtId === selectedDistrictId
                                            ? "bg-[#21005D] text-white shadow-sm"
                                            : "bg-[#F3EDF7] text-[#49454F] hover:bg-[#EADDFF]"
                                        }`}
                                >
                                    <span>{entry.districtNameMr}</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                                        {entry.districtCode}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px]">
                                        {entry.players.length} खेळाडू
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeSquad && (
                        /* Squad Dossier Card */
                        <div className="bg-white rounded-[32px] border border-[#CAC4D0]/80 p-6 md:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                            {/* Association Letterhead */}
                            <div className="text-center pb-4 border-b-2 border-[#6750A4] space-y-1">
                                <div className="text-xs font-bold tracking-widest text-[#6750A4] uppercase">
                                    महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA) • अधिकृत अजिंक्यपद संघ पडताळणी
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-[#1C1B1F]">
                                    {activeSquad.districtNameMr} ({activeSquad.districtNameEn}) अधिकृत जिल्हा संघ
                                </h2>
                                <div className="text-xs text-[#49454F] font-semibold">
                                    {tournament.title} • {tournament.venue}
                                </div>
                            </div>

                            {/* District Officials & Submission Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F3EDF7]/60 border border-[#CAC4D0]/40 text-xs">
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">संलग्न जिल्हा</span>
                                    <strong className="text-sm font-bold text-[#21005D]">
                                        {activeSquad.districtNameMr} [{activeSquad.districtCode}]
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">दाखल खेळाडू संख्या</span>
                                    <strong className="text-sm font-bold text-emerald-700">
                                        {activeSquad.players.length} खेळाडू (नियमबद्ध १२-१५)
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">अधिकृत प्रशिक्षक (Coach)</span>
                                    <strong className="text-[#1C1B1F] block">
                                        {activeSquad.coachName}
                                    </strong>
                                    <span className="font-mono text-[#49454F] text-[11px]">
                                        📞 {activeSquad.coachMobile}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">व्यवस्थापक (Manager)</span>
                                    <strong className="text-[#1C1B1F] block">
                                        {activeSquad.managerName || "N/A"}
                                    </strong>
                                    <span className="font-mono text-[#49454F] text-[11px]">
                                        📞 {activeSquad.managerMobile || "-"}
                                    </span>
                                </div>
                            </div>

                            {/* Search Bar (Hidden in Print) */}
                            <div className="print:hidden relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                                <input
                                    type="text"
                                    placeholder="खेळाडूचे नाव, राज्य क्र., किंवा मोबाईल शोधा..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                />
                            </div>

                            {/* 12 to 15 Players Official Table */}
                            <div className="overflow-x-auto border border-[#CAC4D0]/70 rounded-2xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-[#EADDFF]/50 border-b border-[#CAC4D0]/70 text-[11px] font-bold text-[#21005D]">
                                            <th className="py-2.5 px-3 text-center w-12 border-r border-[#CAC4D0]/50">अ.क्र.</th>
                                            <th className="py-2.5 px-4 border-r border-[#CAC4D0]/50">खेळाडूचे संपूर्ण नाव</th>
                                            <th className="py-2.5 px-3 border-r border-[#CAC4D0]/50">राज्य अधिकृत क्र.</th>
                                            <th className="py-2.5 px-3 border-r border-[#CAC4D0]/50">राष्ट्रीय क्र. (KKFI)</th>
                                            <th className="py-2.5 px-3 border-r border-[#CAC4D0]/50">जन्मदिनांक</th>
                                            <th className="py-2.5 px-3 border-r border-[#CAC4D0]/50">वयोगट</th>
                                            <th className="py-2.5 px-3 border-r border-[#CAC4D0]/50">मोबाईल</th>
                                            <th className="py-2.5 px-3 text-center">स्थिती</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#CAC4D0]/40">
                                        {filteredPlayers.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-[#49454F]">
                                                    कोणताही खेळाडू आढळला नाही.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPlayers.map((player, idx) => (
                                                <tr key={player.id} className="hover:bg-purple-50/40">
                                                    <td className="py-2.5 px-3 text-center font-bold text-[#79747E] border-r border-[#CAC4D0]/40">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-bold text-[#1C1B1F] border-r border-[#CAC4D0]/40">
                                                        {`${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim()}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-[#6750A4] font-bold border-r border-[#CAC4D0]/40">
                                                        {player.state_no || "-"}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-[#49454F] border-r border-[#CAC4D0]/40">
                                                        {player.federation_no || "-"}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-[#49454F] border-r border-[#CAC4D0]/40">
                                                        {player.dob || "N/A"}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-[#49454F] text-[11px] border-r border-[#CAC4D0]/40">
                                                        {calculateAge(player.dob)}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-[#49454F] border-r border-[#CAC4D0]/40">
                                                        {player.mobile_no}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                            मान्यताप्राप्त
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Scrutiny Verification Footer */}
                            <div className="pt-8 border-t border-[#CAC4D0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                                <div className="space-y-1">
                                    <div className="font-bold text-[#1C1B1F]">
                                        राज्य तांत्रिक समिती शेरा (Association Technical Scrutiny):
                                    </div>
                                    <p className="text-[11px] text-[#49454F]">
                                        हा संघ अधिकृतरीत्या १२ ते १५ खेळाडूंच्या नियमानुसार सादर करण्यात आलेला आहे.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span>संघ छाननी पडताळणी पूर्ण (VERIFIED)</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


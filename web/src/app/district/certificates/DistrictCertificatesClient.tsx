"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Award,
    Printer,
    Download,
    Users,
    Trophy,
    Calendar,
    MapPin,
    CheckCircle2,
    FileText,
    ShieldCheck,
} from "lucide-react";

interface DistrictSession {
    districtId: string;
    code: string;
    name_mr: string;
    name_en: string;
    username: string;
}

interface PlayerRecord {
    id: string;
    first_name: string;
    middle_name: string;
    surname: string;
    dob: string;
    gender: string;
    state_no: string | null;
    federation_no: string | null;
    mobile_no: string;
}

interface SubmittedTournament {
    id: string;
    title: string;
    venue: string;
    start_date: string;
    end_date: string;
    age_group?: string;
    coach_name: string;
    coach_mobile: string;
    manager_name: string | null;
    manager_mobile: string | null;
    submitted_at: string;
    players: PlayerRecord[];
}

interface DistrictCertificatesClientProps {
    session: DistrictSession;
    submittedTournaments: SubmittedTournament[];
}

export default function DistrictCertificatesClient({
    session,
    submittedTournaments,
}: DistrictCertificatesClientProps) {
    const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
        submittedTournaments[0]?.id || ""
    );

    const activeTournament = submittedTournaments.find(
        (t) => t.id === selectedTournamentId
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header (Hidden during print) */}
            <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/district/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> जिल्हा नियंत्रण कक्ष (Back to Dashboard)
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                        <Award className="w-7 h-7 text-[#6750A4]" />
                        पात्रता व स्पर्धा प्रमाणपत्र केंद्र (Eligibility Passes)
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        {session.name_mr} ({session.code}) — अधिकृत सबमिट केलेल्या राज्य अजिंक्यपद स्पर्धा संघाचे पात्रता प्रमाणपत्र.
                    </p>
                </div>

                {activeTournament && (
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-md shrink-0"
                    >
                        <Printer className="w-4 h-4" />
                        <span>अधिकृत पात्रता पत्र प्रिंट करा (Print Sheet)</span>
                    </button>
                )}
            </div>

            {submittedTournaments.length === 0 ? (
                <div className="p-12 text-center rounded-[32px] bg-white border border-[#CAC4D0]/60 space-y-3">
                    <Trophy className="w-10 h-10 text-[#79747E] mx-auto" />
                    <h2 className="text-sm font-bold text-[#1C1B1F]">
                        कोणतीही स्पर्धा नोंदणी आढळली नाही
                    </h2>
                    <p className="text-xs text-[#49454F] max-w-md mx-auto">
                        तुम्ही अद्याप कोणत्याही राज्य अजिंक्यपद स्पर्धेसाठी १२ ते १५ खेळाडूंचा संघ सबमिट केलेला नाही. आधी स्पर्धा संघ नोंदणी करा.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/district/competitions"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-semibold shadow-sm"
                        >
                            <span>स्पर्धा संघ नोंदणीकडे जा</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Tournament Selector (Hidden during print) */}
                    <div className="print:hidden p-4 rounded-[24px] bg-[#F3EDF7] border border-[#CAC4D0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs font-bold text-[#21005D] flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[#6750A4]" />
                            <span>स्पर्धा निवडा:</span>
                        </div>
                        <select
                            value={selectedTournamentId}
                            onChange={(e) => setSelectedTournamentId(e.target.value)}
                            className="h-10 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4] flex-1 max-w-lg"
                        >
                            {submittedTournaments.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title} ({t.venue})
                                </option>
                            ))}
                        </select>
                    </div>

                    {activeTournament && (
                        /* Printable Official Certificate Sheet */
                        <div className="bg-white rounded-[32px] border border-[#CAC4D0]/80 p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                            {/* Association Letterhead */}
                            <div className="text-center pb-4 border-b-2 border-[#6750A4] space-y-1">
                                <div className="text-xs font-bold tracking-widest text-[#6750A4] uppercase">
                                    महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA)
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-[#1C1B1F]">
                                    खेळाडू अधिकृत पात्रता प्रमाणपत्र (OFFICIAL ELIGIBILITY CERTIFICATE)
                                </h2>
                                <div className="text-xs text-[#49454F] font-semibold">
                                    {activeTournament.title} • {activeTournament.venue}
                                </div>
                            </div>

                            {/* District & Officials Information Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F3EDF7]/60 border border-[#CAC4D0]/40 text-xs">
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">सहभागी जिल्हा</span>
                                    <strong className="text-sm font-bold text-[#21005D]">
                                        {session.name_mr} ({session.code})
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">संघातील एकूण खेळाडू</span>
                                    <strong className="text-sm font-bold text-emerald-700">
                                        {activeTournament.players.length} खेळाडू (सादर)
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">अधिकृत प्रशिक्षक (Coach)</span>
                                    <strong className="text-[#1C1B1F]">
                                        {activeTournament.coach_name}
                                    </strong>
                                    <span className="block text-[10px] font-mono text-[#49454F]">
                                        {activeTournament.coach_mobile}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#79747E] block text-[10px]">व्यवस्थापक (Manager)</span>
                                    <strong className="text-[#1C1B1F]">
                                        {activeTournament.manager_name || "N/A"}
                                    </strong>
                                    <span className="block text-[10px] font-mono text-[#49454F]">
                                        {activeTournament.manager_mobile || "-"}
                                    </span>
                                </div>
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
                                            <th className="py-2.5 px-3 border-r border-[#CAC4D0]/50">मोबाईल</th>
                                            <th className="py-2.5 px-4 text-center w-32">खेळाडू स्वाक्षरी</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#CAC4D0]/40">
                                        {activeTournament.players.map((p, idx) => (
                                            <tr key={p.id} className="hover:bg-purple-50/30">
                                                <td className="py-2.5 px-3 text-center font-bold text-[#79747E] border-r border-[#CAC4D0]/40">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-2.5 px-4 font-bold text-[#1C1B1F] border-r border-[#CAC4D0]/40">
                                                    {`${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.trim()}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-[#6750A4] border-r border-[#CAC4D0]/40">
                                                    {p.state_no || "-"}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-[#49454F] border-r border-[#CAC4D0]/40">
                                                    {p.federation_no || "-"}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-[#49454F] border-r border-[#CAC4D0]/40">
                                                    {p.dob}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-[#49454F] border-r border-[#CAC4D0]/40">
                                                    {p.mobile_no}
                                                </td>
                                                <td className="py-2.5 px-4 border-r border-[#CAC4D0]/40">
                                                    <div className="h-6 border-b border-dashed border-[#79747E]/40" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Official Signatures Footer */}
                            <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs text-[#1C1B1F]">
                                <div>
                                    <div className="border-t border-black/60 pt-2 font-bold">
                                        जिल्हा सचिव / अध्यक्ष स्वाक्षरी
                                    </div>
                                    <span className="text-[10px] text-[#49454F]">
                                        {session.name_mr} जिल्हा खो-खो संघटना
                                    </span>
                                </div>
                                <div>
                                    <div className="border-t border-black/60 pt-2 font-bold">
                                        संघ प्रशिक्षक स्वाक्षरी
                                    </div>
                                    <span className="text-[10px] text-[#49454F]">
                                        ({activeTournament.coach_name})
                                    </span>
                                </div>
                                <div>
                                    <div className="border-t border-black/60 pt-2 font-bold">
                                        राज्य तांत्रिक समिती / Scrutiny
                                    </div>
                                    <span className="text-[10px] text-[#49454F]">
                                        महाराष्ट्र राज्य खो-खो असोसिएशन
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
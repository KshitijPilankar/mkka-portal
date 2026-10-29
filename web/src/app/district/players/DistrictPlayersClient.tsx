"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Filter,
    Users,
    Eye,
    X,
    Phone,
    Mail,
    Calendar,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    IdCard,
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
    tracking_id: string;
    first_name: string;
    middle_name: string;
    surname: string;
    father_name: string | null;
    mother_name: string | null;
    gender: string;
    dob: string;
    mobile_no: string;
    email: string;
    taluka: string | null;
    city: string | null;
    pincode: string;
    full_address: string;
    status: string;
    state_no: string | null;
    federation_no: string | null;
    photo_path: string | null;
    address_proof_path: string | null;
    id_proof_path: string | null;
    dob_proof_path: string | null;
    created_at: string;
}

interface DistrictPlayersClientProps {
    session: DistrictSession;
    initialPlayers: PlayerRecord[];
}

function calculateAge(dobString: string): { age: number; section: string } {
    if (!dobString) return { age: 0, section: "N/A" };
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return { age: 0, section: "N/A" };
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    let section = "Senior (१८ वर्षांवरील)";
    if (age < 14) section = "Sub Junior (१४ वर्षांखालील)";
    else if (age <= 18) section = "Junior (१४ ते १८ वर्षे)";
    return { age, section };
}

export default function DistrictPlayersClient({
    session,
    initialPlayers,
}: DistrictPlayersClientProps) {
    const [players] = useState<PlayerRecord[]>(initialPlayers);
    const [activeTab, setActiveTab] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeModalPlayer, setActiveModalPlayer] = useState<PlayerRecord | null>(null);

    const getDocViewerUrl = (path: string | null) => {
        if (!path) return "#";
        return `/api/view-document?path=${encodeURIComponent(path)}`;
    };

    const filteredPlayers = players.filter((p) => {
        const fullName = `${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.toLowerCase();
        const q = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !q ||
            fullName.includes(q) ||
            (p.state_no && p.state_no.toLowerCase().includes(q)) ||
            (p.mobile_no && p.mobile_no.includes(q)) ||
            (p.tracking_id && p.tracking_id.toLowerCase().includes(q));

        if (activeTab === "APPROVED") {
            return matchesSearch && p.status === "APPROVED";
        }
        if (activeTab === "PENDING") {
            return matchesSearch && p.status !== "APPROVED";
        }
        return matchesSearch;
    });

    const activeCount = players.filter((p) => p.status === "APPROVED").length;
    const pendingCount = players.filter((p) => p.status !== "APPROVED").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/district/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> जिल्हा नियंत्रण कक्ष (Back to Dashboard)
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                        <Users className="w-7 h-7 text-[#6750A4]" />
                        {session.name_mr} ({session.code}) - खेळाडू नोंदणी यादी
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        आपल्या जिल्हा संघटनेअंतर्गत नोंदणी झालेले सर्व अधिकृत खेळाडू, छाननी स्थिती आणि वैयक्तिक माहिती.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[#CAC4D0]/60 pb-2">
                <button
                    onClick={() => setActiveTab("ALL")}
                    className={`h-10 px-5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "ALL"
                            ? "bg-[#6750A4] text-white shadow-sm"
                            : "bg-[#F3EDF7] text-[#49454F] hover:bg-[#EADDFF]/50"
                        }`}
                >
                    <span>सर्व खेळाडू (All)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                        {players.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("APPROVED")}
                    className={`h-10 px-5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "APPROVED"
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>मान्यताप्राप्त (Active)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                        {activeCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("PENDING")}
                    className={`h-10 px-5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "PENDING"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>छाननी प्रलंबित (Pending)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                        {pendingCount}
                    </span>
                </button>
            </div>

            {/* Search Input */}
            <div className="p-4 rounded-[24px] bg-[#F3EDF7] border border-[#CAC4D0]/50 flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                    <input
                        type="text"
                        placeholder="खेळाडूचे नाव, राज्य क्र., मोबाईल किंवा ट्रॅकिंग आयडी शोधा..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                    />
                </div>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="text-xs text-[#6750A4] font-semibold hover:underline"
                    >
                        साफ करा (Clear)
                    </button>
                )}
            </div>

            {/* Players Table */}
            <div className="rounded-[28px] bg-white border border-[#CAC4D0]/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EADDFF]/50 border-b border-[#CAC4D0]/60 text-[11px] font-bold text-[#21005D]">
                                <th className="py-3 px-3 text-center w-12">अ.क्र.</th>
                                <th className="py-3 px-4">खेळाडूचे संपूर्ण नाव</th>
                                <th className="py-3 px-4">राज्य अधिकृत क्र. (State No)</th>
                                <th className="py-3 px-4">वयोगट (Section)</th>
                                <th className="py-3 px-4">लिंग</th>
                                <th className="py-3 px-4">मोबाईल</th>
                                <th className="py-3 px-3 text-center">सद्यस्थिती</th>
                                <th className="py-3 px-4 text-center">कृती</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-xs text-[#1C1B1F]">
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-[#49454F]">
                                        या विभागात एकही खेळाडू आढळला नाही.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((player, index) => {
                                    const fullName = `${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim();
                                    const { section } = calculateAge(player.dob);

                                    return (
                                        <tr key={player.id} className="hover:bg-[#F3EDF7]/40 transition-colors">
                                            <td className="py-3.5 px-3 text-center font-medium text-[#79747E]">
                                                {index + 1}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-[#1C1B1F]">
                                                {fullName}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-[#6750A4]">
                                                {player.state_no || <span className="text-[#79747E] font-normal italic">प्रलंबित</span>}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#49454F] text-[11px]">
                                                {section}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#49454F]">
                                                {player.gender === "MALE" ? "पुरुष" : "महिला"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#49454F]">
                                                {player.mobile_no}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${player.status === "APPROVED"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : player.status === "REJECTED"
                                                                ? "bg-rose-100 text-rose-800"
                                                                : "bg-amber-100 text-amber-800"
                                                        }`}
                                                >
                                                    {player.status === "APPROVED"
                                                        ? "मान्यताप्राप्त"
                                                        : player.status === "REJECTED"
                                                            ? "नाकारले"
                                                            : "छाननी प्रलंबित"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => setActiveModalPlayer(player)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#6750A4] text-[#6750A4] text-[11px] font-semibold hover:bg-[#6750A4]/10 active:scale-95 transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>तपशील</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Dossier Modal */}
            {activeModalPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 border border-[#CAC4D0]">
                        <div className="flex items-center justify-between pb-4 border-b border-[#CAC4D0]/60">
                            <div>
                                <span className="text-[10px] font-bold text-[#6750A4] tracking-wider uppercase">
                                    जिल्हा खेळाडू तपशील (DISTRICT PLAYER DOSSIER)
                                </span>
                                <h2 className="text-xl font-bold text-[#1C1B1F]">
                                    {`${activeModalPlayer.first_name || ""} ${activeModalPlayer.middle_name || ""} ${activeModalPlayer.surname || ""}`.trim()}
                                </h2>
                                <div className="text-xs text-[#49454F] font-mono mt-0.5">
                                    Tracking ID: {activeModalPlayer.tracking_id}
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveModalPlayer(null)}
                                className="w-10 h-10 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 space-y-2">
                                <div className="font-bold text-[#6750A4] flex items-center gap-1.5">
                                    <IdCard className="w-4 h-4" /> वैयक्तिक माहिती
                                </div>
                                <div>वडिलांचे नाव: <strong>{activeModalPlayer.father_name || "N/A"}</strong></div>
                                <div>आईचे नाव: <strong>{activeModalPlayer.mother_name || "N/A"}</strong></div>
                                <div>जन्मदिनांक: <strong>{activeModalPlayer.dob || "N/A"}</strong></div>
                                <div>वयोगट: <strong>{calculateAge(activeModalPlayer.dob).section}</strong></div>
                                <div>राज्य क्र.: <strong className="font-mono text-[#6750A4]">{activeModalPlayer.state_no || "प्रलंबित"}</strong></div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 space-y-2">
                                <div className="font-bold text-[#6750A4] flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" /> संपर्क व पत्ता
                                </div>
                                <div>मोबाईल: <strong className="font-mono">{activeModalPlayer.mobile_no}</strong></div>
                                <div>ईमेल: <strong>{activeModalPlayer.email}</strong></div>
                                <div>पत्ता: <span className="text-[#49454F]">{activeModalPlayer.full_address} - {activeModalPlayer.pincode}</span></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[#1C1B1F]">अपलोड केलेली कागदपत्रे:</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                {activeModalPlayer.photo_path && (
                                    <a
                                        href={getDocViewerUrl(activeModalPlayer.photo_path)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">पासपोर्ट फोटो</span>
                                    </a>
                                )}
                                {activeModalPlayer.id_proof_path && (
                                    <a
                                        href={getDocViewerUrl(activeModalPlayer.id_proof_path)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">ओळख पुरावा</span>
                                    </a>
                                )}
                                {activeModalPlayer.dob_proof_path && (
                                    <a
                                        href={getDocViewerUrl(activeModalPlayer.dob_proof_path)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">जन्म दाखला</span>
                                    </a>
                                )}
                                {activeModalPlayer.address_proof_path && (
                                    <a
                                        href={getDocViewerUrl(activeModalPlayer.address_proof_path)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">पत्ता पुरावा</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#CAC4D0]/60 flex justify-end">
                            <button
                                onClick={() => setActiveModalPlayer(null)}
                                className="h-10 px-6 rounded-full bg-[#E7E0EC] text-[#1C1B1F] text-xs font-semibold hover:bg-[#CAC4D0] transition-all"
                            >
                                बंद करा (Close)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Loader2,
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    FileText,
    ExternalLink,
    X,
    IdCard,
    Search,
} from "lucide-react";
import { approvePlayerAction, rejectPlayerAction } from "@/app/actions/admin-approvals";

interface PlayingDistrict {
    name_en?: string;
    name_mr?: string;
    code?: string;
}

interface Player {
    id: string;
    player_id_number?: string | null;
    tracking_id?: string | null;
    first_name: string;
    middle_name?: string | null;
    surname: string;
    father_name?: string | null;
    mother_name?: string | null;
    gender: string;
    dob: string;
    mobile_no: string;
    email: string;
    full_address?: string | null;
    taluka?: string | null;
    city?: string | null;
    pincode?: string | null;
    playing_district_id?: string;
    playing_district?: PlayingDistrict | null;
    status: string;
    photo_path?: string | null;
    address_proof_path?: string | null;
    id_proof_path?: string | null;
    dob_proof_path?: string | null;
    other_doc_path?: string | null;
    created_at?: string;
}

interface ApprovalClientProps {
    initialPlayers: Player[];
}

function calculateAge(dobStr: string): { age: number; category: string } {
    if (!dobStr) return { age: 0, category: "N/A" };
    const birth = new Date(dobStr);
    if (isNaN(birth.getTime())) return { age: 0, category: "N/A" };
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    let category = "वरिष्ठ गट (Senior)";
    if (age < 14) category = "सब-ज्युनियर (Sub-Junior U-14)";
    else if (age <= 18) category = "ज्युनियर (Junior U-18)";
    return { age, category };
}

export default function ApprovalClient({ initialPlayers }: ApprovalClientProps) {
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const filteredPlayers = players.filter((p) => {
        const fullName = `${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.toLowerCase();
        const q = searchTerm.toLowerCase().trim();
        return (
            !q ||
            fullName.includes(q) ||
            (p.mobile_no && p.mobile_no.includes(q)) ||
            (p.player_id_number && p.player_id_number.toLowerCase().includes(q))
        );
    });

    const getDocViewerUrl = (path?: string | null) => {
        if (!path) return "#";
        return `/api/view-document?path=${encodeURIComponent(path)}`;
    };

    const handleApprove = (playerId: string) => {
        startTransition(async () => {
            try {
                const res = await approvePlayerAction(playerId);
                if (res.success) {
                    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
                    setSelectedPlayer(null);
                    setFeedback({
                        type: "success",
                        text: "खेळाडूचा अर्ज मंजूर करण्यात आला असून अधिकृत राज्य क्रमांक (MKKA ID) तयार झाला आहे!",
                    });
                } else {
                    setFeedback({ type: "error", text: res.error || "मान्यता देताना त्रुटी आली." });
                }
            } catch (err: any) {
                setFeedback({ type: "error", text: err.message || "सर्व्हर त्रुटी आली." });
            }
        });
    };

    const handleReject = (playerId: string) => {
        startTransition(async () => {
            try {
                const res = await rejectPlayerAction(playerId);
                if (res.success) {
                    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
                    setSelectedPlayer(null);
                    setFeedback({
                        type: "success",
                        text: "खेळाडूचा अर्ज नामंजूर करण्यात आला आहे.",
                    });
                } else {
                    setFeedback({ type: "error", text: res.error || "नाकारताना त्रुटी आली." });
                }
            } catch (err: any) {
                setFeedback({ type: "error", text: err.message || "सर्व्हर त्रुटी आली." });
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/association/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> मुख्य नियंत्रण कक्ष (Back to Dashboard)
                </Link>
                <div className="p-6 md:p-8 rounded-[32px] bg-[#F3EDF7] border border-[#CAC4D0]/50 shadow-sm space-y-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[10px] font-bold tracking-wider uppercase mb-1">
                        महाराष्ट्र राज्य खो-खो असोसिएशन • प्रशासकीय नियंत्रण कक्ष
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1B1F]">
                        खेळाडू नोंदणी छाननी व पडताळणी कक्ष (Player Scrutiny Portal)
                    </h1>
                    <p className="text-xs text-[#49454F]">
                        प्रलंबित पडताळणी अर्ज संख्या: <strong className="text-[#21005D]">{players.length}</strong> अर्ज छाननीसाठी उपलब्ध
                    </p>
                </div>
            </div>

            {feedback && (
                <div
                    className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${feedback.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {feedback.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                    </div>
                    <button onClick={() => setFeedback(null)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Search Input */}
            <div className="p-4 rounded-[24px] bg-[#F3EDF7] border border-[#CAC4D0]/50 flex items-center gap-3">
                <Search className="w-4 h-4 text-[#79747E]" />
                <input
                    type="text"
                    placeholder="खेळाडूचे नाव किंवा मोबाईल नंबरने शोधा..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-[#1C1B1F] focus:outline-none"
                />
            </div>

            {/* Players List Table */}
            <div className="rounded-[28px] bg-white border border-[#CAC4D0]/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EADDFF]/50 border-b border-[#CAC4D0]/60 text-[11px] font-bold text-[#21005D]">
                                <th className="py-3 px-4">खेळाडूचे नाव (PLAYER NAME)</th>
                                <th className="py-3 px-4">जिल्हा (PLAYING DISTRICT)</th>
                                <th className="py-3 px-4">ओळख क्रमांक (ID)</th>
                                <th className="py-3 px-4">मोबाईल (MOBILE)</th>
                                <th className="py-3 px-4">अर्ज दिनांक (SUBMITTED)</th>
                                <th className="py-3 px-4 text-center">कृती (ACTIONS)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-xs text-[#1C1B1F]">
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[#49454F]">
                                        सध्या छाननीसाठी एकही प्रलंबित अर्ज नाही.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((p) => {
                                    const fullName = `${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.trim();
                                    const distName = p.playing_district?.name_mr || p.playing_district?.name_en || "जिल्हा";
                                    const displayId = p.player_id_number || p.tracking_id || p.id.slice(0, 8);

                                    return (
                                        <tr key={p.id} className="hover:bg-[#F3EDF7]/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-[#1C1B1F]">
                                                {fullName}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#49454F]">
                                                {distName} {p.playing_district?.code ? `(${p.playing_district.code})` : ""}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#6750A4] text-[11px]">
                                                {displayId}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#49454F]">
                                                {p.mobile_no}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#49454F] text-[11px]">
                                                {p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => setSelectedPlayer(p)}
                                                    className="px-4 py-1.5 rounded-full bg-[#6750A4]/10 text-[#6750A4] hover:bg-[#6750A4] hover:text-white font-semibold text-[11px] transition-all active:scale-95 border border-[#6750A4]/30"
                                                >
                                                    तपशील व कागदपत्रे तपासा
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

            {/* Comprehensive Verification Dossier Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 border border-[#CAC4D0]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#CAC4D0]/60">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                    <IdCard className="w-6 h-6 text-[#6750A4]" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">
                                        खेळाडू संपूर्ण अर्ज पडताळणी (PLAYER SCRUTINY DOSSIER)
                                    </span>
                                    <h2 className="text-xl font-extrabold text-[#1C1B1F]">
                                        {`${selectedPlayer.first_name || ""} ${selectedPlayer.middle_name || ""} ${selectedPlayer.surname || ""}`.trim()}
                                    </h2>
                                    <span className="text-xs text-[#79747E] font-mono">
                                        ID / Tracking: {selectedPlayer.player_id_number || selectedPlayer.tracking_id || selectedPlayer.id}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPlayer(null)}
                                className="w-10 h-10 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Section 1: Personal & Family Details */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-[#21005D] flex items-center gap-1.5 uppercase tracking-wide">
                                <User className="w-3.5 h-3.5 text-[#6750A4]" />
                                <span>१. वैयक्तिक व कौटुंबिक माहिती (Personal Profile)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 text-xs">
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">वडिलांचे नाव</span>
                                    <strong className="text-[#1C1B1F]">{selectedPlayer.father_name || selectedPlayer.middle_name || "-"}</strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">आईचे नाव</span>
                                    <strong className="text-[#1C1B1F]">{selectedPlayer.mother_name || "-"}</strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">लिंग (Gender)</span>
                                    <strong className="text-[#1C1B1F]">{selectedPlayer.gender === "MALE" ? "पुरुष" : "महिला"}</strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">जन्मदिनांक (DOB)</span>
                                    <strong className="font-mono text-[#1C1B1F]">{selectedPlayer.dob}</strong>
                                    <span className="text-[10px] text-[#6750A4] block font-semibold">
                                        वय: {calculateAge(selectedPlayer.dob).age} वर्षे ({calculateAge(selectedPlayer.dob).category})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact, Address & District Representation */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-[#21005D] flex items-center gap-1.5 uppercase tracking-wide">
                                <MapPin className="w-3.5 h-3.5 text-[#6750A4]" />
                                <span>२. संपर्क, पत्ता व जिल्हा प्रतिनिधित्व (Contact & Representation)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 text-xs">
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">मोबाईल क्रमांक</span>
                                    <strong className="font-mono text-[#1C1B1F]">{selectedPlayer.mobile_no}</strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">ईमेल आयडी</span>
                                    <strong className="text-[#1C1B1F] truncate block">{selectedPlayer.email}</strong>
                                </div>
                                <div>
                                    <span className="text-[#79747E] text-[10px] block">खेळणारा अधिकृत जिल्हा</span>
                                    <strong className="text-[#6750A4]">
                                        {selectedPlayer.playing_district?.name_mr || "संलग्न जिल्हा"}
                                    </strong>
                                </div>
                                <div className="sm:col-span-3 pt-2 border-t border-[#CAC4D0]/30">
                                    <span className="text-[#79747E] text-[10px] block">संपूर्ण निवासी पत्ता (Full Address)</span>
                                    <span className="text-[#1C1B1F] font-medium leading-relaxed">
                                        {selectedPlayer.full_address || "पत्ता नोंद उपलब्ध नाही"}
                                        {selectedPlayer.taluka ? `, तालुका: ${selectedPlayer.taluka}` : ""}
                                        {selectedPlayer.city ? `, शहर: ${selectedPlayer.city}` : ""}
                                        {selectedPlayer.pincode ? ` - पिनकोड: ${selectedPlayer.pincode}` : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Uploaded Documents */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-[#21005D] flex items-center gap-1.5 uppercase tracking-wide">
                                <FileText className="w-3.5 h-3.5 text-[#6750A4]" />
                                <span>३. अपलोड केलेली मूळ कागदपत्रे (Uploaded Documents)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                {/* 1. Photo */}
                                <div className="p-3 rounded-2xl border border-[#CAC4D0]/70 bg-white space-y-1.5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-[#79747E] block">१. खेळाडू फोटो</span>
                                        <strong className="text-xs text-[#1C1B1F]">Photograph</strong>
                                    </div>
                                    {selectedPlayer.photo_path ? (
                                        <a
                                            href={getDocViewerUrl(selectedPlayer.photo_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6750A4] hover:underline"
                                        >
                                            <span>फोटो उघडा</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-[#79747E] italic">अपलोड नाही</span>
                                    )}
                                </div>

                                {/* 2. Address / Aadhaar Proof */}
                                <div className="p-3 rounded-2xl border border-[#CAC4D0]/70 bg-white space-y-1.5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-[#79747E] block">२. पत्ता पुरावा</span>
                                        <strong className="text-xs text-[#1C1B1F]">Address Proof</strong>
                                    </div>
                                    {selectedPlayer.address_proof_path ? (
                                        <a
                                            href={getDocViewerUrl(selectedPlayer.address_proof_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6750A4] hover:underline"
                                        >
                                            <span>कागदपत्र पहा</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-[#79747E] italic">अपलोड नाही</span>
                                    )}
                                </div>

                                {/* 3. ID Proof */}
                                <div className="p-3 rounded-2xl border border-[#CAC4D0]/70 bg-white space-y-1.5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-[#79747E] block">३. ओळख पुरावा</span>
                                        <strong className="text-xs text-[#1C1B1F]">ID Proof</strong>
                                    </div>
                                    {selectedPlayer.id_proof_path ? (
                                        <a
                                            href={getDocViewerUrl(selectedPlayer.id_proof_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6750A4] hover:underline"
                                        >
                                            <span>कागदपत्र पहा</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-[#79747E] italic">अपलोड नाही</span>
                                    )}
                                </div>

                                {/* 4. DOB Proof */}
                                <div className="p-3 rounded-2xl border border-[#CAC4D0]/70 bg-white space-y-1.5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-[#79747E] block">४. जन्म दाखला</span>
                                        <strong className="text-xs text-[#1C1B1F]">DOB Certificate</strong>
                                    </div>
                                    {selectedPlayer.dob_proof_path ? (
                                        <a
                                            href={getDocViewerUrl(selectedPlayer.dob_proof_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6750A4] hover:underline"
                                        >
                                            <span>दाखला तपासा</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-[#79747E] italic">अपलोड नाही</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="pt-4 border-t border-[#CAC4D0]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedPlayer(null)}
                                className="h-11 px-5 rounded-full bg-[#E7E0EC] text-[#1C1B1F] text-xs font-semibold hover:bg-[#CAC4D0] transition-all w-full sm:w-auto"
                            >
                                बंद करा (Close)
                            </button>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleReject(selectedPlayer.id)}
                                    disabled={isPending}
                                    className="h-11 px-6 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    अर्ज नाकारा (Reject)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleApprove(selectedPlayer.id)}
                                    disabled={isPending}
                                    className="h-11 px-7 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 transition-all active:scale-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>प्रक्रिया होत आहे...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>पात्र खेळाडू मंजूर करा (Approve & Generate ID)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
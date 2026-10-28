"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Filter,
    Users,
    Eye,
    Edit3,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    FileSpreadsheet,
    IdCard,
    MapPin,
    Calendar,
    Phone,
    Mail,
    ExternalLink,
} from "lucide-react";
import { updateFederationNoAction } from "@/app/actions/association-players";

interface District {
    id: string;
    name_en: string;
    name_mr: string;
    code: string;
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
    playing_district_id: string;
    residential_district_id: string;
    status: string;
    state_no: string | null;
    federation_no: string | null;
    photo_path: string | null;
    address_proof_path: string | null;
    id_proof_path: string | null;
    dob_proof_path: string | null;
    other_doc_path: string | null;
    created_at: string;
}

interface PlayersDirectoryClientProps {
    initialPlayers: PlayerRecord[];
    districts: District[];
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

export default function PlayersDirectoryClient({
    initialPlayers,
    districts,
}: PlayersDirectoryClientProps) {
    const [players, setPlayers] = useState<PlayerRecord[]>(initialPlayers);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [activeModalPlayer, setActiveModalPlayer] = useState<PlayerRecord | null>(null);
    const [federationInput, setFederationInput] = useState("");
    const [isPending, startTransition] = useTransition();
    const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const districtMap = new Map(districts.map((d) => [d.id, d]));

    const filteredPlayers = players.filter((p) => {
        const fullName = `${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.toLowerCase();
        const query = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !query ||
            fullName.includes(query) ||
            (p.state_no && p.state_no.toLowerCase().includes(query)) ||
            (p.federation_no && p.federation_no.toLowerCase().includes(query)) ||
            (p.mobile_no && p.mobile_no.includes(query)) ||
            (p.tracking_id && p.tracking_id.toLowerCase().includes(query));

        const matchesDistrict = !selectedDistrict || p.playing_district_id === selectedDistrict;
        const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;

        return matchesSearch && matchesDistrict && matchesStatus;
    });

    const openPlayerModal = (player: PlayerRecord) => {
        setActiveModalPlayer(player);
        setFederationInput(player.federation_no || "");
        setToastMessage(null);
    };

    const closeModal = () => {
        setActiveModalPlayer(null);
        setFederationInput("");
    };

    const handleSaveFederationNo = () => {
        if (!activeModalPlayer) return;

        startTransition(async () => {
            const result = await updateFederationNoAction(activeModalPlayer.id, federationInput);
            if (result.success) {
                setPlayers((prev) =>
                    prev.map((item) =>
                        item.id === activeModalPlayer.id
                            ? { ...item, federation_no: federationInput.trim() || null }
                            : item
                    )
                );
                setActiveModalPlayer((prev) =>
                    prev ? { ...prev, federation_no: federationInput.trim() || null } : null
                );
                setToastMessage({
                    type: "success",
                    text: "राष्ट्रीय फेडरेशन क्रमांक यशस्वीरित्या सेव्ह झाला! (Federation No. Updated)",
                });
            } else {
                setToastMessage({
                    type: "error",
                    text: result.error || "अपडेट करताना त्रुटी आली.",
                });
            }
        });
    };

    const getPublicDocUrl = (path: string | null) => {
        if (!path) return null;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        return `${supabaseUrl}/storage/v1/object/public/documents/${path}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/association/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> मुख्य नियंत्रण कक्ष (Back to Dashboard)
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                        <Users className="w-7 h-7 text-[#6750A4]" />
                        खेळाडू मुख्य यादी व व्यवस्थापन (Master Players Directory)
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        महाराष्ट्रातील सर्व नोंदणीकृत खेळाडूंची यादी, सद्यस्थिती, राज्य क्रमांक आणि राष्ट्रीय फेडरेशन क्रमांक (KKFI) व्यवस्थापन.
                    </p>
                </div>

                <Link
                    href="/association/players/download"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-semibold hover:bg-[#EADDFF]/80 active:scale-95 transition-all shadow-sm shrink-0"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>एक्सेल डाऊनलोड केंद्र</span>
                </Link>
            </div>

            {toastMessage && (
                <div
                    className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${toastMessage.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {toastMessage.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{toastMessage.text}</span>
                    </div>
                    <button onClick={() => setToastMessage(null)} className="text-[#49454F] hover:text-black">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="p-4 md:p-6 rounded-[28px] bg-[#F3EDF7] border border-[#CAC4D0]/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5 relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                        <input
                            type="text"
                            placeholder="खेळाडूचे नाव, राज्य क्र., मोबाईल किंवा ट्रॅकिंग आयडी शोधा..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] placeholder:text-[#79747E] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        />
                    </div>

                    <div className="md:col-span-4 relative">
                        <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        >
                            <option value="">-- सर्व ३६ जिल्हे (All Districts) --</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name_mr} ({d.name_en}) [{d.code}]
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        >
                            <option value="ALL">सर्व सद्यस्थिती (All Status)</option>
                            <option value="APPROVED">मान्यताप्राप्त (Approved)</option>
                            <option value="PENDING_SCRUTINY">छाननी प्रलंबित (Pending)</option>
                            <option value="REJECTED">नाकारलेले (Rejected)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#49454F] pt-2 border-t border-[#CAC4D0]/30">
                    <div>
                        दाखवत आहे: <strong className="text-[#1C1B1F]">{filteredPlayers.length}</strong> पैकी {players.length} खेळाडू
                    </div>
                    {(searchTerm || selectedDistrict || selectedStatus !== "ALL") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedDistrict("");
                                setSelectedStatus("ALL");
                            }}
                            className="text-[#6750A4] font-medium hover:underline"
                        >
                            फिल्टर साफ करा (Reset Filters)
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-[28px] bg-white border border-[#CAC4D0]/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EADDFF]/50 border-b border-[#CAC4D0]/60 text-[11px] font-bold text-[#21005D]">
                                <th className="py-3 px-3 text-center w-12">अ.क्र.</th>
                                <th className="py-3 px-4">खेळाडूचे संपूर्ण नाव</th>
                                <th className="py-3 px-4">राज्य क्र. (State No)</th>
                                <th className="py-3 px-4">राष्ट्रीय क्र. (Federation No)</th>
                                <th className="py-3 px-4">जिल्हा</th>
                                <th className="py-3 px-4">वयोगट</th>
                                <th className="py-3 px-4">मोबाईल</th>
                                <th className="py-3 px-3 text-center">स्थिती</th>
                                <th className="py-3 px-4 text-center">कृती (Action)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-xs text-[#1C1B1F]">
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-[#49454F]">
                                        कोणताही खेळाडू आढळला नाही. कृपया फिल्टर बदलून शोधा.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((player, index) => {
                                    const fullName = `${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim();
                                    const dist = districtMap.get(player.playing_district_id);
                                    const { section } = calculateAge(player.dob);

                                    return (
                                        <tr key={player.id} className="hover:bg-[#F3EDF7]/40 transition-colors">
                                            <td className="py-3.5 px-3 text-center font-medium text-[#79747E]">
                                                {index + 1}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-[#1C1B1F]">
                                                {fullName}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-medium text-[#6750A4]">
                                                {player.state_no || <span className="text-[#79747E] font-sans italic">प्रलंबित</span>}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono">
                                                {player.federation_no ? (
                                                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#E8DEF8] text-[#21005D] font-bold">
                                                        {player.federation_no}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#79747E] italic text-[11px]">- नोंद नाही -</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#49454F]">
                                                {dist ? `${dist.name_mr} (${dist.code})` : "N/A"}
                                            </td>
                                            <td className="py-3.5 px-4 text-[11px] text-[#49454F]">
                                                {section}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#49454F]">
                                                {player.mobile_no}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${player.status === "APPROVED"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : player.status === "REJECTED"
                                                                ? "bg-rose-100 text-rose-800"
                                                                : "bg-amber-100 text-amber-800"
                                                        }`}
                                                >
                                                    {player.status === "APPROVED"
                                                        ? "मंजूर"
                                                        : player.status === "REJECTED"
                                                            ? "नाकारले"
                                                            : "प्रलंबित"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => openPlayerModal(player)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#6750A4] text-[#6750A4] text-[11px] font-semibold hover:bg-[#6750A4]/10 active:scale-95 transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>माहिती व संपादन</span>
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

            {activeModalPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 border border-[#CAC4D0]">
                        <div className="flex items-center justify-between pb-4 border-b border-[#CAC4D0]/60">
                            <div>
                                <span className="text-[10px] font-bold text-[#6750A4] tracking-wider uppercase">
                                    खेळाडू सविस्तर प्रोफाइल (PLAYER DOSSIER)
                                </span>
                                <h2 className="text-xl font-bold text-[#1C1B1F]">
                                    {`${activeModalPlayer.first_name || ""} ${activeModalPlayer.middle_name || ""} ${activeModalPlayer.surname || ""}`.trim()}
                                </h2>
                                <div className="text-xs text-[#49454F] font-mono mt-0.5">
                                    Tracking ID: {activeModalPlayer.tracking_id}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-10 h-10 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#F3EDF7] border border-[#6750A4]/30 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#21005D]">
                                <Edit3 className="w-4 h-4 text-[#6750A4]" />
                                <span>राष्ट्रीय फेडरेशन क्रमांक व्यवस्थापन (KKFI Federation No.)</span>
                            </div>
                            <p className="text-[11px] text-[#49454F]">
                                भारतीय खो-खो फेडरेशन (KKFI) कडून प्राप्त झालेला अधिकृत राष्ट्रीय नोंदणी क्रमांक येथे नमूद करा:
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="उदा. KKFI-MH-2026-9842"
                                    value={federationInput}
                                    onChange={(e) => setFederationInput(e.target.value)}
                                    className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-mono text-xs font-semibold text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                />
                                <button
                                    onClick={handleSaveFederationNo}
                                    disabled={isPending}
                                    className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all disabled:opacity-50 shadow-sm shrink-0"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>जतन होत आहे...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>क्रमांक सेव्ह करा</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 space-y-2">
                                <div className="font-bold text-[#6750A4] flex items-center gap-1.5">
                                    <IdCard className="w-4 h-4" /> वैयक्तिक तपशील
                                </div>
                                <div>वडिलांचे नाव: <strong>{activeModalPlayer.father_name || "N/A"}</strong></div>
                                <div>आईचे नाव: <strong>{activeModalPlayer.mother_name || "N/A"}</strong></div>
                                <div>लिंग: <strong>{activeModalPlayer.gender === "MALE" ? "पुरुष (Male)" : "महिला (Female)"}</strong></div>
                                <div>जन्मदिनांक: <strong>{activeModalPlayer.dob || "N/A"}</strong> ({calculateAge(activeModalPlayer.dob).section})</div>
                                <div>राज्य अधिकृत क्र: <strong className="font-mono text-[#6750A4]">{activeModalPlayer.state_no || "Pending"}</strong></div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 space-y-2">
                                <div className="font-bold text-[#6750A4] flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" /> संपर्क व पत्ता
                                </div>
                                <div>मोबाईल: <strong className="font-mono">{activeModalPlayer.mobile_no}</strong></div>
                                <div>ईमेल: <strong>{activeModalPlayer.email}</strong></div>
                                <div>
                                    खेळणारा जिल्हा: <strong>{districtMap.get(activeModalPlayer.playing_district_id)?.name_mr || "N/A"}</strong>
                                </div>
                                <div>
                                    राहणारा जिल्हा: <strong>{districtMap.get(activeModalPlayer.residential_district_id)?.name_mr || "N/A"}</strong>
                                </div>
                                <div>पत्ता: <span className="text-[#49454F]">{activeModalPlayer.full_address} - {activeModalPlayer.pincode}</span></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[#1C1B1F]">अपलोड केलेली कागदपत्रे (Attached Documents):</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                {activeModalPlayer.photo_path && (
                                    <a
                                        href={getPublicDocUrl(activeModalPlayer.photo_path) || "#"}
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
                                        href={getPublicDocUrl(activeModalPlayer.id_proof_path) || "#"}
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
                                        href={getPublicDocUrl(activeModalPlayer.dob_proof_path) || "#"}
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
                                        href={getPublicDocUrl(activeModalPlayer.address_proof_path) || "#"}
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
                                onClick={closeModal}
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
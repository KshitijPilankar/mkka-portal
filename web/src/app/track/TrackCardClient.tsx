"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Search,
    IdCard,
    CheckCircle2,
    Clock,
    XCircle,
    Printer,
    Download,
    Calendar,
    Phone,
    MapPin,
    QrCode,
    ShieldCheck,
    User,
    ArrowLeft,
    Sparkles,
} from "lucide-react";

interface District {
    id: string;
    name_mr: string;
    name_en: string;
    code: string;
}

interface PlayerRecord {
    id: string;
    tracking_id: string;
    first_name: string;
    middle_name: string;
    surname: string;
    father_name?: string | null;
    mother_name?: string | null;
    gender: string;
    dob: string;
    mobile_no: string;
    email: string;
    full_address: string;
    playing_district_id: string;
    status: string;
    state_no: string | null;
    federation_no: string | null;
    photo_path: string | null;
    created_at: string;
}

interface TrackCardClientProps {
    districts: District[];
}

export default function TrackCardClient({ districts }: TrackCardClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [player, setPlayer] = useState<PlayerRecord | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const districtMap = new Map(districts.map((d) => [d.id, d]));

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setErrorMsg("कृपया ट्रॅकिंग आयडी, राज्य क्रमांक किंवा नोंदणीकृत मोबाईल नंबर टाका.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setSearched(true);
        setPlayer(null);

        try {
            const res = await fetch(`/api/track-player?query=${encodeURIComponent(searchQuery.trim())}`);
            const data = await res.json();

            if (res.ok && data.player) {
                setPlayer(data.player);
            } else {
                setErrorMsg(data.error || "या क्रमांकावर कोणताही खेळाडू नोंदणी अर्ज आढळला नाही.");
            }
        } catch {
            setErrorMsg("शोध घेताना तांत्रिक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const districtInfo = player ? districtMap.get(player.playing_district_id) : null;
    const fullName = player ? `${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim() : "";

    return (
        <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Search Header (Hidden in Print) */}
            <div className="print:hidden max-w-2xl mx-auto text-center space-y-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-1"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> मुख्य पोर्टल (Back to Home)
                </Link>
                <div className="w-14 h-14 rounded-3xl bg-[#EADDFF] flex items-center justify-center text-[#21005D] mx-auto shadow-xs">
                    <IdCard className="w-7 h-7 text-[#6750A4]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1B1F]">
                    खेळाडू सद्यस्थिती व डिजिटल ओळखपत्र (MKKA ID Pass)
                </h1>
                <p className="text-xs text-[#49454F]">
                    आपला अर्ज क्रमांक (Tracking ID), राज्य क्रमांक (State No), किंवा नोंदणीकृत मोबाईल नंबर टाकून स्थिती तपासा आणि ओळखपत्र डाऊनलोड करा.
                </p>

                {/* Search Input Box */}
                <form onSubmit={handleSearch} className="pt-2">
                    <div className="relative flex items-center">
                        <Search className="w-4 h-4 absolute left-4 text-[#79747E]" />
                        <input
                            type="text"
                            placeholder="उदा. MKKA-2026-xxxx किंवा 9004884885..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-13 pl-11 pr-32 rounded-full bg-white border-2 border-[#6750A4]/40 text-xs font-semibold text-[#1C1B1F] shadow-sm focus:outline-none focus:border-[#6750A4] focus:ring-4 focus:ring-[#EADDFF]/50"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-1.5 h-10 px-6 rounded-full bg-[#6750A4] hover:bg-[#6750A4]/90 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-xs"
                        >
                            {loading ? "शोधत आहे..." : "शोध घ्या"}
                        </button>
                    </div>
                </form>

                {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}
            </div>

            {/* Result Display */}
            {player && (
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Status Alert Banner (Hidden in Print) */}
                    <div className="print:hidden p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs bg-white">
                        <div className="flex items-center gap-3">
                            {player.status === "APPROVED" ? (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            ) : player.status === "REJECTED" ? (
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                                    <XCircle className="w-5 h-5" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                            )}
                            <div>
                                <span className="text-[10px] font-bold text-[#79747E] uppercase tracking-wider block">
                                    अर्जाची सद्यस्थिती (Status)
                                </span>
                                <span className="text-sm font-bold text-[#1C1B1F]">
                                    {player.status === "APPROVED"
                                        ? "मान्यताप्राप्त • अधिकृत ओळखपत्र उपलब्ध"
                                        : player.status === "REJECTED"
                                            ? "छाननीमध्ये अर्ज नामंजूर करण्यात आला"
                                            : "जिल्हा/राज्य असोसिएशन छाननी प्रलंबित"}
                                </span>
                            </div>
                        </div>

                        {player.status === "APPROVED" && (
                            <button
                                onClick={handlePrint}
                                className="h-9 px-4 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] flex items-center gap-1.5 transition-all shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>प्रिंट / सेव्ह कार्ड</span>
                            </button>
                        )}
                    </div>

                    {/* OFFICIAL MKKA DIGITAL SMART CARD */}
                    <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#21005D] via-[#4F378B] to-[#6750A4] text-white p-6 sm:p-7 shadow-xl border border-purple-300/30 print:shadow-none print:border-2 print:border-black print:m-0 print:p-6 print:text-black print:bg-none">
                        {/* Background Watermark Pattern */}
                        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                        {/* Card Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/20 print:border-b-2 print:border-black">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                                    <img
                                        src="/logo.png"
                                        alt="MKKA"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = "none";
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-black tracking-tight uppercase leading-tight">
                                        महाराष्ट्र राज्य खो-खो असोसिएशन
                                    </h3>
                                    <span className="text-[9px] sm:text-[10px] text-purple-200 font-medium block print:text-gray-700">
                                        MAHARASHTRA KHO-KHO ASSOCIATION • OFFICIAL ATHLETE PASS
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#21005D] text-[9px] font-black uppercase tracking-wider">
                                    VERIFIED
                                </span>
                                <span className="block text-[8px] font-mono text-purple-200 mt-0.5 print:text-gray-700">
                                    सत्र २०२६-२७
                                </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="py-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                            {/* Photo Box */}
                            <div className="w-28 h-36 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/40 flex items-center justify-center shrink-0 shadow-md relative print:border-black">
                                {player.photo_path ? (
                                    <img
                                        src={`/api/view-document?path=${encodeURIComponent(player.photo_path)}`}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-white/50 print:text-black" />
                                )}
                            </div>

                            {/* Player Metadata */}
                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                <div>
                                    <span className="text-[10px] text-purple-200 uppercase font-semibold block print:text-gray-700">
                                        खेळाडूचे नाव (Athlete Name)
                                    </span>
                                    <h2 className="text-lg sm:text-xl font-black text-white tracking-wide print:text-black">
                                        {fullName}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                    <div>
                                        <span className="text-[9px] text-purple-200 uppercase font-semibold block print:text-gray-700">
                                            राज्य नोंदणी क्र. (State No)
                                        </span>
                                        <strong className="font-mono text-xs text-amber-300 print:text-black">
                                            {player.state_no || player.tracking_id}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="text-[9px] text-purple-200 uppercase font-semibold block print:text-gray-700">
                                            राष्ट्रीय क्र. (KKFI No)
                                        </span>
                                        <strong className="font-mono text-xs text-white print:text-black">
                                            {player.federation_no || "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="text-[9px] text-purple-200 uppercase font-semibold block print:text-gray-700">
                                            संलग्न जिल्हा (District)
                                        </span>
                                        <strong className="text-xs text-white print:text-black">
                                            {districtInfo ? `${districtInfo.name_mr} (${districtInfo.code})` : "महाराष्ट्र"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="text-[9px] text-purple-200 uppercase font-semibold block print:text-gray-700">
                                            जन्मदिनांक (DOB)
                                        </span>
                                        <strong className="font-mono text-xs text-white print:text-black">
                                            {player.dob}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* QR Verification Mock Box */}
                            <div className="w-20 h-20 rounded-2xl bg-white p-1.5 flex flex-col items-center justify-center shrink-0 shadow-xs">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://mkka.org/verify/${player.tracking_id}`}
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                />
                                <span className="text-[7px] text-[#21005D] font-bold mt-0.5">SCAN TO VERIFY</span>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[9px] font-mono text-purple-200 print:text-gray-700 print:border-black">
                            <span>TRACK ID: {player.tracking_id}</span>
                            <span className="flex items-center gap-1 font-bold text-white print:text-black">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 print:text-black" />
                                अधिकृत डिजिटल खेळाडू ओळखपत्र
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
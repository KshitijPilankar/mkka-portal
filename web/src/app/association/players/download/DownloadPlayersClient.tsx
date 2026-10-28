"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Download,
    ArrowLeft,
    Building2,
    Users,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";

interface DistrictOption {
    id: string;
    name_en: string;
    name_mr: string;
    code: string;
}

interface DownloadPlayersClientProps {
    districts: DistrictOption[];
    totalPlayersCount: number;
}

export default function DownloadPlayersClient({
    districts,
    totalPlayersCount,
}: DownloadPlayersClientProps) {
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
    const [isDownloadingDistrict, setIsDownloadingDistrict] = useState<boolean>(false);
    const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const handleDownloadDistrict = async () => {
        if (!selectedDistrictId) {
            setDownloadError("कृपया आधी जिल्हा निवडा / Please select a district first");
            return;
        }
        setDownloadError(null);
        setDownloadSuccess(null);
        setIsDownloadingDistrict(true);

        try {
            const response = await fetch(`/api/export/players?districtId=${selectedDistrictId}`);
            if (!response.ok) {
                const errorJson = await response.json().catch(() => null);
                throw new Error(errorJson?.error || `Export failed with status ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);
            const districtCode = selectedDistrict?.code || "DIST";
            a.download = `MKKA_${districtCode}_Players_${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setDownloadSuccess(`जिल्हा खेळाडूंची एक्सेल फाईल यशस्वीरित्या डाउनलोड झाली! (${districtCode})`);
        } catch (err: any) {
            setDownloadError(err.message || "डाउनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
        } finally {
            setIsDownloadingDistrict(false);
        }
    };

    const handleDownloadAll = async () => {
        setDownloadError(null);
        setDownloadSuccess(null);
        setIsDownloadingAll(true);

        try {
            const response = await fetch(`/api/export/players?all=true`);
            if (!response.ok) {
                const errorJson = await response.json().catch(() => null);
                throw new Error(errorJson?.error || `Export failed with status ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `MKKA_All_Maharashtra_Players_${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setDownloadSuccess("संपूर्ण महाराष्ट्र राज्य खेळाडूंची मास्टर एक्सेल फाईल यशस्वीरित्या डाउनलोड झाली!");
        } catch (err: any) {
            setDownloadError(err.message || "डाउनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
        } finally {
            setIsDownloadingAll(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/association/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> मुख्य नियंत्रण कक्ष (Back to Dashboard)
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1C1B1F]">
                        खेळाडू माहिती डाऊनलोड केंद्र (Download Player List)
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        अधिकृत खेळाडू नोंदणी तपशील आणि कागदपत्रे सर्व्हर लिंकसह Microsoft Excel (.xlsx) फॉरमॅटमध्ये डाऊनलोड करा.
                    </p>
                </div>
            </div>

            {downloadSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{downloadSuccess}</span>
                </div>
            )}

            {downloadError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{downloadError}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D] mb-4">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-semibold tracking-wider text-[#6750A4] uppercase">
                            पर्याय १ (OPTION 1)
                        </span>
                        <h2 className="text-lg font-bold text-[#1C1B1F] mt-1">
                            जिल्हावार खेळाडू यादी (District-wise Export)
                        </h2>
                        <p className="text-xs text-[#49454F] mt-1 leading-relaxed">
                            कोणताही एक जिल्हा निवडून त्या जिल्ह्यातील सर्व नोंदणीकृत खेळाडूंची सविस्तर माहिती एक्सेल फाईलमध्ये डाऊनलोड करा.
                        </p>

                        <div className="mt-5 space-y-2">
                            <label className="text-xs font-medium text-[#1C1B1F]">
                                जिल्हा निवडा (Select District)*:
                            </label>
                            <select
                                value={selectedDistrictId}
                                onChange={(e) => setSelectedDistrictId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            >
                                <option value="">-- महाराष्ट्रातील ३६ जिल्ह्यांमधून निवडा --</option>
                                {districts.map((district) => (
                                    <option key={district.id} value={district.id}>
                                        {district.name_mr} ({district.name_en}) [{district.code}]
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#CAC4D0]/40">
                        <button
                            onClick={handleDownloadDistrict}
                            disabled={isDownloadingDistrict || !selectedDistrictId}
                            className="w-full h-12 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#6750A4]/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isDownloadingDistrict ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>एक्सेल तयार होत आहे...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>जिल्हा खेळाडू एक्सेल डाऊनलोड करा</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/40 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D] mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-semibold tracking-wider text-[#6750A4] uppercase">
                            पर्याय २ (OPTION 2)
                        </span>
                        <h2 className="text-lg font-bold text-[#1C1B1F] mt-1">
                            सर्व महाराष्ट्र खेळाडू यादी (All Players Export)
                        </h2>
                        <p className="text-xs text-[#49454F] mt-1 leading-relaxed">
                            महाराष्ट्रातील सर्व ३६ जिल्ह्यांमधील संपूर्ण नोंदणीकृत खेळाडूंचा मुख्य डेटाबेस एकाच मास्टर एक्सेल फाईलमध्ये डाऊनलोड करा.
                        </p>

                        <div className="mt-5 p-4 rounded-2xl bg-white border border-[#CAC4D0]/50 space-y-1">
                            <div className="text-[11px] text-[#49454F]">एकूण नोंदणीकृत खेळाडू (Total Registered):</div>
                            <div className="text-xl font-bold text-[#6750A4] flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5" />
                                <span>{totalPlayersCount} खेळाडू (Players)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#CAC4D0]/40">
                        <button
                            onClick={handleDownloadAll}
                            disabled={isDownloadingAll || totalPlayersCount === 0}
                            className="w-full h-12 rounded-full bg-[#21005D] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#21005D]/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isDownloadingAll ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>मास्टर फाईल तयार होत आहे...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>सर्व खेळाडू मास्टर एक्सेल डाऊनलोड करा</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
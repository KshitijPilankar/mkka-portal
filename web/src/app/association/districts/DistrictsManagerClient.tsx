"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Search,
    KeyRound,
    X,
    Phone,
    Mail,
    User,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Lock,
} from "lucide-react";
import { updateDistrictDetailsAction } from "@/app/actions/association-districts";

interface DistrictItem {
    id: string;
    code: string;
    name_en: string;
    name_mr: string;
    contact_person: string | null;
    mobile: string | null;
    email: string | null;
    username: string;
    password?: string | null;
    player_count?: number;
}

interface DistrictsManagerClientProps {
    initialDistricts: DistrictItem[];
}

export default function DistrictsManagerClient({ initialDistricts }: DistrictsManagerClientProps) {
    const [districts, setDistricts] = useState<DistrictItem[]>(initialDistricts);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeModalDistrict, setActiveModalDistrict] = useState<DistrictItem | null>(null);

    // Form states inside modal
    const [contactPerson, setContactPerson] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [isPending, startTransition] = useTransition();
    const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const filteredDistricts = districts.filter((d) => {
        const q = searchTerm.toLowerCase().trim();
        return (
            !q ||
            d.name_en.toLowerCase().includes(q) ||
            d.name_mr.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q) ||
            d.username.toLowerCase().includes(q) ||
            (d.contact_person && d.contact_person.toLowerCase().includes(q)) ||
            (d.mobile && d.mobile.includes(q))
        );
    });

    const openDistrictModal = (district: DistrictItem) => {
        setActiveModalDistrict(district);
        setContactPerson(district.contact_person || "");
        setMobile(district.mobile || "");
        setEmail(district.email || "");
        setNewPassword(district.password || "mkka@123");
        setToastMessage(null);
    };

    const closeModal = () => {
        setActiveModalDistrict(null);
    };

    const handleSaveDistrict = () => {
        if (!activeModalDistrict) return;

        startTransition(async () => {
            const result = await updateDistrictDetailsAction(activeModalDistrict.id, {
                contact_person: contactPerson,
                mobile: mobile,
                email: email,
                password: newPassword,
            });

            if (result.success) {
                setDistricts((prev) =>
                    prev.map((d) =>
                        d.id === activeModalDistrict.id
                            ? {
                                ...d,
                                contact_person: contactPerson.trim() || null,
                                mobile: mobile.trim() || null,
                                email: email.trim() || null,
                                password: newPassword.trim(),
                            }
                            : d
                    )
                );
                setToastMessage({
                    type: "success",
                    text: `${activeModalDistrict.name_mr} (${activeModalDistrict.code}) ची माहिती व पासवर्ड यशस्वीरित्या सेव्ह झाला!`,
                });
                closeModal();
            } else {
                setToastMessage({
                    type: "error",
                    text: result.error || "माहिती अपडेट करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
                });
            }
        });
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
                        <Building2 className="w-7 h-7 text-[#6750A4]" />
                        महाराष्ट्रातील ३६ जिल्हा संघटना व्यवस्थापन कक्ष (All 36 Districts)
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        ३६ अधिकृत संलग्न जिल्हा संघटनांची सूची, संपर्क अधिकारी, युझरनेम आणि जिल्हा लॉगिन पासवर्ड व्यवस्थापन.
                    </p>
                </div>
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

            {/* Filter and Search Bar */}
            <div className="p-4 md:p-6 rounded-[28px] bg-[#F3EDF7] border border-[#CAC4D0]/50 space-y-3">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                    <input
                        type="text"
                        placeholder="जिल्ह्याचे नाव, कोड (उदा. THA, PUN), युझरनेम किंवा संपर्क अधिकारी शोधा..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] placeholder:text-[#79747E] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-[#49454F]">
                    <div>एकूण दाखवत आहे: <strong className="text-[#1C1B1F]">{filteredDistricts.length}</strong> / 36 जिल्हे</div>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="text-[#6750A4] font-medium hover:underline">
                            शोध साफ करा (Reset)
                        </button>
                    )}
                </div>
            </div>

            {/* 36 Districts Table */}
            <div className="rounded-[28px] bg-white border border-[#CAC4D0]/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EADDFF]/50 border-b border-[#CAC4D0]/60 text-[11px] font-bold text-[#21005D]">
                                <th className="py-3 px-3 text-center w-12">अ.क्र.</th>
                                <th className="py-3 px-4">जिल्हा (District)</th>
                                <th className="py-3 px-4">जिल्हा कोड</th>
                                <th className="py-3 px-4">लॉगिन युझरनेम</th>
                                <th className="py-3 px-4">संपर्क अधिकारी (Secretary)</th>
                                <th className="py-3 px-4">मोबाईल</th>
                                <th className="py-3 px-3 text-center">खेळाडू संख्या</th>
                                <th className="py-3 px-4 text-center">कृती (Actions)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-xs text-[#1C1B1F]">
                            {filteredDistricts.map((district, index) => (
                                <tr key={district.id} className="hover:bg-[#F3EDF7]/40 transition-colors">
                                    <td className="py-3.5 px-3 text-center font-medium text-[#79747E]">
                                        {index + 1}
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-[#1C1B1F]">
                                        {district.name_mr} <span className="text-[#79747E] font-normal">({district.name_en})</span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#E8DEF8] text-[#21005D] font-mono font-bold text-[11px]">
                                            {district.code}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-[#6750A4] font-medium">
                                        {district.username}
                                    </td>
                                    <td className="py-3.5 px-4 text-[#49454F]">
                                        {district.contact_person || <span className="italic text-[#79747E]">- नोंद नाही -</span>}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-[#49454F]">
                                        {district.mobile || <span className="italic text-[#79747E]">-</span>}
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                                            {district.player_count || 0} खेळाडू
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <button
                                            onClick={() => openDistrictModal(district)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#6750A4] text-[#6750A4] text-[11px] font-semibold hover:bg-[#6750A4]/10 active:scale-95 transition-all"
                                        >
                                            <KeyRound className="w-3.5 h-3.5" />
                                            <span>माहिती व पासवर्ड</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit District & Password Modal */}
            {activeModalDistrict && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 border border-[#CAC4D0]">
                        <div className="flex items-center justify-between pb-4 border-b border-[#CAC4D0]/60">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#6750A4] tracking-wider uppercase">
                                        जिल्हा तपशील व लॉगिन पासवर्ड
                                    </span>
                                    <h2 className="text-xl font-bold text-[#1C1B1F]">
                                        {activeModalDistrict.name_mr} ({activeModalDistrict.name_en})
                                    </h2>
                                    <div className="text-xs text-[#49454F] font-mono">
                                        Username: <span className="font-bold text-[#21005D]">{activeModalDistrict.username}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="w-10 h-10 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* Password Reset Section */}
                            <div className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-[#F57F17]">
                                    <Lock className="w-4 h-4" />
                                    <span>जिल्हा लॉगिन पासवर्ड बदला (Reset Password)</span>
                                </div>
                                <p className="text-[11px] text-[#795548]">
                                    या जिल्ह्याचा लॉगिन पासवर्ड येथे सेट करा. हा पासवर्ड जिल्हा प्रतिनिधी लॉगिनसाठी वापरतील:
                                </p>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="उदा. mkka@123 किंवा pune#2026"
                                    className="w-full h-11 px-4 rounded-xl bg-white border border-[#FFE082] font-mono text-xs font-bold text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#F57F17]"
                                />
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">
                                        संपर्क अधिकारी / सचिव नाव (Contact Person Name):
                                    </label>
                                    <input
                                        type="text"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="उदा. श्री. सचिन मोरे"
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">
                                        मोबाईल क्रमांक (Official Mobile Number):
                                    </label>
                                    <input
                                        type="text"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="उदा. 9822012345"
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-mono text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">
                                        अधिकृत ईमेल (District Email):
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="उदा. contact@punekhokho.org"
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#CAC4D0]/60 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="h-10 px-5 rounded-full bg-[#E7E0EC] text-[#1C1B1F] text-xs font-semibold hover:bg-[#CAC4D0] transition-all"
                            >
                                रद्द करा (Cancel)
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDistrict}
                                disabled={isPending}
                                className="h-10 px-6 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>जतन होत आहे...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>माहिती व पासवर्ड सेव्ह करा</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
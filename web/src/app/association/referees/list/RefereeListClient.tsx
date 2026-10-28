"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Search,
    Filter,
    Award,
    Eye,
    X,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CheckCircle2,
    ExternalLink,
    ShieldCheck,
    UserCheck,
} from "lucide-react";

interface District {
    id: string;
    name_en: string;
    name_mr: string;
    code: string;
}

interface RefereeRecord {
    id: string;
    tracking_id?: string;
    full_name: string;
    gender?: string;
    dob?: string;
    mobile: string;
    email: string;
    residential_address?: string;
    district_id: string;
    exam_passing_year: number | string;
    grade: string;
    experience_years?: number | string;
    photo_path?: string | null;
    id_proof_path?: string | null;
    cert_proof_path?: string | null;
    status: string;
    created_at?: string;
    approved_at?: string;
}

interface RefereeListClientProps {
    initialReferees: RefereeRecord[];
    districts: District[];
}

export default function RefereeListClient({
    initialReferees,
    districts,
}: RefereeListClientProps) {
    const [referees] = useState<RefereeRecord[]>(initialReferees);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("ALL");
    const [activeModalReferee, setActiveModalReferee] = useState<RefereeRecord | null>(null);

    const districtMap = new Map(districts.map((d) => [d.id, d]));

    const filteredReferees = referees.filter((r) => {
        const fullName = (r.full_name || "").toLowerCase();
        const query = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !query ||
            fullName.includes(query) ||
            (r.mobile && r.mobile.includes(query)) ||
            (r.email && r.email.toLowerCase().includes(query)) ||
            (r.tracking_id && r.tracking_id.toLowerCase().includes(query));

        const matchesDistrict = !selectedDistrict || r.district_id === selectedDistrict;
        const matchesGrade = selectedGrade === "ALL" || r.grade === selectedGrade;

        return matchesSearch && matchesDistrict && matchesGrade;
    });

    const getPublicDocUrl = (path?: string | null) => {
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
                        <UserCheck className="w-7 h-7 text-[#6750A4]" />
                        अधिकृत पंच व परीक्षक यादी (Official Referees Directory)
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        महाराष्ट्र राज्य खो-खो असोसिएशन मान्यताप्राप्त अधिकृत पंच, तांत्रिक अधिकारी आणि परीक्षा श्रेणी सूची.
                    </p>
                </div>

                <Link
                    href="/association/referees/approvals"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-semibold hover:bg-[#EADDFF]/80 active:scale-95 transition-all shadow-sm shrink-0"
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>नवीन पंच छाननी कक्ष</span>
                </Link>
            </div>

            <div className="p-4 md:p-6 rounded-[28px] bg-[#F3EDF7] border border-[#CAC4D0]/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                        <input
                            type="text"
                            placeholder="पंचांचे नाव, मोबाईल क्रमांक किंवा जिल्हा शोधा..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] placeholder:text-[#79747E] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        />
                    </div>

                    <div className="md:col-span-3 relative">
                        <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        >
                            <option value="">-- सर्व ३६ जिल्हे --</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name_mr} ({d.name_en}) [{d.code}]
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        >
                            <option value="ALL">सर्व परीक्षा श्रेणी (All Grades)</option>
                            <option value="State Grade A">राज्य श्रेणी 'अ' (State Grade A)</option>
                            <option value="State Grade B">राज्य श्रेणी 'ब' (State Grade B)</option>
                            <option value="State Grade C">राज्य श्रेणी 'क' (State Grade C)</option>
                            <option value="National Level">राष्ट्रीय स्तर (National Level)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#49454F] pt-2 border-t border-[#CAC4D0]/30">
                    <div>
                        एकूण अधिकृत पंच: <strong className="text-[#1C1B1F]">{filteredReferees.length}</strong> पैकी {referees.length}
                    </div>
                    {(searchTerm || selectedDistrict || selectedGrade !== "ALL") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedDistrict("");
                                setSelectedGrade("ALL");
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
                                <th className="py-3 px-3 text-center w-16">फोटो</th>
                                <th className="py-3 px-4">पंचांचे संपूर्ण नाव</th>
                                <th className="py-3 px-4">संलग्न जिल्हा</th>
                                <th className="py-3 px-4">परीक्षा श्रेणी (Grade)</th>
                                <th className="py-3 px-4">उत्तीर्ण वर्ष</th>
                                <th className="py-3 px-4">मोबाईल</th>
                                <th className="py-3 px-3 text-center">स्थिती</th>
                                <th className="py-3 px-4 text-center">कृती (Action)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-xs text-[#1C1B1F]">
                            {filteredReferees.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-[#49454F]">
                                        कोणताही अधिकृत पंच आढळला नाही.
                                    </td>
                                </tr>
                            ) : (
                                filteredReferees.map((referee, index) => {
                                    const dist = districtMap.get(referee.district_id);
                                    const photoUrl = getPublicDocUrl(referee.photo_path);

                                    return (
                                        <tr key={referee.id} className="hover:bg-[#F3EDF7]/40 transition-colors">
                                            <td className="py-3.5 px-3 text-center font-medium text-[#79747E]">
                                                {index + 1}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E7E0EC] mx-auto border border-[#CAC4D0]/60 relative flex items-center justify-center">
                                                    {photoUrl ? (
                                                        <Image
                                                            src={photoUrl}
                                                            alt={referee.full_name}
                                                            fill
                                                            sizes="40px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-[#6750A4]">
                                                            {referee.full_name?.charAt(0) || "P"}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-[#1C1B1F]">
                                                {referee.full_name}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#49454F]">
                                                {dist ? `${dist.name_mr} (${dist.code})` : "N/A"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold">
                                                    {referee.grade || "State Level"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#49454F]">
                                                {referee.exam_passing_year || "N/A"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[#49454F]">
                                                {referee.mobile}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-emerald-100 text-emerald-800">
                                                    मान्यताप्राप्त
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => setActiveModalReferee(referee)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#6750A4] text-[#6750A4] text-[11px] font-semibold hover:bg-[#6750A4]/10 active:scale-95 transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>माहिती (Information)</span>
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

            {activeModalReferee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 border border-[#CAC4D0]">
                        <div className="flex items-center justify-between pb-4 border-b border-[#CAC4D0]/60">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#EADDFF] relative flex items-center justify-center border border-[#6750A4]">
                                    {getPublicDocUrl(activeModalReferee.photo_path) ? (
                                        <Image
                                            src={getPublicDocUrl(activeModalReferee.photo_path)!}
                                            alt={activeModalReferee.full_name}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-base font-bold text-[#6750A4]">
                                            {activeModalReferee.full_name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#6750A4] tracking-wider uppercase">
                                        अधिकृत पंच तपशील (REFEREE DOSSIER)
                                    </span>
                                    <h2 className="text-xl font-bold text-[#1C1B1F]">
                                        {activeModalReferee.full_name}
                                    </h2>
                                    <div className="text-xs text-[#49454F] font-mono">
                                        {districtMap.get(activeModalReferee.district_id)?.name_mr} जिल्हा
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveModalReferee(null)}
                                className="w-10 h-10 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 space-y-2">
                                <div className="font-bold text-[#6750A4] flex items-center gap-1.5">
                                    <Award className="w-4 h-4" /> तांत्रिक व परीक्षा पात्रता
                                </div>
                                <div>परीक्षा श्रेणी: <strong className="text-[#21005D]">{activeModalReferee.grade}</strong></div>
                                <div>परीक्षा उत्तीर्ण वर्ष: <strong>{activeModalReferee.exam_passing_year || "N/A"}</strong></div>
                                <div>अनुभव (वर्षे): <strong>{activeModalReferee.experience_years || "0"} वर्षे</strong></div>
                                <div>लिंग: <strong>{activeModalReferee.gender === "MALE" ? "पुरुष" : activeModalReferee.gender === "FEMALE" ? "महिला" : "N/A"}</strong></div>
                                <div>जन्मदिनांक: <strong>{activeModalReferee.dob || "N/A"}</strong></div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 space-y-2">
                                <div className="font-bold text-[#6750A4] flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" /> संपर्क माहिती
                                </div>
                                <div>मोबाईल: <strong className="font-mono">{activeModalReferee.mobile}</strong></div>
                                <div>ईमेल: <strong>{activeModalReferee.email}</strong></div>
                                <div>
                                    संलग्न जिल्हा: <strong>{districtMap.get(activeModalReferee.district_id)?.name_mr || "N/A"}</strong>
                                </div>
                                <div>पत्ता: <span className="text-[#49454F]">{activeModalReferee.residential_address || "N/A"}</span></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[#1C1B1F]">
                                अधिकृत कागदपत्रे व प्रमाणपत्रे (Attached Credentials):
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                {activeModalReferee.photo_path && (
                                    <a
                                        href={getPublicDocUrl(activeModalReferee.photo_path) || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">पासपोर्ट फोटो</span>
                                    </a>
                                )}
                                {activeModalReferee.id_proof_path && (
                                    <a
                                        href={getPublicDocUrl(activeModalReferee.id_proof_path) || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">ओळख पुरावा</span>
                                    </a>
                                )}
                                {activeModalReferee.cert_proof_path && (
                                    <a
                                        href={getPublicDocUrl(activeModalReferee.cert_proof_path) || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-xl border border-[#CAC4D0] hover:border-[#6750A4] hover:bg-[#EADDFF]/20 flex flex-col items-center text-center gap-1.5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#6750A4]" />
                                        <span className="font-medium text-[11px]">पंच परीक्षा प्रमाणपत्र</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#CAC4D0]/60 flex justify-end">
                            <button
                                onClick={() => setActiveModalReferee(null)}
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
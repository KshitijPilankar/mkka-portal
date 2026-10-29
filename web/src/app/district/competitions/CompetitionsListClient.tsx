"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Trophy,
    Calendar,
    MapPin,
    Users,
    CheckCircle2,
    Clock,
    ArrowRight,
} from "lucide-react";

interface TournamentItem {
    id: string;
    title?: string;
    name?: string;
    venue?: string;
    start_date?: string;
    end_date?: string;
    entry_deadline?: string;
    age_group?: string;
    gender?: string;
    status?: string;
    is_submitted?: boolean;
}

interface CompetitionsListClientProps {
    districtName: string;
    districtCode: string;
    tournaments: TournamentItem[];
}

export default function CompetitionsListClient({
    districtName,
    districtCode,
    tournaments,
}: CompetitionsListClientProps) {
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
                        <Trophy className="w-7 h-7 text-[#6750A4]" />
                        राज्य अजिंक्यपद स्पर्धा व अधिकृत संघ नोंदणी
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        {districtName} ({districtCode}) जिल्हा खो-खो संघटना — सक्रिय स्पर्धांमध्ये १२ ते १५ खेळाडूंचा अधिकृत संघ निवडा व सादर करा.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournaments.length === 0 ? (
                    <div className="col-span-2 p-12 text-center rounded-[32px] bg-white border border-[#CAC4D0]/60 text-[#49454F] text-xs">
                        सध्या कोणतीही राज्य स्पर्धा नोंदणीसाठी उपलब्ध नाही.
                    </div>
                ) : (
                    tournaments.map((t) => {
                        const tournamentTitle = t.title || t.name || "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा";
                        const venue = t.venue || "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे";
                        const isSubmitted = t.is_submitted;

                        return (
                            <div
                                key={t.id}
                                className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold">
                                            {t.age_group || "Senior / वरिष्ठ गट"}
                                        </span>
                                        {isSubmitted ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>संघ सबमिट केला (Submitted)</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>नोंदणी खुली (Open)</span>
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-lg font-bold text-[#1C1B1F]">
                                        {tournamentTitle}
                                    </h2>

                                    <div className="space-y-1.5 text-xs text-[#49454F]">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-[#79747E] shrink-0" />
                                            <span>{venue}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-[#79747E] shrink-0" />
                                            <span>
                                                स्पर्धा दिनांक: <strong>{t.start_date || "१५ नोव्हेंबर २०२६"} ते {t.end_date || "१८ नोव्हेंबर २०२६"}</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-rose-700 font-semibold">
                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                संघ सादर करण्याची अंतिम मुदत: <strong>{t.entry_deadline || "१० नोव्हेंबर २०२६"}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#CAC4D0]/40">
                                    <Link
                                        href={`/district/competitions/${t.id}`}
                                        className={`w-full h-11 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${isSubmitted
                                                ? "bg-[#F3EDF7] text-[#21005D] border border-[#CAC4D0] hover:bg-[#EADDFF]"
                                                : "bg-[#6750A4] text-white hover:bg-[#6750A4]/90"
                                            }`}
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>{isSubmitted ? "निवडलेला संघ पहा व सुधारा" : "१२-१५ खेळाडूंचा संघ निवडा"}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
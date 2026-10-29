import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Trophy,
    Calendar,
    MapPin,
    Clock,
    ArrowLeft,
    Building2,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";
import DeclareTournamentButton from "./DeclareTournamentButton";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "राज्य अजिंक्यपद स्पर्धा व वेळापत्रक | MKKA",
    description: "Maharashtra Kho-Kho Association Official Tournaments",
};

export default async function PublicTournamentsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [tournamentsRes, entriesRes] = await Promise.all([
        supabase.from("tournaments").select("*").order("created_at", { ascending: false }),
        supabase.from("tournament_entries").select("tournament_id"),
    ]);

    const tournaments = tournamentsRes.data || [];
    const entries = entriesRes.data || [];

    const entryCountMap = new Map<string, number>();
    entries.forEach((e: any) => {
        entryCountMap.set(e.tournament_id, (entryCountMap.get(e.tournament_id) || 0) + 1);
    });

    return (
        <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> मुख्य पोर्टल (Back to Home)
                    </Link>

                    {/* Declare Competition Modal Trigger */}
                    <DeclareTournamentButton />
                </div>

                {/* Header Banner */}
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-[#EADDFF] flex items-center justify-center text-[#21005D] mx-auto shadow-xs">
                        <Trophy className="w-7 h-7 text-[#6750A4]" />
                    </div>
                    <span className="inline-block px-3.5 py-1 rounded-full bg-[#EADDFF]/70 text-[#21005D] text-[11px] font-bold tracking-wider uppercase">
                        सत्र २०२६-२७ अधिकृत स्पर्धा कॅलेंडर
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-[#1C1B1F]">
                        महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा व वेळापत्रक
                    </h1>
                    <p className="text-xs md:text-sm text-[#49454F] max-w-2xl mx-auto">
                        महाराष्ट्र राज्य खो-खो असोसिएशन संलग्न ३६ जिल्हा संघटनांच्या सहभागाने आयोजित अधिकृत अजिंक्यपद स्पर्धा.
                    </p>
                </div>

                {/* Tournaments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tournaments.length === 0 ? (
                        <div className="col-span-2 p-12 text-center rounded-[32px] bg-white border border-[#CAC4D0]/60 text-xs text-[#49454F]">
                            सध्या कोणतीही जाहीर स्पर्धा उपलब्ध नाही. नवीन स्पर्धांचे परिपत्रक लवकरच प्रसिद्ध होईल.
                        </div>
                    ) : (
                        tournaments.map((t) => {
                            const title =
                                t.name_mr ||
                                t.title ||
                                t.name ||
                                t.tournament_name ||
                                "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा";
                            const venue =
                                t.venue_ground ||
                                t.venue ||
                                t.location ||
                                t.place ||
                                "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे";
                            const count = entryCountMap.get(t.id) || 0;

                            return (
                                <div
                                    key={t.id}
                                    className="rounded-[32px] bg-white border border-[#CAC4D0]/60 p-6 md:p-7 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold">
                                                {t.category === "SUB_JUNIOR_U14" || t.category === "SUB_JUNIOR"
                                                    ? "Sub-Junior / सब-ज्युनियर"
                                                    : t.category === "JUNIOR_U18" || t.category === "JUNIOR"
                                                        ? "Junior / ज्युनियर गट"
                                                        : t.age_group || "Senior / वरिष्ठ गट"}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span>{count} जिल्हे सहभागी</span>
                                            </span>
                                        </div>

                                        <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F] leading-snug">
                                            {title}
                                        </h2>

                                        <div className="space-y-2 text-xs text-[#49454F] pt-1">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-[#79747E] shrink-0 mt-0.5" />
                                                <span>{venue}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#79747E] shrink-0" />
                                                <span>
                                                    स्पर्धा कालावधी: <strong>{t.start_date || "१५ नोव्हेंबर"} ते {t.end_date || "१८ नोव्हेंबर २०२६"}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-rose-700 font-semibold">
                                                <Clock className="w-4 h-4 shrink-0" />
                                                <span>
                                                    संघ सादर अंतिम मुदत: <strong>{t.registration_deadline || t.entry_deadline || "१० नोव्हेंबर २०२६"}</strong>
                                                </span>
                                            </div>

                                            {/* Association Custom DOB Limit Badge */}
                                            {(t.min_dob || t.dob_cutoff) && (
                                                <div className="mt-1 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 font-mono">
                                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                                    <span>DOB मर्यादा: {t.min_dob || t.dob_cutoff} नंतर जन्मलेले खेळाडू</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#CAC4D0]/40 flex items-center justify-between gap-3">
                                        <Link
                                            href="/district/login"
                                            className="flex-1 h-11 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>जिल्हा संघ नोंदणी</span>
                                        </Link>
                                        <Link
                                            href="/track"
                                            className="flex-1 h-11 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>खेळाडू ओळखपत्र तपासा</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
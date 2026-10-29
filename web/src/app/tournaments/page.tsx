import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    Trophy,
    Calendar,
    MapPin,
    Building2,
    Users,
    Clock,
    ArrowRight,
    LogIn,
    IdCard,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicTournamentsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch tournaments and submitted entries count per tournament
    const [tournamentsRes, entriesRes] = await Promise.all([
        supabase.from("tournaments").select("*").order("created_at", { ascending: false }),
        supabase.from("tournament_entries").select("tournament_id, district_id"),
    ]);

    const tournaments = tournamentsRes.data || [];
    const entries = entriesRes.data || [];

    const entryCountMap = new Map<string, number>();
    entries.forEach((e: any) => {
        entryCountMap.set(e.tournament_id, (entryCountMap.get(e.tournament_id) || 0) + 1);
    });

    // Default tournament fallback if database is empty
    const displayTournaments =
        tournaments.length > 0
            ? tournaments
            : [
                  {
                      id: "senior-state-2026",
                      name_mr: "५९ वी वरिष्ठ गट पुरुष व महिला राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७",
                      title: "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७",
                      age_group: "Senior / वरिष्ठ गट",
                      start_date: "१५ नोव्हेंबर २०२६",
                      end_date: "१८ नोव्हेंबर २०२६",
                      entry_deadline: "१० नोव्हेंबर २०२६",
                      venue: "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे",
                  },
              ];

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="rounded-[32px] bg-[#F3EDF7] border border-[#CAC4D0]/60 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> मुख्य पोर्टल (Back to Home)
                            </Link>
                            <span className="inline-block px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold tracking-wider uppercase mb-2 ml-2">
                                अधिकृत क्रीडा वेळापत्रक
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1B1F] flex items-center gap-2">
                                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-teal-700 shrink-0" />
                                <span>राज्य अजिंक्यपद स्पर्धा व स्पर्धा दिनदर्शिका २०२६-२७</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-[#49454F] mt-1.5 max-w-2xl">
                                महाराष्ट्र राज्य खो-खो असोसिएशन संलग्न अधिकृत राज्यस्तरीय स्पर्धांची माहिती, ३६ जिल्ह्यांचे दाखल संघ आणि थेट वेळापत्रक.
                            </p>
                        </div>

                        {/* Quick Action Navigation */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
                            <Link
                                href="/district/login"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#6750A4] hover:bg-[#6750A4]/90 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>जिल्हा लॉगिन (District Login)</span>
                            </Link>
                            <Link
                                href="/track"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#EADDFF]/40 text-[#21005D] border border-[#CAC4D0] text-xs font-bold shadow-xs transition-all active:scale-95"
                            >
                                <IdCard className="w-3.5 h-3.5 text-[#6750A4]" />
                                <span>कार्ड शोधा / Track ID</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tournaments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayTournaments.map((t: any) => {
                        const submittedDistrictsCount = entryCountMap.get(t.id) || 0;
                        const title =
                            t.name_mr ||
                            t.title ||
                            t.name ||
                            t.tournament_name ||
                            "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७";
                        const venue =
                            t.venue ||
                            t.location ||
                            t.place ||
                            "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे";
                        const dates =
                            t.start_date && t.end_date
                                ? `${t.start_date} ते ${t.end_date}`
                                : t.start_date || "१५ ते १८ नोव्हेंबर २०२६";
                        const deadline = t.entry_deadline || t.registration_deadline || "१० नोव्हेंबर २०२६";
                        const ageGroup = t.age_group || t.category || "Senior / वरिष्ठ गट";

                        return (
                            <div
                                key={t.id}
                                className="rounded-[32px] bg-white border border-[#CAC4D0]/60 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
                            >
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold">
                                            {ageGroup}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>{submittedDistrictsCount} / ३६ जिल्हे दाखल</span>
                                        </span>
                                    </div>

                                    <h2 className="text-lg font-bold text-[#1C1B1F] leading-snug">
                                        {title}
                                    </h2>

                                    <div className="space-y-2 text-xs text-[#49454F] pt-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#79747E] shrink-0" />
                                            <span>{venue}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#79747E] shrink-0" />
                                            <span>
                                                स्पर्धा कालावधी: <strong>{dates}</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-rose-700 font-semibold">
                                            <Clock className="w-4 h-4 shrink-0" />
                                            <span>
                                                संघ नोंदणी अंतिम मुदत: <strong>{deadline}</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#49454F]">
                                            <Users className="w-4 h-4 text-[#79747E] shrink-0" />
                                            <span>
                                                संघ निकष: <strong>किमान १२ ते कमाल १५ अधिकृत खेळाडू</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#CAC4D0]/40 flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href="/district/login"
                                        className="flex-1 h-11 rounded-full bg-[#6750A4] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-xs"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        <span>जिल्हा संघ सादर करा</span>
                                    </Link>
                                    <Link
                                        href="/track"
                                        className="flex-1 h-11 rounded-full bg-white border border-[#CAC4D0] text-[#21005D] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#EADDFF]/30 active:scale-95 transition-all"
                                    >
                                        <IdCard className="w-3.5 h-3.5 text-[#6750A4]" />
                                        <span>खेळाडू कार्ड शोधा</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

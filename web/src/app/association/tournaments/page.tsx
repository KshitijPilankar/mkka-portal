import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    ArrowLeft,
    Trophy,
    Calendar,
    MapPin,
    Building2,
    Users,
    Eye,
    CheckCircle2,
    Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssociationTournamentsPage() {
    const cookieStore = await cookies();
    const hasAdminSession =
        cookieStore.get("mkka_admin_auth")?.value ||
        cookieStore.get("mkka_admin_session")?.value ||
        cookieStore.get("admin_session")?.value ||
        cookieStore.get("mkka_admin")?.value ||
        cookieStore.get("admin_auth")?.value;

    if (!hasAdminSession) {
        redirect("/association/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // स्पर्धेची यादी आणि सबमिट केलेल्या संघांचा काउंट आणणे
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

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/association/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> मुख्य नियंत्रण कक्ष (Back to Dashboard)
                        </Link>
                        <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-teal-700" />
                            राज्य अजिंक्यपद स्पर्धा व जिल्हा संघ नियंत्रण कक्ष
                        </h1>
                        <p className="text-xs text-[#49454F] mt-1">
                            महाराष्ट्रातील ३६ जिल्ह्यांनी सबमिट केलेल्या अधिकृत संघांचे परीक्षण, खेळाडू पडताळणी आणि स्पर्धा समन्वय.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tournaments.length === 0 ? (
                        <div className="col-span-2 p-12 text-center rounded-[32px] bg-white border border-[#CAC4D0]/60 text-xs text-[#49454F]">
                            कोणतीही स्पर्धा आढळली नाही.
                        </div>
                    ) : (
                        tournaments.map((t) => {
                            const submittedDistrictsCount = entryCountMap.get(t.id) || 0;

                            return (
                                <div
                                    key={t.id}
                                    className="rounded-[32px] bg-white border border-[#CAC4D0]/60 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold">
                                                {t.age_group || "Senior / वरिष्ठ गट"}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span>{submittedDistrictsCount} / ३६ जिल्हे सादर</span>
                                            </span>
                                        </div>

                                        <h2 className="text-lg font-bold text-[#1C1B1F]">
                                            {t.title || t.name || "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा"}
                                        </h2>

                                        <div className="space-y-1.5 text-xs text-[#49454F]">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-[#79747E] shrink-0" />
                                                <span>{t.venue || "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-[#79747E] shrink-0" />
                                                <span>
                                                    स्पर्धा दिनांक: <strong>{t.start_date || "१५ नोव्हेंबर"} ते {t.end_date || "१८ नोव्हेंबर २०२६"}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-rose-700 font-semibold">
                                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    अंतिम मुदत: <strong>{t.entry_deadline || "१० नोव्हेंबर २०२६"}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#CAC4D0]/40">
                                        <Link
                                            href={`/association/tournaments/${t.id}`}
                                            className="w-full h-11 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal-900 active:scale-95 transition-all shadow-sm"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span>सादर झालेले जिल्हा संघ तपासा ({submittedDistrictsCount})</span>
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

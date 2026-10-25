"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Tournament {
    id: string;
    name_mr: string;
    name_en: string;
    status?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    registration_deadline?: string;
    venue?: string;
    district_mr?: string;
    city?: string;
    min_players?: number;
    max_players?: number;
}

const DEFAULT_TOURNAMENTS: Tournament[] = [
    {
        id: "senior-state-2026",
        name_mr: "५९ वी वरिष्ठ गट पुरुष व महिला राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७",
        name_en: "59th Senior State Kho-Kho Championship 2026-27",
        status: "UPCOMING",
        category: "SENIOR",
        start_date: "2026-11-15",
        end_date: "2026-11-18",
        registration_deadline: "खुली (Open)",
        venue: "ठाणे • छत्रपती शिवाजी महाराज स्टेडियम, ठाणे",
        min_players: 12,
        max_players: 15,
    },
    {
        id: "sub-junior-2026",
        name_mr: "राज्यस्तरीय सब-ज्युनियर (१४ वर्षांखालील) अजिंक्यपद निवड चाचणी स्पर्धा २०२६",
        name_en: "State Sub-Junior (Under-14) Kho-Kho Championship 2026",
        status: "UPCOMING",
        category: "SUB_JUNIOR_U14",
        start_date: "2026-12-05",
        end_date: "2026-12-08",
        registration_deadline: "खुली (Open)",
        venue: "ठाणे • छत्रपती शिवाजी महाराज स्टेडियम, ठाणे",
        min_players: 12,
        max_players: 15,
    },
];

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>(DEFAULT_TOURNAMENTS);

    useEffect(() => {
        const loadTournaments = async () => {
            try {
                const supabase = createClient();
                if (supabase) {
                    const { data, error } = await supabase
                        .from("tournaments")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (!error && data && data.length > 0) {
                        setTournaments(data);
                    }
                }
            } catch {
                // Fallback to default state on network or empty response
            }
        };
        loadTournaments();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Public Header Banner */}
                <div className="mb-8 rounded-3xl border border-purple-100 bg-[#F7F2FA] p-6 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <span className="inline-block rounded-full bg-purple-100/80 px-3.5 py-1 text-xs font-semibold text-purple-900">
                                महाराष्ट्र राज्य खो-खो असोसिएशन • राज्य अजिंक्यपद सत्र २०२६-२७
                            </span>
                            <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                                अधिकृत स्पर्धा व अजिंक्यपद वेळापत्रक
                            </h1>
                            <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
                                Official State Tournaments & District Squad Registration Portal
                            </p>
                        </div>

                        {/* Public Navigation */}
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-purple-700"
                            >
                                मुख्य पोर्टल (Home)
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Public Tournaments Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {tournaments.map((tournament) => (
                        <div
                            key={tournament.id}
                            className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-purple-200/70 bg-purple-50/80 px-3 py-1 text-xs font-semibold text-purple-900">
                                        • आगामी स्पर्धा (UPCOMING)
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {tournament.category || "SENIOR"}
                                    </span>
                                </div>

                                {/* Tournament Name */}
                                <h2 className="mt-4 text-lg font-bold leading-snug text-gray-900">
                                    {tournament.name_mr}
                                </h2>
                                <p className="mt-1 text-xs font-medium text-gray-500">
                                    {tournament.name_en}
                                </p>

                                {/* Information List */}
                                <div className="mt-5 space-y-2 text-xs text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span>🗓️</span>
                                        <span>
                                            <strong className="text-gray-900">स्पर्धा कालावधी:</strong>{" "}
                                            {tournament.start_date || "2026-11-15"} ते {tournament.end_date || "2026-11-18"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>⏳</span>
                                        <span>
                                            <strong className="text-gray-900">नोंदणी अंतिम मुदत:</strong>{" "}
                                            {tournament.registration_deadline || "खुली (Open)"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📍</span>
                                        <span>
                                            <strong className="text-gray-900">यजमान जिल्हा व मैदान:</strong>{" "}
                                            {tournament.venue || tournament.district_mr || "ठाणे • छत्रपती शिवाजी महाराज स्टेडियम, ठाणे"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>👥</span>
                                        <span>
                                            <strong className="text-gray-900">संघ निकष:</strong> किमान{" "}
                                            {tournament.min_players || 12} - कमाल {tournament.max_players || 15} खेळाडू
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Public Action Buttons */}
                            <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                                <Link
                                    href={`/tournaments/${tournament.id}`}
                                    className="w-full rounded-full border border-purple-200 bg-white py-2.5 text-center text-xs font-bold text-purple-900 transition hover:bg-purple-50 sm:w-1/2"
                                >
                                    स्पर्धा केंद्र व दाखल संघ
                                </Link>
                                <Link
                                    href={`/tournaments/${tournament.id}/squad-entry`}
                                    className="w-full rounded-full bg-[#5E428F] py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#4C3375] sm:w-1/2"
                                >
                                    संघ दाखल करा →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
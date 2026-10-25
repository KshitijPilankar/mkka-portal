"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CreateTournamentModal from "./CreateTournamentModal";
import DeleteTournamentModal from "./DeleteTournamentModal";

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

const INITIAL_TOURNAMENTS: Tournament[] = [
    {
        id: "sub-junior-2026",
        name_mr: "राज्यस्तरीय सब-ज्युनियर (१४ वर्षांखालील) अजिंक्यपद निवड चाचणी स्पर्धा २०२६",
        name_en: "State Sub-Junior (Under-14) Kho-Kho Championship 2026",
        status: "UPCOMING",
        category: "ज्युनियर",
        start_date: "5/12/2026",
        end_date: "8/12/2026",
        registration_deadline: "खुली (Open)",
        venue: "ठाणे • छत्रपती शिवाजी महाराज स्टेडियम, ठाणे",
        min_players: 12,
        max_players: 15,
    },
    {
        id: "senior-state-2026",
        name_mr: "५९ वी वरिष्ठ गट पुरुष व महिला राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७",
        name_en: "59th Senior State Kho-Kho Championship 2026-27",
        status: "UPCOMING",
        category: "वरिष्ठ गट",
        start_date: "15/11/2026",
        end_date: "18/11/2026",
        registration_deadline: "खुली (Open)",
        venue: "पुणे • शिवछत्रपती क्रीडानगरी, बालेवाडी",
        min_players: 12,
        max_players: 15,
    },
];

function TournamentsContent() {
    const searchParams = useSearchParams();
    const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

    // Check URL for admin access (e.g., /tournaments?admin=true)
    useEffect(() => {
        if (searchParams.get("admin") === "true") {
            setIsAdmin(true);
        }
    }, [searchParams]);

    // Fetch live tournaments from Supabase
    const fetchTournaments = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("tournaments")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
                setTournaments(data);
            }
        } catch {
            // Fallback to initial state if table is empty or during network delay
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleDeleteClick = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header Banner */}
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

                        {/* Actions: Home, Admin Toggle, and Host Tournament */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/"
                                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-purple-700"
                            >
                                मुख्य पोर्टल (Home)
                            </Link>

                            {/* Admin Mode Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsAdmin(!isAdmin)}
                                className={`rounded-full px-4 py-2 text-xs font-bold transition ${isAdmin
                                        ? "border border-purple-300 bg-purple-100 text-purple-900 shadow-2xs"
                                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                {isAdmin ? "✓ प्रशासक मोड सुरू (Admin Active)" : "⚙️ प्रशासक दृश्य (Admin View)"}
                            </button>

                            {/* Host Tournament Button: Visible ONLY in Admin Mode */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#5E428F] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#4C3375]"
                                >
                                    <span>🏆</span>
                                    <span>+ नवीन स्पर्धा आयोजित करा (Host Tournament)</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tournaments Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {tournaments.map((tournament) => (
                        <div
                            key={tournament.id}
                            className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <div>
                                {/* Top Row: Status, Category & Custom Delete Icon */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-purple-200/70 bg-purple-50/80 px-3 py-1 text-xs font-semibold text-purple-900">
                                            • आगामी स्पर्धा (UPCOMING)
                                        </span>
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                            {tournament.category || "वरिष्ठ गट"}
                                        </span>
                                    </div>

                                    {/* Custom Delete Icon: Rendered ONLY in Admin Mode */}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(tournament)}
                                            title="स्पर्धा हटवा (Delete Tournament)"
                                            className="group rounded-xl p-1.5 transition hover:bg-red-50 focus:outline-hidden"
                                        >
                                            <Image
                                                src="/delete-icon.png"
                                                alt="Delete Tournament"
                                                width={28}
                                                height={28}
                                                className="h-7 w-7 object-contain transition-transform group-hover:scale-110"
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Tournament Titles */}
                                <h2 className="mt-4 text-lg font-bold leading-snug text-gray-900">
                                    {tournament.name_mr}
                                </h2>
                                <p className="mt-1 text-xs font-medium text-gray-500">
                                    {tournament.name_en}
                                </p>

                                {/* Details List */}
                                <div className="mt-5 space-y-2 text-xs text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span>🗓️</span>
                                        <span>
                                            <strong className="text-gray-900">स्पर्धा कालावधी:</strong>{" "}
                                            {tournament.start_date || "5/12/2026"} ते {tournament.end_date || "8/12/2026"}
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
                                            {tournament.venue || tournament.venue_mr || "ठाणे • छत्रपती शिवाजी महाराज स्टेडियम, ठाणे"}
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

                {/* Modals */}
                <CreateTournamentModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchTournaments}
                    onTournamentCreated={fetchTournaments}
                />

                <DeleteTournamentModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedTournament(null);
                    }}
                    tournament={selectedTournament}
                    tournamentId={selectedTournament?.id}
                    tournamentName={selectedTournament?.name_mr}
                    onSuccess={fetchTournaments}
                    onDeleted={fetchTournaments}
                />

            </main>
        </div>
    );
}

export default function TournamentsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">लोड होत आहे...</div>}>
            <TournamentsContent />
        </Suspense>
    );
}
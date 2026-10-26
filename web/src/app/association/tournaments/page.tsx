"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

export default function AdminTournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>(DEFAULT_TOURNAMENTS);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);
    const [pinInput, setPinInput] = useState("");
    const [pinError, setPinError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // New Tournament Form State
    const [form, setForm] = useState({
        name_mr: "",
        name_en: "",
        category: "SENIOR",
        start_date: "",
        end_date: "",
        venue: "",
        min_players: 12,
        max_players: 15,
    });

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
            // Fallback
        }
    };

    useEffect(() => {
        loadTournaments();
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name_mr.trim()) return;

        const newTournament: Tournament = {
            id: `tourn-${Date.now()}`,
            name_mr: form.name_mr,
            name_en: form.name_en || form.name_mr,
            category: form.category,
            start_date: form.start_date || "2026-12-01",
            end_date: form.end_date || "2026-12-05",
            venue: form.venue || "महाराष्ट्र क्रीडा संकुल",
            registration_deadline: "खुली (Open)",
            min_players: Number(form.min_players),
            max_players: Number(form.max_players),
        };

        try {
            const supabase = createClient();
            if (supabase) {
                await supabase.from("tournaments").insert([newTournament]);
            }
        } catch {
            // offline fallback
        }

        setTournaments((prev) => [newTournament, ...prev]);
        setIsCreateOpen(false);
        setForm({
            name_mr: "",
            name_en: "",
            category: "SENIOR",
            start_date: "",
            end_date: "",
            venue: "",
            min_players: 12,
            max_players: 15,
        });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            const { deleteTournamentAction } = await import('@/app/actions/tournament-actions');
            const res = await deleteTournamentAction({
                tournamentId: deleteTarget.id,
                adminPin: pinInput.trim(),
                confirmName: deleteTarget.name_mr,
                expectedName: deleteTarget.name_mr,
            });

            if (!res.success) {
                setPinError(res.error || 'स्पर्धा हटवता आली नाही (Deletion failed)');
                setIsDeleting(false);
                return;
            }

            setTournaments((prev) => prev.filter((t) => t.id !== deleteTarget.id));
            setDeleteTarget(null);
            setPinInput("");
            setPinError("");
        } catch {
            setPinError('सर्व्हर त्रुटी (Server error occurred)');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Admin Header Banner */}
                <div className="mb-8 rounded-3xl border border-purple-200 bg-[#F7F2FA] p-6 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <span className="inline-block rounded-full bg-purple-200 px-3.5 py-1 text-xs font-bold text-purple-900">
                                सुरक्षित प्रशासकीय कक्ष • ADMIN CONTROL PANEL
                            </span>
                            <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                                राज्य स्पर्धा व्यवस्थापन व नियंत्रण केंद्र
                            </h1>
                            <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
                                नवीन स्पर्धा आयोजन, संघ छाननी आणि अधिकृत नियंत्रण व्यवस्था
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/association/dashboard"
                                className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-100"
                            >
                                ← मुख्य नियंत्रण कक्ष (Dashboard)
                            </Link>

                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#5E428F] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#4C3375] cursor-pointer"
                            >
                                <span>🏆</span>
                                <span>+ नवीन स्पर्धा आयोजित करा (Host Tournament)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tournaments Grid with Admin Controls */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {tournaments.map((tournament) => (
                        <div
                            key={tournament.id}
                            className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-purple-200/70 bg-purple-50/80 px-3 py-1 text-xs font-semibold text-purple-900">
                                            • सक्रिय स्पर्धा (ACTIVE)
                                        </span>
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                            {tournament.category || "SENIOR"}
                                        </span>
                                    </div>

                                    {/* Custom Pink Delete Icon */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteTarget(tournament);
                                            setPinInput("");
                                            setPinError("");
                                        }}
                                        title="स्पर्धा कायमची हटवा (Delete Tournament)"
                                        className="group rounded-xl p-1.5 transition hover:bg-red-50 cursor-pointer"
                                    >
                                        <Image
                                            src="/delete-icon.png"
                                            alt="Delete Tournament"
                                            width={28}
                                            height={28}
                                            className="h-7 w-7 object-contain transition-transform group-hover:scale-110"
                                        />
                                    </button>
                                </div>

                                <h2 className="mt-4 text-lg font-bold leading-snug text-gray-900">
                                    {tournament.name_mr}
                                </h2>
                                <p className="mt-1 text-xs font-medium text-gray-500">
                                    {tournament.name_en}
                                </p>

                                <div className="mt-5 space-y-2 text-xs text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span>🗓️</span>
                                        <span>
                                            <strong className="text-gray-900">कालावधी:</strong>{" "}
                                            {tournament.start_date} ते {tournament.end_date}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📍</span>
                                        <span>
                                            <strong className="text-gray-900">मैदान व स्थळ:</strong>{" "}
                                            {tournament.venue || "महाराष्ट्र क्रीडा संकुल"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>👥</span>
                                        <span>
                                            <strong className="text-gray-900">खेळाडू निकष:</strong> किमान {tournament.min_players || 12} ते कमाल {tournament.max_players || 15}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Management Links */}
                            <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                                <Link
                                    href={`/tournaments/${tournament.id}`}
                                    className="w-full rounded-full border border-purple-200 bg-white py-2.5 text-center text-xs font-bold text-purple-900 transition hover:bg-purple-50 sm:w-1/2"
                                >
                                    दाखल संघ पडताळणी
                                </Link>
                                <Link
                                    href={`/tournaments/${tournament.id}/live`}
                                    className="w-full rounded-full bg-[#006A6A] py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#005252] sm:w-1/2"
                                >
                                    थेट गुणनोंदणी (Live Scoresheet) →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal: Create Tournament */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-base font-bold text-gray-900">नवीन राज्य स्पर्धा आयोजित करा</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700">स्पर्धेचे नाव (मराठी)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="उदा. ६० वी राज्य अजिंक्यपद निवड स्पर्धा २०२६"
                                        value={form.name_mr}
                                        onChange={(e) => setForm({ ...form, name_mr: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700">स्पर्धेचे नाव (English)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 60th State Kho-Kho Championship 2026"
                                        value={form.name_en}
                                        onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700">गट / Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden"
                                        >
                                            <option value="SENIOR">वरिष्ठ गट (Senior)</option>
                                            <option value="JUNIOR">ज्युनियर (Junior)</option>
                                            <option value="SUB_JUNIOR_U14">सब-ज्युनियर (Sub-Junior U-14)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700">यजमान मैदान / Venue</label>
                                        <input
                                            type="text"
                                            placeholder="मैदान व शहर"
                                            value={form.venue}
                                            onChange={(e) => setForm({ ...form, venue: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700">सुरुवात दिनांक</label>
                                        <input
                                            type="date"
                                            value={form.start_date}
                                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700">समाप्ती दिनांक</label>
                                        <input
                                            type="date"
                                            value={form.end_date}
                                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end gap-3 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="rounded-full border border-gray-300 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                                    >
                                        रद्द करा (Cancel)
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-full bg-[#5E428F] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4C3375]"
                                    >
                                        स्पर्धा प्रकाशित करा (Publish)
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Delete Confirmation with PIN */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 p-2">
                                    <Image
                                        src="/delete-icon.png"
                                        alt="Delete"
                                        width={36}
                                        height={36}
                                        className="h-9 w-9 object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">स्पर्धा कायमची हटवा</h3>
                                    <p className="text-xs text-gray-500">प्रशासकीय खात्री आवश्यक</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl bg-purple-50/60 p-3 text-xs text-purple-900">
                                <strong>स्पर्धा:</strong> {deleteTarget.name_mr}
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-700">
                                    प्रशासक सिक्युरिटी पिन (Admin PIN)
                                </label>
                                <input
                                    type="password"
                                    placeholder="सुरक्षा पिन टाका"
                                    value={pinInput}
                                    onChange={(e) => {
                                        setPinInput(e.target.value);
                                        setPinError("");
                                    }}
                                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold focus:border-purple-600 focus:outline-hidden"
                                />
                                {pinError && <p className="mt-1 text-xs font-semibold text-red-600">{pinError}</p>}
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteTarget(null);
                                        setPinInput("");
                                        setPinError("");
                                    }}
                                    className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 cursor-pointer"
                                >
                                    रद्द करा (Cancel)
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={confirmDelete}
                                    className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isDeleting ? "हटवत आहे..." : "नक्की हटवा (Confirm Delete)"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
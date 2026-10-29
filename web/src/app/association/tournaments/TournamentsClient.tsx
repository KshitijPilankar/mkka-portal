'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    Trophy,
    ArrowLeft,
    Plus,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Users,
    ShieldAlert,
} from 'lucide-react';
import { createTournamentAction } from '@/app/actions/tournament-action';

interface Tournament {
    id: string;
    name_mr: string;
    name_en?: string;
    category: string;
    gender_group?: string;
    venue_ground?: string;
    start_date: string;
    end_date: string;
    entry_deadline?: string;
    min_dob?: string | null;
    max_dob?: string | null;
    dob_cutoff?: string | null;
    squads_count?: number;
}

export default function TournamentsClient({ initialTournaments }: { initialTournaments: Tournament[] }) {
    const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFeedback(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const res = await createTournamentAction(formData);
            if (res.success) {
                setFeedback({ type: 'success', text: 'नवीन राज्य अजिंक्यपद स्पर्धा अधिकृतरीत्या घोषित झाली आहे!' });
                setIsModalOpen(false);
                form.reset();
                window.location.reload();
            } else {
                setFeedback({ type: 'error', text: res.error || 'स्पर्धा नोंदणी अयशस्वी झाली.' });
            }
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-4">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> मुख्य पोर्टल (Back to Home)
                </Link>

                {/* Declare New Competition Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-md shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>नवीन स्पर्धा घोषित करा (Declare Competition)</span>
                </button>
            </div>

            {/* Main Header Icon & Title */}
            <div className="text-center space-y-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D] mx-auto">
                    <Trophy className="w-6 h-6 text-[#6750A4]" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-[#EADDFF]/70 text-[#21005D] text-[10px] font-bold uppercase tracking-wider">
                    सत्र २०२६-२७ अधिकृत स्पर्धा कॅलेंडर
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1C1B1F]">
                    महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा व वेळापत्रक
                </h1>
                <p className="text-xs text-[#49454F] max-w-2xl mx-auto">
                    महाराष्ट्र राज्य खो-खो असोसिएशन संलग्न ३६ जिल्हा संघटनांच्या सहभागाने आयोजित अधिकृत अजिंक्यपद स्पर्धा.
                </p>
            </div>

            {feedback && (
                <div
                    className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${feedback.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                >
                    <span>{feedback.text}</span>
                    <button onClick={() => setFeedback(null)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Existing Tournaments Grid (Matches Screenshot exactly) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {tournaments.map((t) => {
                    const squadsCount = t.squads_count || 0;
                    return (
                        <div
                            key={t.id}
                            className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
                        >
                            <div className="space-y-4">
                                {/* Pills */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className="px-3 py-1 rounded-full bg-[#F3EDF7] text-[#6750A4] text-[10px] font-bold">
                                        {t.category === 'SUB_JUNIOR_U14' || t.category === 'SUB_JUNIOR'
                                            ? 'Sub-Junior / सब-ज्युनियर'
                                            : t.category === 'JUNIOR_U18' || t.category === 'JUNIOR'
                                                ? 'Junior / ज्युनियर गट'
                                                : 'Senior / वरिष्ठ गट'}
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                        <Users className="w-3 h-3 text-emerald-600" />
                                        <span>{squadsCount} जिल्हे सहभागी</span>
                                    </span>
                                </div>

                                {/* Tournament Title */}
                                <h2 className="text-base sm:text-lg font-bold text-[#1C1B1F] leading-snug">
                                    {t.name_mr || t.name_en}
                                </h2>

                                {/* Meta details */}
                                <div className="space-y-2 text-xs text-[#49454F]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-[#79747E] shrink-0 mt-0.5" />
                                        <span>{t.venue_ground || 'शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे'}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#79747E] shrink-0" />
                                        <span>
                                            स्पर्धा कालावधी: <strong className="font-mono text-[#1C1B1F]">{t.start_date}</strong> ते{' '}
                                            <strong className="font-mono text-[#1C1B1F]">{t.end_date}</strong>
                                        </span>
                                    </div>

                                    {t.entry_deadline && (
                                        <div className="flex items-center gap-2 text-rose-700 font-medium">
                                            <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>संघ सादर अंतिम मुदत: {t.entry_deadline}</span>
                                        </div>
                                    )}

                                    {/* DOB Cut-off Highlight if present */}
                                    {(t.min_dob || t.dob_cutoff) && (
                                        <div className="mt-1 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 font-mono">
                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                            <span>DOB मर्यादा: {t.min_dob || t.dob_cutoff} नंतर जन्मलेले खेळाडू</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link
                                    href={`/district/competitions/${t.id}`}
                                    className="h-10 px-4 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>जिल्हा संघ नोंदणी</span>
                                </Link>

                                <Link
                                    href={`/association/tournaments/${t.id}`}
                                    className="h-10 px-4 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                >
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>खेळाडू ओळखपत्र तपासा</span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* POPUP MODAL: DECLARE NEW COMPETITION WITH DYNAMIC DOB LIMIT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 my-8 border border-[#CAC4D0]">
                        <div className="flex items-center justify-between pb-3 border-b border-[#CAC4D0]/60">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                                    <Trophy className="w-5 h-5 text-[#6750A4]" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#6750A4] uppercase tracking-wider block">
                                        राज्य अजिंक्यपद अधिकृत घोषणा
                                    </span>
                                    <h2 className="text-lg font-extrabold text-[#1C1B1F]">
                                        नवीन स्पर्धा घोषित करा (Declare Competition)
                                    </h2>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-9 h-9 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 text-xs">
                            {/* Competition Title */}
                            <div className="space-y-1">
                                <label className="font-semibold text-[#1C1B1F]">स्पर्धेचे पूर्ण नाव (मराठीत)*</label>
                                <input
                                    type="text"
                                    name="name_mr"
                                    required
                                    placeholder="उदा. ६० वी वरिष्ठ गट पुरुष व महिला राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७"
                                    className="w-full h-11 px-4 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] font-medium text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                />
                            </div>

                            {/* Category & Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">वयोगट / स्पर्धा प्रकार (Category)*</label>
                                    <select
                                        name="category"
                                        required
                                        className="w-full h-11 px-4 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    >
                                        <option value="SENIOR">वरिष्ठ गट (Senior - Open)</option>
                                        <option value="SUB_JUNIOR_U14">सब-ज्युनियर १४ वर्षांखालील (Sub-Junior U-14)</option>
                                        <option value="JUNIOR_U18">ज्युनियर १८ वर्षांखालील (Junior U-18)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">गट (Gender Group)*</label>
                                    <select
                                        name="gender_group"
                                        className="w-full h-11 px-4 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    >
                                        <option value="OPEN">पुरुष व महिला (Both)</option>
                                        <option value="BOYS">केवळ मुले / पुरुष (Men/Boys)</option>
                                        <option value="GIRLS">केवळ मुली / महिला (Women/Girls)</option>
                                    </select>
                                </div>
                            </div>

                            {/* DYNAMIC DOB LIMIT BLOCK (Custom Cut-off set by Association) */}
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                                    <span>असोसिएशन विहित जन्मतारीख मर्यादा (Custom Player DOB Limit):</span>
                                </div>
                                <p className="text-[11px] text-amber-800">
                                    जिल्हा संघ निवडताना या तारखेच्या आतील खेळाडूच निवडले जातील, बाकी सर्व खेळाडू आपोआप <strong>अपात्र (Disabled)</strong> होतील.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <label className="font-semibold text-[#1C1B1F]">
                                            किमान जन्मतारीख (Born On or After)*:
                                        </label>
                                        <input
                                            type="date"
                                            name="min_dob"
                                            placeholder="YYYY-MM-DD"
                                            className="w-full h-10 px-3 rounded-xl bg-white border border-amber-300 font-mono text-xs text-[#1C1B1F] focus:ring-2 focus:ring-amber-600 focus:outline-none"
                                        />
                                        <span className="text-[10px] text-[#79747E] block">उदा. U-14 साठी 2012-01-01 किंवा परिपत्रकानुसार तारीख</span>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-semibold text-[#1C1B1F]">
                                            कमाल जन्मतारीख (Born Before - पर्यायी):
                                        </label>
                                        <input
                                            type="date"
                                            name="max_dob"
                                            placeholder="YYYY-MM-DD"
                                            className="w-full h-10 px-3 rounded-xl bg-white border border-amber-300 font-mono text-xs text-[#1C1B1F] focus:ring-2 focus:ring-amber-600 focus:outline-none"
                                        />
                                        <span className="text-[10px] text-[#79747E] block">अंडरएज खेळाडू रोखण्यासाठी</span>
                                    </div>
                                </div>
                            </div>

                            {/* Venue */}
                            <div className="space-y-1">
                                <label className="font-semibold text-[#1C1B1F]">स्पर्धेचे मैदान व ठिकाण (Venue & Ground)*</label>
                                <input
                                    type="text"
                                    name="venue_ground"
                                    defaultValue="शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे"
                                    required
                                    className="w-full h-11 px-4 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">सुरुवात दिनांक*</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        required
                                        className="w-full h-10 px-3 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] font-mono text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">समाप्ती दिनांक*</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        required
                                        className="w-full h-10 px-3 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] font-mono text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-[#1C1B1F]">संघ सादर मुदत (Deadline)*</label>
                                    <input
                                        type="date"
                                        name="entry_deadline"
                                        required
                                        className="w-full h-10 px-3 rounded-xl bg-[#F3EDF7]/40 border border-[#CAC4D0] font-mono text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-3 flex justify-end gap-3 border-t border-[#CAC4D0]/50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="h-10 px-5 rounded-full bg-[#E7E0EC] text-xs font-semibold text-[#1C1B1F] hover:bg-[#CAC4D0]"
                                >
                                    रद्द करा (Cancel)
                                </button>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-10 px-6 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>नोंद होत आहे...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>अधिकृत स्पर्धा घोषित करा</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
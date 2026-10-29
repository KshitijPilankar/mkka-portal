"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trophy, X, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { createTournamentAction } from "@/app/actions/tournament-action";

export default function DeclareTournamentButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const res = await createTournamentAction(formData);
            if (res.success) {
                setIsOpen(false);
                form.reset();
                window.location.reload();
            } else {
                setErrorMsg(res.error || "स्पर्धा घोषित करताना त्रुटी आली.");
            }
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>नवीन स्पर्धा घोषित करा (Declare Competition)</span>
            </button>

            {isOpen && (
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
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-9 h-9 rounded-full bg-[#F3EDF7] hover:bg-[#EADDFF] flex items-center justify-center text-[#1C1B1F] cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

                            {/* Dynamic Association DOB Limit */}
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
                                        <span className="text-[10px] text-[#79747E] block">
                                            उदा. 2012-01-01 किंवा परिपत्रकानुसार निश्चित तारीख
                                        </span>
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
                                        <span className="text-[10px] text-[#79747E] block">
                                            अंडरएज खेळाडू रोखण्यासाठी
                                        </span>
                                    </div>
                                </div>
                            </div>

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

                            <div className="pt-3 flex justify-end gap-3 border-t border-[#CAC4D0]/50">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="h-10 px-5 rounded-full bg-[#E7E0EC] text-xs font-semibold text-[#1C1B1F] hover:bg-[#CAC4D0] cursor-pointer"
                                >
                                    रद्द करा (Cancel)
                                </button>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-10 px-6 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
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
        </>
    );
}
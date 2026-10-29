"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Trophy,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Calendar,
    ShieldAlert,
    UserCheck,
} from "lucide-react";
import { submitDistrictSquadAction } from "@/app/actions/squad-action";

interface Player {
    id: string;
    first_name: string;
    middle_name?: string | null;
    surname: string;
    state_no?: string | null;
    player_id_number?: string | null;
    mobile_no?: string | null;
    dob: string;
    gender: string;
    status: string;
}

interface Tournament {
    id: string;
    name_mr?: string;
    title?: string;
    name?: string;
    tournament_name?: string;
    category?: string;
    age_group?: string;
    min_dob?: string | null; // e.g. "2012-01-01"
    max_dob?: string | null; // e.g. "2016-12-31"
    dob_cutoff?: string | null;
    entry_deadline?: string;
}

interface Props {
    tournament: Tournament;
    players: Player[];
    districtCode: string;
    districtName: string;
    existingSquad?: {
        player_ids: string[];
        coach_name: string;
        coach_mobile: string;
        manager_name?: string;
        manager_mobile?: string;
    } | null;
}

// DOB Eligibility Validator Helper
function checkPlayerDobEligibility(
    dobStr: string,
    tournament: Tournament
): { isEligible: boolean; reason?: string } {
    if (!dobStr) {
        return { isEligible: false, reason: "जन्मतारीख नोंद उपलब्ध नाही" };
    }

    const playerDob = new Date(dobStr);
    if (isNaN(playerDob.getTime())) {
        return { isEligible: false, reason: "अवैध जन्मतारीख" };
    }

    // 1. Explicit Tournament Cut-off Dates (Set by Association Admin)
    if (tournament.min_dob) {
        const minDate = new Date(tournament.min_dob);
        if (playerDob < minDate) {
            return {
                isEligible: false,
                reason: `अपात्र: जन्मतारीख ${tournament.min_dob} नंतरची असणे आवश्यक (वय जास्त)`,
            };
        }
    }

    if (tournament.max_dob) {
        const maxDate = new Date(tournament.max_dob);
        if (playerDob > maxDate) {
            return {
                isEligible: false,
                reason: `अपात्र: जन्मतारीख ${tournament.max_dob} पूर्वीची असणे आवश्यक (वय कमी)`,
            };
        }
    }

    if (tournament.dob_cutoff) {
        const cutoff = new Date(tournament.dob_cutoff);
        if (playerDob < cutoff) {
            return {
                isEligible: false,
                reason: `अपात्र: कट-ऑफ तारीख (${tournament.dob_cutoff}) निकष अपूर्ण`,
            };
        }
    }

    // 2. Fallback check for Standard Categories if custom dates not set
    const cat = (tournament.category || tournament.age_group || "").toUpperCase();
    if (cat.includes("SUB_JUNIOR") || cat.includes("U14") || cat.includes("U-14")) {
        const defaultU14Cutoff = new Date("2012-01-01");
        if (playerDob < defaultU14Cutoff) {
            return {
                isEligible: false,
                reason: "अपात्र: सब-ज्युनियर १४ वर्षांखालील निकष अपूर्ण (Overage)",
            };
        }
    } else if (cat.includes("JUNIOR") || cat.includes("U18") || cat.includes("U-18")) {
        const defaultU18Cutoff = new Date("2008-01-01");
        if (playerDob < defaultU18Cutoff) {
            return {
                isEligible: false,
                reason: "अपात्र: ज्युनियर १८ वर्षांखालील निकष अपूर्ण (Overage)",
            };
        }
    }

    return { isEligible: true };
}

export default function SquadSelectionClient({
    tournament,
    players,
    districtCode,
    districtName,
    existingSquad,
}: Props) {
    const router = useRouter();
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
        existingSquad?.player_ids || []
    );
    const [coachName, setCoachName] = useState(existingSquad?.coach_name || "");
    const [coachMobile, setCoachMobile] = useState(existingSquad?.coach_mobile || "");
    const [managerName, setManagerName] = useState(existingSquad?.manager_name || "");
    const [managerMobile, setManagerMobile] = useState(existingSquad?.manager_mobile || "");

    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
        null
    );

    const tournamentTitle =
        tournament.name_mr ||
        tournament.title ||
        tournament.name ||
        tournament.tournament_name ||
        "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा";

    const togglePlayer = (player: Player) => {
        const { isEligible } = checkPlayerDobEligibility(player.dob, tournament);
        if (!isEligible) return; // Disallow selection if ineligible

        if (selectedPlayerIds.includes(player.id)) {
            setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== player.id));
        } else {
            if (selectedPlayerIds.length >= 15) {
                setFeedback({
                    type: "error",
                    text: "एका संघात कमाल १५ खेळाडूंचीच निवड करता येते.",
                });
                return;
            }
            setSelectedPlayerIds([...selectedPlayerIds, player.id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (selectedPlayerIds.length < 12 || selectedPlayerIds.length > 15) {
            setFeedback({
                type: "error",
                text: `किमान १२ व कमाल १५ खेळाडूंची निवड करणे बंधनकारक आहे. (सध्या निवडले: ${selectedPlayerIds.length})`,
            });
            return;
        }

        if (!coachName.trim() || !coachMobile.trim()) {
            setFeedback({
                type: "error",
                text: "अधिकृत प्रशिक्षकांचे (Coach) नाव आणि मोबाईल नंबर भरणे अनिवार्य आहे.",
            });
            return;
        }

        startTransition(async () => {
            const res = await submitDistrictSquadAction({
                tournamentId: tournament.id,
                playerIds: selectedPlayerIds,
                coachName: coachName.trim(),
                coachMobile: coachMobile.trim(),
                managerName: managerName.trim() || undefined,
                managerMobile: managerMobile.trim() || undefined,
            });

            if (res.success) {
                setFeedback({
                    type: "success",
                    text: "जिल्हा संघ अधिकृतरीत्या यशस्वीपणे सबमिट झाला आहे! आता पात्रता प्रमाणपत्र डाऊनलोड करू शकता.",
                });
                setTimeout(() => {
                    router.push(`/district/certificates?tournamentId=${tournament.id}`);
                }, 1500);
            } else {
                setFeedback({
                    type: "error",
                    text: res.error || "संघ सबमिट करताना त्रुटी आली.",
                });
            }
        });
    };

    const isCountValid = selectedPlayerIds.length >= 12 && selectedPlayerIds.length <= 15;

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-6 px-4">
            {/* Top Header */}
            <div>
                <Link
                    href="/district/competitions"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> स्पर्धा सूची (Back to Competitions)
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-[#1C1B1F] flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-[#6750A4]" />
                            <span>{tournamentTitle}</span>
                        </h1>
                        <p className="text-xs text-[#49454F] mt-1">
                            {districtName} ({districtCode}) — अधिकृत १२ ते १५ खेळाडूंचा संघ, प्रशिक्षक व व्यवस्थापक नोंदणी.
                        </p>
                    </div>

                    {/* DOB Criteria Banner */}
                    {(tournament.min_dob || tournament.dob_cutoff || tournament.category) && (
                        <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                            <span className="font-bold flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-amber-700" />
                                <span>अधिकृत जन्मतारीख मर्यादा (DOB Limit):</span>
                            </span>
                            <span className="text-[11px] font-mono mt-0.5 block">
                                {tournament.min_dob
                                    ? `जन्मतारीख: ${tournament.min_dob} नंतरची असणे आवश्यक`
                                    : tournament.category?.includes("SUB_JUNIOR")
                                        ? "१४ वर्षांखालील: ०१/०१/२०१२ नंतर जन्मलेले खेळाडू"
                                        : "असोसिएशन विहित नियमांनुसार वयोमर्यादा लागू"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {feedback && (
                <div
                    className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${feedback.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {feedback.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                    </div>
                    <button onClick={() => setFeedback(null)}>
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Selected Counter Pill */}
            <div className="p-4 rounded-2xl bg-[#F3EDF7] border border-[#CAC4D0]/50 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1B1F]">
                    निवडलेले खेळाडू: <strong>{selectedPlayerIds.length} / १५</strong> (किमान १२ आवश्यक)
                </span>
                <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${isCountValid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                >
                    {isCountValid ? "पात्र संख्या (Eligible Count)" : "अपूर्ण संख्या (Incomplete)"}
                </span>
            </div>

            {/* Players Selection Grid */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h2 className="text-xs font-bold text-[#21005D] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#6750A4]" />
                        <span>जिल्ह्यातील खेळाडू यादी (Select 12 to 15 Players):</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {players.map((player) => {
                            const fullName = `${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim();
                            const isSelected = selectedPlayerIds.includes(player.id);
                            const { isEligible, reason } = checkPlayerDobEligibility(player.dob, tournament);

                            return (
                                <div
                                    key={player.id}
                                    onClick={() => {
                                        if (isEligible) togglePlayer(player);
                                    }}
                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${!isEligible
                                            ? "bg-gray-100/70 border-gray-200 opacity-60 cursor-not-allowed"
                                            : isSelected
                                                ? "bg-[#EADDFF]/40 border-[#6750A4] shadow-xs cursor-pointer"
                                                : "bg-white border-[#CAC4D0]/60 hover:border-[#6750A4]/60 cursor-pointer"
                                        }`}
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#1C1B1F] truncate block">
                                                {fullName}
                                            </span>
                                            {!isEligible && (
                                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[9px] font-bold shrink-0">
                                                    ⛔ अपात्र (DOB बाहेर)
                                                </span>
                                            )}
                                            {isEligible && isSelected && (
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                                                    निवडला
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-[11px] text-[#49454F] flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
                                            <span>जन्मतारीख: <strong>{player.dob}</strong></span>
                                            <span>मो.: {player.mobile_no || "-"}</span>
                                        </div>

                                        {!isEligible && reason && (
                                            <p className="text-[10px] text-rose-700 font-medium">
                                                {reason}
                                            </p>
                                        )}
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={!isEligible}
                                        onChange={() => {
                                            if (isEligible) togglePlayer(player);
                                        }}
                                        className={`w-5 h-5 rounded-md text-[#6750A4] focus:ring-[#6750A4] ${!isEligible ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                                            }`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Coach & Manager Details */}
                <div className="p-6 rounded-[28px] bg-[#F3EDF7]/50 border border-[#CAC4D0]/50 space-y-4 text-xs">
                    <h3 className="font-bold text-xs text-[#21005D] uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#6750A4]" />
                        <span>संघ मार्गदर्शक अधिकारी (Coach & Manager Details):</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">प्रशिक्षकाचे नाव (Coach Name)*</label>
                            <input
                                type="text"
                                required
                                value={coachName}
                                onChange={(e) => setCoachName(e.target.value)}
                                placeholder="उदा. श्री. राहुल शिंदे"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] focus:ring-2 focus:ring-[#6750A4] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">प्रशिक्षक मोबाईल (Coach Mobile)*</label>
                            <input
                                type="tel"
                                required
                                maxLength={10}
                                value={coachMobile}
                                onChange={(e) => setCoachMobile(e.target.value)}
                                placeholder="उदा. 9822112233"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-mono focus:ring-2 focus:ring-[#6750A4] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">व्यवस्थापकाचे नाव (Manager Name)</label>
                            <input
                                type="text"
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                placeholder="उदा. श्री. अमोल कदम"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] focus:ring-2 focus:ring-[#6750A4] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">व्यवस्थापक मोबाईल (Manager Mobile)</label>
                            <input
                                type="tel"
                                maxLength={10}
                                value={managerMobile}
                                onChange={(e) => setManagerMobile(e.target.value)}
                                placeholder="उदा. 9822445566"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-mono focus:ring-2 focus:ring-[#6750A4] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end gap-3">
                    <Link
                        href="/district/competitions"
                        className="h-11 px-6 rounded-full bg-[#E7E0EC] text-xs font-semibold text-[#1C1B1F] hover:bg-[#CAC4D0] flex items-center transition-all"
                    >
                        रद्द करा (Cancel)
                    </Link>
                    <button
                        type="submit"
                        disabled={!isCountValid || isPending}
                        className="h-11 px-8 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#6750A4]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md active:scale-95 transition-all"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>सबमिट होत आहे...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>अधिकृत जिल्हा संघ सबमिट करा</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
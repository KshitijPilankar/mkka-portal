"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    Trophy,
    CheckCircle2,
    AlertCircle,
    Loader2,
    UserCheck,
    ShieldAlert,
} from "lucide-react";
import { submitDistrictSquadAction } from "@/app/actions/district-squad";

interface Player {
    id: string;
    first_name: string;
    middle_name: string;
    surname: string;
    dob: string;
    state_no: string | null;
    mobile_no: string;
}

interface SquadSelectionClientProps {
    tournament: any;
    session: any;
    availablePlayers: Player[];
    existingEntry: any;
}

export default function SquadSelectionClient({
    tournament,
    session,
    availablePlayers,
    existingEntry,
}: SquadSelectionClientProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>(
        existingEntry?.player_ids || []
    );
    const [coachName, setCoachName] = useState(existingEntry?.coach_name || "");
    const [coachMobile, setCoachMobile] = useState(existingEntry?.coach_mobile || "");
    const [managerName, setManagerName] = useState(existingEntry?.manager_name || "");
    const [managerMobile, setManagerMobile] = useState(existingEntry?.manager_mobile || "");

    const [isPending, startTransition] = useTransition();
    const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const togglePlayer = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((pId) => pId !== id));
        } else {
            if (selectedIds.length >= 15) {
                setAlertMsg({ type: "error", text: "अधिकतम १५ खेळाडूच निवडता येतील. (Max 15 players allowed)" });
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
        setAlertMsg(null);
    };

    const handleSubmitSquad = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length < 12) {
            setAlertMsg({
                type: "error",
                text: `संघात किमान १२ खेळाडू असणे अनिवार्य आहे. (सध्या निवड: ${selectedIds.length})`,
            });
            return;
        }

        if (!coachName.trim() || !coachMobile.trim()) {
            setAlertMsg({ type: "error", text: "प्रशिक्षकांचे नाव व मोबाईल क्रमांक आवश्यक आहे." });
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("tournament_id", tournament.id);
            formData.append("coach_name", coachName.trim());
            formData.append("coach_mobile", coachMobile.trim());
            formData.append("manager_name", managerName.trim());
            formData.append("manager_mobile", managerMobile.trim());
            formData.append("player_ids", JSON.stringify(selectedIds));

            const res = await submitDistrictSquadAction(formData);
            if (res.success) {
                setAlertMsg({
                    type: "success",
                    text: "अधिकृत जिल्हा संघ यशस्वीरित्या सबमिट करण्यात आला आहे!",
                });
                setTimeout(() => {
                    router.push("/district/competitions");
                    router.refresh();
                }, 1500);
            } else {
                setAlertMsg({ type: "error", text: res.error || "त्रुटी आली." });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/district/competitions"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> स्पर्धा सूची (Back to Competitions)
                </Link>
                <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-[#6750A4]" />
                    {tournament.title || tournament.name || "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा"}
                </h1>
                <p className="text-xs text-[#49454F] mt-1">
                    {session.name_mr} ({session.code}) — अधिकृत १२ ते १५ खेळाडूंचा संघ, प्रशिक्षक व व्यवस्थापक नोंदणी.
                </p>
            </div>

            {alertMsg && (
                <div
                    className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${alertMsg.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                >
                    {alertMsg.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{alertMsg.text}</span>
                </div>
            )}

            {/* Counter bar */}
            <div className="p-4 rounded-2xl bg-[#EADDFF]/50 border border-[#CAC4D0]/60 flex items-center justify-between">
                <div className="text-xs font-bold text-[#21005D]">
                    निवडलेले खेळाडू: <span className="text-base text-[#6750A4]">{selectedIds.length}</span> / १५ (किमान १२ आवश्यक)
                </div>
                <div
                    className={`text-[11px] font-bold px-3 py-1 rounded-full ${selectedIds.length >= 12 && selectedIds.length <= 15
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                >
                    {selectedIds.length >= 12 ? "पात्र संघ रचना (Valid)" : "अपूर्ण संख्या (Incomplete)"}
                </div>
            </div>

            <form onSubmit={handleSubmitSquad} className="space-y-6">
                {/* Players Checklist */}
                <div className="rounded-[28px] bg-white border border-[#CAC4D0]/60 p-6 space-y-4">
                    <div className="font-bold text-sm text-[#1C1B1F] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#6750A4]" />
                        <span>जिल्ह्यातील मान्यताप्राप्त खेळाडू (Select 12 to 15 Players):</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePlayers.length === 0 ? (
                            <div className="col-span-2 text-xs text-[#49454F] italic">
                                जिल्ह्यात एकही मान्यताप्राप्त (Approved) खेळाडू उपलब्ध नाही.
                            </div>
                        ) : (
                            availablePlayers.map((player) => {
                                const isSelected = selectedIds.includes(player.id);
                                const fullName = `${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim();

                                return (
                                    <div
                                        key={player.id}
                                        onClick={() => togglePlayer(player.id)}
                                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${isSelected
                                                ? "bg-[#F3EDF7] border-[#6750A4] shadow-xs"
                                                : "bg-white border-[#CAC4D0]/60 hover:bg-[#F3EDF7]/30"
                                            }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className="text-xs font-bold text-[#1C1B1F]">{fullName}</div>
                                            <div className="text-[11px] text-[#49454F] font-mono">
                                                राज्य क्र.: {player.state_no || "प्रलंबित"} | मो.: {player.mobile_no}
                                            </div>
                                        </div>
                                        <div
                                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSelected
                                                    ? "bg-[#6750A4] border-[#6750A4] text-white"
                                                    : "border-[#79747E] bg-white"
                                                }`}
                                        >
                                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Coach & Manager Info */}
                <div className="rounded-[28px] bg-[#F3EDF7] border border-[#CAC4D0]/50 p-6 space-y-4">
                    <div className="font-bold text-sm text-[#21005D] flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#6750A4]" />
                        <span>संघ मार्गदर्शक अधिकारी (Coach & Manager Details):</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">प्रशिक्षकांचे नाव (Coach Name)*:</label>
                            <input
                                type="text"
                                required
                                value={coachName}
                                onChange={(e) => setCoachName(e.target.value)}
                                placeholder="उदा. श्री. राहुल शिंदे"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-medium text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">प्रशिक्षक मोबाईल (Coach Mobile)*:</label>
                            <input
                                type="text"
                                required
                                value={coachMobile}
                                onChange={(e) => setCoachMobile(e.target.value)}
                                placeholder="उदा. 9822112233"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-mono text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">व्यवस्थापकांचे नाव (Manager Name):</label>
                            <input
                                type="text"
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                placeholder="उदा. श्री. अमोल कदम"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-medium text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-[#1C1B1F]">व्यवस्थापक मोबाईल (Manager Mobile):</label>
                            <input
                                type="text"
                                value={managerMobile}
                                onChange={(e) => setManagerMobile(e.target.value)}
                                placeholder="उदा. 9822445566"
                                className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] font-mono text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <Link
                        href="/district/competitions"
                        className="h-12 px-6 rounded-full bg-[#E7E0EC] text-[#1C1B1F] text-xs font-semibold hover:bg-[#CAC4D0] flex items-center transition-all"
                    >
                        रद्द करा (Cancel)
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending || selectedIds.length < 12}
                        className="h-12 px-8 rounded-full bg-[#6750A4] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#6750A4]/90 active:scale-95 transition-all disabled:opacity-50 shadow-md"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>संघ सादर होत आहे...</span>
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
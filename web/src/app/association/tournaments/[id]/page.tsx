import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import {
    ArrowLeft,
    Trophy,
    Building2,
    Users,
    CheckCircle2,
    Calendar,
    Phone,
    UserCheck,
    MapPin,
    Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TournamentSquadsReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const hasAdminSession = await verifyAdminSession();

    if (!hasAdminSession) {
        redirect("/association/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // स्पर्धेचा डेटा, सबमिट झालेले जिल्हा संघ आणि ३६ जिल्हे डेटाबेसमधून मिळवणे
    const [tournamentRes, entriesRes, districtsRes] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", id).maybeSingle(),
        supabase.from("tournament_entries").select("*").eq("tournament_id", id).order("submitted_at", { ascending: false }),
        supabase.from("districts").select("id, name_mr, name_en, code"),
    ]);

    const tournament = tournamentRes.data;

    // शीर्षक आणि ठिकाणासाठी सर्व कॉलम नावांचे सुरक्षित फॉलबॅक
    const tournamentTitle =
        tournament?.name_mr ||
        tournament?.title ||
        tournament?.name ||
        tournament?.tournament_name ||
        "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७";

    const tournamentVenue =
        tournament?.venue ||
        tournament?.location ||
        tournament?.place ||
        "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे";

    const tournamentDates =
        tournament?.start_date && tournament?.end_date
            ? `${tournament.start_date} ते ${tournament.end_date}`
            : tournament?.start_date || "१५ ते १८ नोव्हेंबर २०२६";

    const entries = entriesRes.data || [];
    const districts = districtsRes.data || [];
    const districtMap = new Map(districts.map((d: any) => [d.id, d]));

    // सबमिट केलेल्या सर्व खेळाडूंची माहिती मिळवणे
    const allPlayerIds = entries.flatMap((e: any) => e.player_ids || []);
    let playerMap = new Map<string, any>();

    if (allPlayerIds.length > 0) {
        const { data: players } = await supabase
            .from("players")
            .select("id, first_name, middle_name, surname, state_no, federation_no, dob, mobile_no")
            .in("id", allPlayerIds);

        if (players) {
            playerMap = new Map(players.map((p) => [p.id, p]));
        }
    }

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Navigation & Title */}
                <div className="p-6 md:p-8 rounded-[32px] bg-[#F3EDF7] border border-[#CAC4D0]/50 shadow-sm space-y-3">
                    <Link
                        href="/association/tournaments"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> स्पर्धा सूचीकडे परत जा (Back to Tournaments)
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-bold tracking-wider uppercase mb-2">
                                अधिकृत जिल्हा संघ छाननी कक्ष (SQUAD SCRUTINY)
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1B1F] flex items-center gap-2">
                                <Trophy className="w-8 h-8 text-teal-700 shrink-0" />
                                <span>{tournamentTitle}</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-xs">
                                <Building2 className="w-4 h-4" />
                                <span>एकूण प्राप्त संघ: {entries.length} जिल्हे</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#49454F] pt-2 border-t border-[#CAC4D0]/40">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#79747E]" />
                            <span>ठिकाण: <strong>{tournamentVenue}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#79747E]" />
                            <span>स्पर्धा कालावधी: <strong>{tournamentDates}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Entries List */}
                {entries.length === 0 ? (
                    <div className="p-12 text-center rounded-[32px] bg-white border border-[#CAC4D0]/60 text-xs text-[#49454F]">
                        या स्पर्धेसाठी अजून एकाही जिल्ह्याने संघ सादर केलेला नाही.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {entries.map((entry: any, index: number) => {
                            const district = districtMap.get(entry.district_id);
                            const playerIds = entry.player_ids || [];

                            return (
                                <div
                                    key={entry.id}
                                    className="rounded-[32px] bg-white border border-[#CAC4D0]/60 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#CAC4D0]/50 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-[#EADDFF] flex items-center justify-center font-bold text-[#21005D]">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-[#1C1B1F]">
                                                    {district ? `${district.name_mr} (${district.name_en})` : "जिल्हा संघ"}
                                                </h2>
                                                <span className="text-[11px] font-mono text-[#6750A4]">
                                                    जिल्हा कोड: <strong>{district?.code || "N/A"}</strong> • सबमिट दिनांक:{" "}
                                                    <strong>{new Date(entry.submitted_at).toLocaleDateString("en-GB")}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{playerIds.length} खेळाडू सादर (Verified)</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Coach & Manager Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 text-xs">
                                        <div>
                                            प्रशिक्षक (Coach): <strong>{entry.coach_name}</strong>{" "}
                                            <span className="font-mono text-[#49454F]">(मो.: {entry.coach_mobile})</span>
                                        </div>
                                        <div>
                                            व्यवस्थापक (Manager): <strong>{entry.manager_name || "N/A"}</strong>{" "}
                                            {entry.manager_mobile && (
                                                 <span className="font-mono text-[#49454F]">(मो.: {entry.manager_mobile})</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 12 to 15 Players Roster Table */}
                                    <div className="overflow-x-auto border border-[#CAC4D0]/50 rounded-2xl">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-[#EADDFF]/40 border-b border-[#CAC4D0]/50 text-[11px] font-bold text-[#21005D]">
                                                    <th className="py-2.5 px-3 text-center w-12">क्र.</th>
                                                    <th className="py-2.5 px-4">खेळाडूचे संपूर्ण नाव</th>
                                                    <th className="py-2.5 px-3">राज्य अधिकृत क्र.</th>
                                                    <th className="py-2.5 px-3">राष्ट्रीय क्र. (KKFI)</th>
                                                    <th className="py-2.5 px-3">जन्मतारीख</th>
                                                    <th className="py-2.5 px-3">मोबाईल</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#CAC4D0]/30">
                                                {playerIds.map((pId: string, idx: number) => {
                                                    const p = playerMap.get(pId);
                                                    const fullName = p
                                                        ? `${p.first_name || ""} ${p.middle_name || ""} ${p.surname || ""}`.trim()
                                                        : "खेळाडू माहिती";

                                                    return (
                                                        <tr key={pId} className="hover:bg-purple-50/20 transition-colors">
                                                            <td className="py-2.5 px-3 text-center font-medium text-[#79747E]">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="py-2.5 px-4 font-bold text-[#1C1B1F]">
                                                                {fullName}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono font-medium text-[#6750A4]">
                                                                {p?.state_no || "-"}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-[#49454F]">
                                                                {p?.federation_no || "-"}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-[#49454F]">
                                                                {p?.dob || "-"}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-[#49454F]">
                                                                {p?.mobile_no || "-"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

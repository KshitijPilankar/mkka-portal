import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    ArrowLeft,
    Trophy,
    Building2,
    Users,
    CheckCircle2,
    Calendar,
    Phone,
    UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TournamentSquadsReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
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

    // स्पर्धेचा डेटा आणि सबमिट झालेले जिल्हा संघ आणणे
    const [tournamentRes, entriesRes, districtsRes] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", id).maybeSingle(),
        supabase.from("tournament_entries").select("*").eq("tournament_id", id),
        supabase.from("districts").select("id, name_mr, name_en, code"),
    ]);

    const tournament = tournamentRes.data || {
        id,
        title: "महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा",
        venue: "शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे",
    };

    const entries = entriesRes.data || [];
    const districts = districtsRes.data || [];
    const districtMap = new Map(districts.map((d: any) => [d.id, d]));

    // प्रत्येक जिल्ह्यातील खेळाडूंची माहिती मिळवणे
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
                <div>
                    <Link
                        href="/association/tournaments"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> स्पर्धा सूचीकडे परत जा (Back to Tournaments)
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                        <Trophy className="w-7 h-7 text-teal-700" />
                        {tournament.title || tournament.name} - जिल्हा संघ छाननी
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        एकूण प्राप्त झालेले जिल्हा संघ: <strong>{entries.length}</strong> जिल्हे | ठिकाण: {tournament.venue}
                    </p>
                </div>

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
                                    className="rounded-[32px] bg-white border border-[#CAC4D0]/60 p-6 shadow-sm space-y-4"
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
                                                    कोड: {district?.code || "N/A"} • सबमिट तारीख:{" "}
                                                    {new Date(entry.submitted_at).toLocaleDateString("en-GB")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{playerIds.length} खेळाडू सादर</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Officials */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-[#F3EDF7]/50 border border-[#CAC4D0]/40 text-xs">
                                        <div>
                                            प्रशिक्षक (Coach): <strong>{entry.coach_name}</strong> (मो.: {entry.coach_mobile})
                                        </div>
                                        <div>
                                            व्यवस्थापक (Manager): <strong>{entry.manager_name || "N/A"}</strong>{" "}
                                            {entry.manager_mobile ? `(मो.: ${entry.manager_mobile})` : ""}
                                        </div>
                                    </div>

                                    {/* Players Table */}
                                    <div className="overflow-x-auto border border-[#CAC4D0]/50 rounded-2xl">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-[#EADDFF]/40 border-b border-[#CAC4D0]/50 text-[11px] font-bold text-[#21005D]">
                                                    <th className="py-2.5 px-3 text-center w-12">क्र.</th>
                                                    <th className="py-2.5 px-4">खेळाडूचे नाव</th>
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
                                                        <tr key={pId} className="hover:bg-purple-50/20">
                                                            <td className="py-2.5 px-3 text-center font-medium text-[#79747E]">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="py-2.5 px-4 font-bold text-[#1C1B1F]">
                                                                {fullName}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-[#6750A4]">
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
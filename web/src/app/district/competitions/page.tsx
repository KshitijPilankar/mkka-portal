import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';
import {
    Trophy,
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    ShieldAlert,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DistrictCompetitionsPage() {
    const cookieStore = await cookies();
    const sessionCookie =
        cookieStore.get('mkka_district_session')?.value ||
        cookieStore.get('mkka_district_auth')?.value ||
        cookieStore.get('district_session')?.value;

    const supabase = await createServerSupabase();

    let currentDistrict: any = null;
    if (sessionCookie) {
        try {
            const parsed = JSON.parse(sessionCookie);
            const distId = parsed.districtId || parsed.id;
            if (distId) {
                const { data } = await supabase
                    .from('districts')
                    .select('*')
                    .eq('id', distId)
                    .maybeSingle();
                currentDistrict = data;
            } else if (parsed.code) {
                const { data } = await supabase
                    .from('districts')
                    .select('*')
                    .eq('code', parsed.code)
                    .maybeSingle();
                currentDistrict = data;
            }
        } catch {
            const { data } = await supabase
                .from('districts')
                .select('*')
                .eq('code', sessionCookie)
                .maybeSingle();
            currentDistrict = data;
        }
    }

    if (!currentDistrict) {
        const { data: defaultDist } = await supabase
            .from('districts')
            .select('*')
            .eq('code', 'MUM')
            .maybeSingle();
        currentDistrict = defaultDist;
    }

    const { data: tournaments } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

    const [entriesRes, squadsRes] = await Promise.all([
        supabase
            .from('tournament_entries')
            .select('tournament_id')
            .eq('district_id', currentDistrict?.id),
        supabase
            .from('tournament_squads')
            .select('tournament_id')
            .eq('district_id', currentDistrict?.id),
    ]);

    const submittedSet = new Set<string>();
    (entriesRes.data || []).forEach((e: any) => submittedSet.add(e.tournament_id));
    (squadsRes.data || []).forEach((s: any) => submittedSet.add(s.tournament_id));

    return (
        <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
            <div>
                <Link
                    href="/district/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> जिल्हा नियंत्रण कक्ष (Back to Dashboard)
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                        <Trophy className="w-5 h-5 text-[#6750A4]" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#1C1B1F]">
                            राज्य अजिंक्यपद स्पर्धा व अधिकृत संघ नोंदणी
                        </h1>
                        <p className="text-xs text-[#49454F]">
                            {currentDistrict?.name_mr || 'मुंबई शहर'} ({currentDistrict?.code || 'MUM'}) जिल्हा खो-खो संघटना — सक्रिय स्पर्धांमध्ये १२ ते १५ खेळाडूंचा अधिकृत संघ निवडा व सादर करा.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(tournaments || []).map((t: any) => {
                    const title =
                        t.name_mr ||
                        t.title ||
                        t.name ||
                        t.name_en ||
                        t.tournament_name ||
                        'महाराष्ट्र राज्य अजिंक्यपद खो-खो स्पर्धा';

                    const isSubmitted = submittedSet.has(t.id);

                    const cat = (t.category || t.age_group || '').toUpperCase();
                    const categoryLabel =
                        cat.includes('SUB_JUNIOR') || cat.includes('U14') || cat.includes('U-14')
                            ? 'Sub-Junior / सब-ज्युनियर'
                            : cat.includes('JUNIOR') || cat.includes('U18') || cat.includes('U-18')
                                ? 'Junior / ज्युनियर गट'
                                : t.age_group || t.category || 'Senior / वरिष्ठ गट';

                    const venue = t.venue_ground || t.venue || t.location || 'शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे';
                    const deadline = t.registration_deadline || t.entry_deadline || '१० नोव्हेंबर २०२६';
                    const startDate = t.start_date || '१५ नोव्हेंबर २०२६';
                    const endDate = t.end_date || '१८ नोव्हेंबर २०२६';

                    // Dynamic DOB Range or Cut-off string
                    const dobLimitString =
                        t.min_dob && t.max_dob
                            ? `${t.min_dob} ते ${t.max_dob}`
                            : t.min_dob
                                ? `${t.min_dob} नंतर जन्मलेले`
                                : t.dob_cutoff
                                    ? `कट-ऑफ: ${t.dob_cutoff}`
                                    : null;

                    return (
                        <div
                            key={t.id}
                            className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-[#F3EDF7] text-[#6750A4] text-[10px] font-bold">
                                        {categoryLabel}
                                    </span>

                                    {isSubmitted ? (
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>संघ सबमिट केला (Submitted)</span>
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            <span>नोंदणी खुली (Open)</span>
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-base sm:text-lg font-bold text-[#1C1B1F] leading-snug">
                                    {title}
                                </h2>

                                <div className="space-y-2 text-xs text-[#49454F]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-[#79747E] shrink-0 mt-0.5" />
                                        <span>{venue}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#79747E] shrink-0" />
                                        <span>
                                            स्पर्धा दिनांक: <strong className="font-mono text-[#1C1B1F]">{startDate}</strong> ते{' '}
                                            <strong className="font-mono text-[#1C1B1F]">{endDate}</strong>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-rose-700 font-medium">
                                        <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                                        <span>संघ सादर करण्याची अंतिम मुदत: {deadline}</span>
                                    </div>

                                    {dobLimitString && (
                                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 font-mono">
                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                            <span>DOB मर्यादा: {dobLimitString}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    href={`/district/competitions/${t.id}`}
                                    className={`w-full h-11 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${isSubmitted
                                            ? 'bg-[#F3EDF7] text-[#21005D] border border-[#CAC4D0]/60 hover:bg-[#EADDFF]'
                                            : 'bg-[#6750A4] text-white hover:bg-[#6750A4]/90 active:scale-95'
                                        }`}
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>
                                        {isSubmitted ? 'निवडलेला संघ पहा व सुधारा' : '१२-१५ खेळाडूंचा संघ निवडा'}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

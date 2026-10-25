import { Suspense } from 'react';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import RosterClient from './RosterClient';

export const metadata = {
    title: 'मान्यताप्राप्त खेळाडू व पंच नोंदवही | MKKA Master Roster',
    description: 'Official Directory of Approved Players and Referees of Maharashtra Kho-Kho Association',
};

async function RosterDataContainer() {
    const supabase = await createServerSupabase();

    // Fetch approved players and referees in parallel
    const [
        { data: players },
        { data: referees },
        { data: districts }
    ] = await Promise.all([
        supabase
            .from('players')
            .select(`
        id,
        player_id_number,
        first_name,
        middle_name,
        surname,
        aadhar_no,
        mobile_no,
        gender,
        dob,
        approved_at,
        photo_path,
        playing_district:districts!players_playing_district_id_fkey (
          name_en,
          name_mr,
          code
        )
      `)
            .eq('status', 'APPROVED')
            .order('approved_at', { ascending: false }),

        supabase
            .from('referees')
            .select(`
        id,
        referee_id_number,
        first_name,
        middle_name,
        surname,
        mobile_no,
        gender,
        referee_grade,
        experience_years,
        approved_at,
        photo_path,
        affiliated_district:districts!referees_affiliated_district_id_fkey (
          name_en,
          name_mr,
          code
        )
      `)
            .eq('status', 'APPROVED')
            .order('approved_at', { ascending: false }),

        supabase
            .from('districts')
            .select('id, name_en, name_mr, code')
            .order('name_mr')
    ]);

    return (
        <RosterClient
            initialPlayers={players || []}
            initialReferees={referees || []}
            districts={districts || []}
        />
    );
}

export default function MasterRosterPage() {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-6 md:p-10 space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F3EDF7] p-8 rounded-[36px] gap-6 border border-[#CAC4D0]/40">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-bold mb-2">
                            महाराष्ट्र राज्य खो-खो असोसिएशन • अधिकृत नोंदवही २०२६-२७
                        </span>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1B1F]">
                            मान्यताप्राप्त खेळाडू व पंच मास्टर डिरेक्टरी
                        </h1>
                        <p className="text-sm text-[#49454F] mt-1">
                            State Approved Master Directory & Verification Registry
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Link
                            href="/association/dashboard"
                            className="px-5 py-2.5 rounded-full border border-[#CAC4D0] bg-white text-xs font-bold hover:bg-gray-50 transition-all"
                        >
                            ← डॅशबोर्ड (Dashboard)
                        </Link>
                        <Link
                            href="/track"
                            className="px-5 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all"
                        >
                            ओळखपत्र प्रिंट कक्ष (Track)
                        </Link>
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#6750A4]">
                            <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-medium text-sm">नोंदवही लोड होत आहे... / Loading Master Roster...</p>
                        </div>
                    }
                >
                    <RosterDataContainer />
                </Suspense>
            </div>
        </div>
    );
}
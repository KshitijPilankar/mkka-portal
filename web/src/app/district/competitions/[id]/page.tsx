import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { getVerifiedDistrictSession } from '@/lib/auth/district-session';
import SquadSelectionClient from './SquadSelectionClient';

export const dynamic = 'force-dynamic';

export default async function DistrictSquadEntryPage({
    params,
}: {
    params: Promise<{ id: string }> | { id: string };
}) {
    const resolvedParams = await Promise.resolve(params);
    const tournamentId = resolvedParams?.id;

    if (!tournamentId) {
        redirect('/district/competitions');
    }

    const session = await getVerifiedDistrictSession();
    const supabase = await createServerSupabase();

    // 1. Resolve logged in district securely
    let currentDistrict: any = null;
    if (session?.districtId) {
        const { data } = await supabase
            .from('districts')
            .select('*')
            .eq('id', session.districtId)
            .maybeSingle();
        currentDistrict = data;
    }

    // Fallback to Mumbai City if testing directly
    if (!currentDistrict) {
        const { data: defaultDist } = await supabase
            .from('districts')
            .select('*')
            .eq('code', 'MUM')
            .maybeSingle();
        currentDistrict = defaultDist;
    }

    // 2. Fetch Tournament details
    const { data: tournament, error: tourError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .maybeSingle();

    if (tourError || !tournament) {
        redirect('/district/competitions');
    }

    // 3. Fetch approved players for this district
    let playersData: any[] = [];
    if (currentDistrict?.id) {
        const { data } = await supabase
            .from('players')
            .select('id, first_name, middle_name, surname, dob, gender, mobile_no, player_id_number, status')
            .eq('playing_district_id', currentDistrict.id)
            .eq('status', 'APPROVED')
            .order('first_name', { ascending: true });
        playersData = data || [];
    }

    // 4. Fetch existing squad submission if already submitted
    let existingSquad = null;
    if (currentDistrict?.id) {
        const [squadRes, entryRes] = await Promise.all([
            supabase
                .from('tournament_squads')
                .select(`
            id,
            coach_name,
            manager_name,
            tournament_squad_players (
              player_id
            )
          `)
                .eq('tournament_id', tournamentId)
                .eq('district_id', currentDistrict.id)
                .maybeSingle(),
            supabase
                .from('tournament_entries')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('district_id', currentDistrict.id)
                .maybeSingle(),
        ]);

        if (entryRes.data) {
            existingSquad = {
                player_ids: entryRes.data.player_ids || [],
                coach_name: entryRes.data.coach_name || '',
                coach_mobile: entryRes.data.coach_mobile || '',
                manager_name: entryRes.data.manager_name || '',
                manager_mobile: entryRes.data.manager_mobile || '',
            };
        } else if (squadRes.data) {
            existingSquad = {
                player_ids: (squadRes.data.tournament_squad_players || []).map((p: any) => p.player_id),
                coach_name: squadRes.data.coach_name || '',
                coach_mobile: '',
                manager_name: squadRes.data.manager_name || '',
                manager_mobile: '',
            };
        }
    }

    return (
        <div className="min-h-screen bg-[#FFFBFE] py-6 px-4 sm:px-6 lg:px-8">
            <SquadSelectionClient
                tournament={tournament}
                players={playersData || []}
                districtCode={currentDistrict?.code || 'MUM'}
                districtName={currentDistrict?.name_mr || 'मुंबई शहर'}
                existingSquad={existingSquad}
            />
        </div>
    );
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import SquadSelectorClient from './SquadSelectorClient';

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'अधिकृत जिल्हा संघ नोंदणी | MKKA Squad Entry',
};

async function SquadEntryContainer({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createServerSupabase();

    const [tournamentRes, districtsRes] = await Promise.all([
        supabase
            .from('tournaments')
            .select('id, name_mr, name_en, category')
            .eq('id', id)
            .single(),
        supabase
            .from('districts')
            .select('id, name_mr, name_en, code')
            .order('name_mr', { ascending: true }),
    ]);

    if (tournamentRes.error || !tournamentRes.data) {
        notFound();
    }

    return (
        <SquadSelectorClient
            tournament={tournamentRes.data}
            districts={districtsRes.data || []}
        />
    );
}

export default function SquadEntryPage({ params }: Props) {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Suspense
                    fallback={
                        <div className="min-h-[50vh] flex flex-col items-center justify-center text-[#6750A4]">
                            <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-bold text-sm">खेळाडू यादी लोड होत आहे...</p>
                        </div>
                    }
                >
                    <SquadEntryContainer params={params} />
                </Suspense>
            </div>
        </div>
    );
}
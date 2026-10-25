import { Suspense } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import PlayerFormClient from './PlayerFormClient';

export const metadata = {
    title: 'खेळाडू नोंदणी | Maharashtra Kho-Kho Association',
    description: 'Official State Player Membership Registration Portal 2026-27',
};

// Async Data Component
async function PlayerRegistrationContainer() {
    const supabase = await createServerSupabase();
    const { data: districts } = await supabase
        .from('districts')
        .select('id, name_en, name_mr, code')
        .order('name_en');

    return <PlayerFormClient districts={districts || []} />;
}

// Main Page with Suspense Boundary
export default function PlayerRegistrationPage() {
    return (
        <div className="min-h-screen bg-[#FFFBFE] py-10 px-4 md:px-8">
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#6750A4]">
                        <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-medium text-sm leading-relaxed">
                            फॉर्म लोड होत आहे... / Loading Registration Form...
                        </p>
                    </div>
                }
            >
                <PlayerRegistrationContainer />
            </Suspense>
        </div>
    );
}
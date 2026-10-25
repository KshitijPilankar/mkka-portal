import { Suspense } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import RefereeFormClient from './RefereeFormClient';

export const metadata = {
    title: 'अधिकृत पंच नोंदणी | Maharashtra Kho-Kho Association',
    description: 'Official State Referee & Technical Official Registration 2026-27',
};

async function RefereeFormContainer() {
    const supabase = await createServerSupabase();
    const { data: districts } = await supabase
        .from('districts')
        .select('id, name_en, name_mr, code')
        .order('name_en');

    return <RefereeFormClient districts={districts || []} />;
}

export default function RefereeRegisterPage() {
    return (
        <div className="min-h-screen bg-[#FFFBFE] py-10 px-4 md:px-8">
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#8B5000]">
                        <div className="w-10 h-10 border-4 border-[#8B5000] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-medium text-sm">पंच नोंदणी फॉर्म लोड होत आहे...</p>
                    </div>
                }
            >
                <RefereeFormContainer />
            </Suspense>
        </div>
    );
}
import { Suspense } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import RefereeApprovalClient from './RefereeApprovalClient';

export const metadata = {
    title: 'पंच नोंदणी छाननी कक्ष | MKKA Admin',
    description: 'Maharashtra Kho-Kho Association Referee Verification Portal',
};

async function RefereeApprovalsContainer() {
    const supabase = await createServerSupabase();

    const { data: pendingReferees } = await supabase
        .from('referees')
        .select(`
      id,
      first_name,
      middle_name,
      surname,
      aadhar_no,
      mobile_no,
      email,
      gender,
      dob,
      referee_grade,
      exam_year,
      experience_years,
      photo_path,
      id_proof_path,
      certificate_path,
      status,
      created_at,
      affiliated_district:districts!referees_affiliated_district_id_fkey (
        name_en,
        name_mr,
        code
      )
    `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    return <RefereeApprovalClient initialReferees={pendingReferees || []} />;
}

export default function RefereeApprovalsPage() {
    return (
        <div className="min-h-screen bg-[#FFFBF8] p-6 md:p-10">
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#8B5000]">
                        <div className="w-10 h-10 border-4 border-[#8B5000] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-medium text-sm">पंच अर्ज लोड होत आहेत...</p>
                    </div>
                }
            >
                <RefereeApprovalsContainer />
            </Suspense>
        </div>
    );
}
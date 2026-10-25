import { Suspense } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import ApprovalClient from './ApprovalClient';

export const metadata = {
    title: 'खेळाडू अर्ज छाननी व मंजुरी | MKKA Admin',
    description: 'Maharashtra Kho-Kho Association Player Scrutiny & Approval Portal',
};

async function ApprovalsDataContainer() {
    const supabase = await createServerSupabase();

    // Fetch pending player applications with district details
    const { data: pendingPlayers } = await supabase
        .from('players')
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
      full_address,
      pincode,
      photo_path,
      address_proof_path,
      id_proof_path,
      dob_proof_path,
      status,
      created_at,
      playing_district:districts!players_playing_district_id_fkey (
        name_en,
        name_mr,
        code
      )
    `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    return <ApprovalClient initialPlayers={pendingPlayers || []} />;
}

export default function ApprovalsPage() {
    return (
        <div className="min-h-screen bg-[#FDF8FD] p-6 md:p-10">
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#6750A4]">
                        <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-medium text-sm">अर्ज लोड होत आहेत... / Loading Applications...</p>
                    </div>
                }
            >
                <ApprovalsDataContainer />
            </Suspense>
        </div>
    );
}
import { Suspense } from 'react';
import Link from 'next/link';
import { getTournamentsAction } from '@/app/actions/tournament-actions';
import { createServerSupabase } from '@/lib/supabase/server';
import CreateTournamentModal from './CreateTournamentModal';
import DeleteTournamentModal from './DeleteTournamentModal';

export const metadata = {
    title: 'अधिकृत राज्य स्पर्धा व अजिंक्यपद | MKKA Tournaments 2026-27',
    description: 'Maharashtra Kho-Kho Association Official Tournaments and District Registration Portal',
};

async function TournamentsList() {
    const supabase = await createServerSupabase();
    const [tournamentsRes, districtsRes] = await Promise.all([
        getTournamentsAction(),
        supabase
            .from('districts')
            .select('id, name_mr, name_en, code')
            .order('name_mr', { ascending: true }),
    ]);

    const tournaments = tournamentsRes.tournaments || [];
    const districts = districtsRes.data || [];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header Banner with Actions */}
            <div className="bg-[#F3EDF7] p-8 rounded-[36px] border border-[#CAC4D0]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6750A4] bg-white px-3 py-1 rounded-full border">
                        महाराष्ट्र राज्य खो-खो असोसिएशन • राज्य अजिंक्यपद सत्र २०२६-२७
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1C1B1F] mt-2">
                        अधिकृत स्पर्धा व अजिंक्यपद वेळापत्रक
                    </h1>
                    <p className="text-xs text-gray-600 mt-1">
                        Official State Tournaments & District Squad Registration Portal
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Link
                        href="/"
                        className="px-5 py-2.5 rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50 shadow-sm transition-all"
                    >
                        मुख्य पोर्टल (Home)
                    </Link>

                    {/* Admin Tournament Host Trigger */}
                    <CreateTournamentModal districts={districts} />
                </div>
            </div>

            {/* Tournaments Grid */}
            {tournaments.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-gray-300 p-12 text-center text-xs text-gray-400 space-y-3">
                    <p className="font-bold text-base text-gray-700">अद्याप कोणतीही स्पर्धा आयोजित केलेली नाही.</p>
                    <p>नवीन स्पर्धा सुरू करण्यासाठी वरील <strong>"+ नवीन स्पर्धा आयोजित करा"</strong> बटणावर क्लिक करा.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tournaments.map((t: any) => (
                        <div
                            key={t.id}
                            className="bg-white rounded-[32px] border border-[#CAC4D0]/60 p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-sm hover:border-[#6750A4] transition-all relative"
                        >
                            <div className="space-y-3">
                                {/* Top Status & Delete Bar */}
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-full font-bold border ${t.status === 'ACTIVE'
                                                ? 'bg-green-50 text-green-800 border-green-200'
                                                : 'bg-purple-50 text-[#6750A4] border-purple-200'
                                                }`}
                                        >
                                            ● {t.status === 'ACTIVE' ? 'नोंदणी सुरू (REGISTRATION OPEN)' : 'आगामी स्पर्धा (UPCOMING)'}
                                        </span>
                                        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full border">
                                            {t.category === 'SENIOR'
                                                ? 'वरिष्ठ गट'
                                                : t.category === 'SUB_JUNIOR'
                                                    ? 'सब-ज्युनिअर'
                                                    : 'ज्युनिअर'}
                                        </span>
                                    </div>

                                    {/* Secure 2FA Delete Trigger */}
                                    <DeleteTournamentModal
                                        tournamentId={t.id}
                                        tournamentName={t.name_mr || t.name_en}
                                    />
                                </div>

                                <h2 className="text-lg md:text-xl font-black text-gray-900 leading-snug">
                                    {t.name_mr}
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">{t.name_en}</p>

                                {/* Metadata Details with Registration Deadline */}
                                <div className="pt-3 border-t border-gray-100 text-xs text-gray-700 space-y-2">
                                    <div>
                                        📅 <span className="text-gray-500">स्पर्धा कालावधी: </span>
                                        <strong className="text-gray-900">
                                            {new Date(t.start_date).toLocaleDateString('en-IN')} ते{' '}
                                            {new Date(t.end_date).toLocaleDateString('en-IN')}
                                        </strong>
                                    </div>

                                    {t.registration_deadline ? (
                                        <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-200 w-fit">
                                            <span>⏳</span>
                                            <span className="font-semibold">नोंदणी अंतिम मुदत:</span>
                                            <strong className="font-mono font-bold">
                                                {new Date(t.registration_deadline).toLocaleDateString('en-IN')}
                                            </strong>
                                        </div>
                                    ) : (
                                        <div>
                                            ⏳ <span className="text-gray-500">नोंदणी अंतिम मुदत: </span>
                                            <span className="text-gray-400 font-medium">खुली (Open)</span>
                                        </div>
                                    )}

                                    <div>
                                        📍 <span className="text-gray-500">यजमान जिल्हा व मैदान: </span>
                                        <strong className="text-gray-900">
                                            {t.venue_district?.name_mr} • {t.venue_ground}
                                        </strong>
                                    </div>

                                    <div>
                                        👥 <span className="text-gray-500">संघ निकष: </span>
                                        <strong>किमान १२ - कमाल १५ खेळाडू</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link
                                    href={`/tournaments/${t.id}`}
                                    className="text-center py-2.5 rounded-full border border-[#6750A4] text-[#6750A4] text-xs font-bold hover:bg-purple-50 transition-all"
                                >
                                    स्पर्धा केंद्र व दाखल संघ
                                </Link>
                                <Link
                                    href={`/tournaments/${t.id}/squad-entry`}
                                    className="text-center py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all shadow-sm"
                                >
                                    संघ दाखल करा →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TournamentsPage() {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-4 md:p-8">
            <Suspense
                fallback={
                    <div className="min-h-[50vh] flex flex-col items-center justify-center text-[#6750A4]">
                        <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold text-sm">स्पर्धा यादी लोड होत आहे...</p>
                    </div>
                }
            >
                <TournamentsList />
            </Suspense>
        </div>
    );
}
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTournamentOverviewAction } from '@/app/actions/squad-actions';
import { getTournamentMatchesAction } from '@/app/actions/match-actions';
import { getTournamentPoolStandingsAction } from '@/app/actions/standings-actions';
import ScheduleMatchModal from './ScheduleMatchModal';
import KnockoutBracket from './KnockoutBracket';
import TournamentAwardsCard from './TournamentAwardsCard';

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'स्पर्धा केंद्र व वेळापत्रक | MKKA Tournament Hub',
    description: 'Official Tournament Details, Match Fixtures, Knockout Tree, Awards, Accreditation & Pool Standings',
};

async function TournamentOverviewContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [overviewRes, matchesRes, standingsRes] = await Promise.all([
        getTournamentOverviewAction(id),
        getTournamentMatchesAction(id),
        getTournamentPoolStandingsAction(id),
    ]);

    if (!overviewRes.success || !overviewRes.tournament) {
        notFound();
    }

    const { tournament, squads } = overviewRes;
    const matches = matchesRes.matches || [];
    const standings = standingsRes.standings || [];

    const participatingDistricts = squads.map((s: any) => s.district).filter(Boolean);

    return (
        <div className="space-y-8">
            {/* Top Banner */}
            <div className="bg-[#F3EDF7] p-8 rounded-[36px] border border-[#CAC4D0]/40 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-bold">
                        {tournament.category === 'SENIOR'
                            ? 'वरिष्ठ राज्य अजिंक्यपद २०२६-२७'
                            : tournament.category === 'SUB_JUNIOR'
                                ? 'सब-ज्युनिअर अजिंक्यपद २०२६'
                                : 'ज्युनिअर अजिंक्यपद २०२६'}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                        ● नोंदणी सुरू (ACTIVE)
                    </span>
                </div>

                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1C1B1F]">
                        {tournament.name_mr}
                    </h1>
                    <p className="text-sm font-medium text-[#49454F] mt-1">{tournament.name_en}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#CAC4D0]/40 text-xs text-[#49454F]">
                    <div>
                        <span className="text-gray-500 block">📅 स्पर्धा कालावधी:</span>
                        <strong className="text-gray-900 text-sm">
                            {new Date(tournament.start_date).toLocaleDateString('en-IN')} ते{' '}
                            {new Date(tournament.end_date).toLocaleDateString('en-IN')}
                        </strong>
                    </div>
                    <div>
                        <span className="text-gray-500 block">📍 यजमान मैदान:</span>
                        <strong className="text-gray-900 text-sm">
                            {tournament.venue_ground}, {tournament.venue_district?.name_mr}
                        </strong>
                    </div>
                    <div>
                        <span className="text-gray-500 block">👥 एकूण दाखल संघ:</span>
                        <strong className="text-gray-900 text-sm font-mono text-[#6750A4]">
                            {squads.length} / ३६ जिल्हे
                        </strong>
                    </div>
                </div>

                <div className="pt-2 flex gap-3 flex-wrap">
                    <Link
                        href={`/tournaments/${tournament.id}/squad-entry`}
                        className="px-6 py-3 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all shadow-sm"
                    >
                        + नवीन जिल्हा संघ दाखल करा (Enter Squad)
                    </Link>

                    <Link
                        href={`/tournaments/${tournament.id}/id-cards`}
                        target="_blank"
                        className="px-6 py-3 rounded-full bg-white border border-[#6750A4] text-[#6750A4] text-xs font-bold hover:bg-[#6750A4]/10 transition-all shadow-sm flex items-center gap-2"
                    >
                        🪪 खेळाडू ओळखपत्रे (Accreditation Cards) →
                    </Link>

                    <Link
                        href={`/tournaments/${tournament.id}/final-report`}
                        target="_blank"
                        className="px-6 py-3 rounded-full bg-white border border-gray-400 text-gray-800 text-xs font-bold hover:bg-gray-100 transition-all shadow-sm flex items-center gap-2"
                    >
                        📄 अधिकृत अंतिम निकाल अहवाल (Final Report) →
                    </Link>

                    <Link
                        href={`/tournaments/${tournament.id}/live`}
                        target="_blank"
                        className="px-6 py-3 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all shadow-sm flex items-center gap-2"
                    >
                        🌐 थेट प्रेक्षक केंद्र (Public Fan View) →
                    </Link>
                </div>
            </div>

            {/* Section 1: Match Fixtures & Schedule */}
            <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-black text-[#1C1B1F]">
                            अधिकृत सामने व वेळापत्रक (Match Fixtures & Schedule)
                        </h2>
                        <p className="text-xs text-gray-500">
                            गटनिहाय सामने, मैदान आणि थेट गुणफलक
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#6750A4] bg-[#EADDFF] px-3.5 py-1.5 rounded-full">
                            {matches.length} सामने नियोजित
                        </span>
                        <ScheduleMatchModal
                            tournamentId={tournament.id}
                            participatingDistricts={participatingDistricts}
                            nextMatchNumber={matches.length + 1}
                        />
                    </div>
                </div>

                {matches.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400 border border-dashed rounded-2xl">
                        अद्याप कोणतेही सामने निश्चित केलेले नाहीत.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((m: any) => (
                            <div
                                key={m.id}
                                className="bg-[#FDF8FD] border border-gray-200 rounded-3xl p-5 hover:border-[#6750A4] transition-all flex flex-col justify-between space-y-4 shadow-sm"
                            >
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-mono font-bold text-[#6750A4] bg-white px-3 py-1 rounded-full border">
                                        सामना क्र. #{m.match_number} • {m.pool}
                                    </span>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${m.status === 'LIVE'
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : m.status === 'COMPLETED'
                                                    ? 'bg-green-700 text-white'
                                                    : 'bg-purple-50 text-purple-800'
                                            }`}
                                    >
                                        {m.status === 'LIVE'
                                            ? 'थेट सुरू (LIVE)'
                                            : m.status === 'COMPLETED'
                                                ? 'पूर्ण (COMPLETED)'
                                                : m.round_type === 'LEAGUE'
                                                    ? 'साखळी सामना (League)'
                                                    : m.round_type === 'QUARTER_FINAL'
                                                        ? 'उपांत्यपूर्व (QF)'
                                                        : m.round_type === 'SEMI_FINAL'
                                                            ? 'उपांत्य (SF)'
                                                            : 'अंतिम सामना (Final)'}
                                    </span>
                                </div>

                                {/* Teams VS Display */}
                                <div className="flex items-center justify-between gap-4 py-3 border-y border-gray-100">
                                    <div className="flex-1 text-center">
                                        <span className="text-[10px] font-mono text-gray-400 uppercase block">
                                            {m.team_a?.code}
                                        </span>
                                        <strong className="text-sm font-extrabold text-gray-900 block truncate">
                                            {m.team_a?.name_mr}
                                        </strong>
                                        <span className="text-2xl font-black font-mono text-[#6750A4] mt-1 block">
                                            {m.team_a_score}
                                        </span>
                                    </div>

                                    <div className="text-xs font-black text-gray-300 px-2">
                                        VS
                                    </div>

                                    <div className="flex-1 text-center">
                                        <span className="text-[10px] font-mono text-gray-400 uppercase block">
                                            {m.team_b?.code}
                                        </span>
                                        <strong className="text-sm font-extrabold text-gray-900 block truncate">
                                            {m.team_b?.name_mr}
                                        </strong>
                                        <span className="text-2xl font-black font-mono text-[#6750A4] mt-1 block">
                                            {m.team_b_score}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[11px] text-gray-500">
                                    <span>📍 {m.court_number}</span>
                                    <span>
                                        ⏰ {new Date(m.scheduled_time).toLocaleDateString('en-IN')} |{' '}
                                        {new Date(m.scheduled_time).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <Link
                                        href={`/tournaments/${tournament.id}/matches/${m.id}`}
                                        className="w-full block text-center py-2.5 rounded-full bg-white border border-[#6750A4] text-[#6750A4] text-xs font-bold hover:bg-[#6750A4]/10 active:scale-95 transition-all shadow-sm"
                                    >
                                        थेट गुण नोंदणी व निकाल (Enter Score & Result) →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: Pool Standings & Points Table */}
            <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h2 className="text-lg font-black text-[#1C1B1F]">
                            गट गुणफलक व क्रमवारी (Pool Standings & Points Table)
                        </h2>
                        <p className="text-xs text-gray-500">
                            साखळी सामन्यांनुसार जिल्ह्यांची गुणतालिका (विजयासाठी २ गुण)
                        </p>
                    </div>
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        थेट अपडेटेड (Live)
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#ECE6F0] text-[#49454F] font-bold uppercase">
                                <th className="py-3 px-4">क्रमांक</th>
                                <th className="py-3 px-4">जिल्हा संघ</th>
                                <th className="py-3 px-4 text-center">गट</th>
                                <th className="py-3 px-4 text-center">सामने (P)</th>
                                <th className="py-3 px-4 text-center">विजय (W)</th>
                                <th className="py-3 px-4 text-center">पराभव (L)</th>
                                <th className="py-3 px-4 text-center">गुण (+ / -)</th>
                                <th className="py-3 px-4 text-center">फरक (Diff)</th>
                                <th className="py-3 px-4 text-center font-black text-[#6750A4]">गुण (PTS)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {standings.map((team: any, idx: number) => (
                                <tr key={team.districtId} className="hover:bg-gray-50">
                                    <td className="py-3.5 px-4 font-mono font-bold text-gray-500">#{idx + 1}</td>
                                    <td className="py-3.5 px-4 font-bold text-gray-900">
                                        {team.districtNameMr}{' '}
                                        <span className="text-[11px] font-mono text-gray-400 font-normal">
                                            ({team.districtCode})
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-semibold">{team.pool}</td>
                                    <td className="py-3.5 px-4 text-center font-mono font-semibold">{team.played}</td>
                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-green-700">
                                        {team.won}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-600">
                                        {team.lost}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                                        {team.scoreFor} / {team.scoreAgainst}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                                        <span className={team.scoreDiff > 0 ? 'text-green-700' : team.scoreDiff < 0 ? 'text-red-600' : 'text-gray-500'}>
                                            {team.scoreDiff > 0 ? `+${team.scoreDiff}` : team.scoreDiff}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-[#6750A4]">
                                        {team.points}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Knockout Bracket Tree */}
            <KnockoutBracket tournamentId={tournament.id} matches={matches} />

            {/* Section 4: Individual Awards & Honors */}
            <TournamentAwardsCard tournament={tournament} squads={squads} />

            {/* Section 5: Registered District Squads */}
            <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h2 className="text-lg font-black text-[#1C1B1F]">
                            दाखल झालेले अधिकृत जिल्हा संघ (Registered District Squads)
                        </h2>
                        <p className="text-xs text-gray-500">
                            स्पर्धेसाठी अंतिम पथक सादर केलेल्या जिल्ह्यांची अधिकृत यादी
                        </p>
                    </div>
                    <span className="text-xs font-bold text-[#6750A4] bg-[#EADDFF] px-3 py-1 rounded-full">
                        {squads.length} जिल्हे सज्ज
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {squads.map((s: any) => (
                        <div
                            key={s.id}
                            className="p-5 rounded-2xl border border-gray-200 bg-[#FDF8FD] flex flex-col justify-between hover:border-[#6750A4] transition-all space-y-4"
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono font-bold text-[#6750A4] bg-white px-2 py-0.5 rounded-md border">
                                        {s.district?.code}
                                    </span>
                                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                        दाखल ✓
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-base text-[#1C1B1F] mt-2">
                                    {s.district?.name_mr}
                                </h3>
                                <p className="text-xs text-gray-500">{s.district?.name_en}</p>

                                <div className="mt-3 text-[11px] text-gray-600 space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                                    <div>
                                        <span className="text-gray-400">प्रशिक्षक:</span> {s.coach_name}
                                    </div>
                                    <div>
                                        <span className="text-gray-400">खेळाडू संख्या:</span>{' '}
                                        <strong>{s.tournament_squad_players?.length || 12} खेळाडू</strong>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/tournaments/${tournament.id}/squad-entry`}
                                className="w-full text-center py-2.5 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] transition-all"
                            >
                                संघ पत्रक पहा / Print Sheet →
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TournamentPage({ params }: Props) {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-6 md:p-10 space-y-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <Link
                        href="/tournaments"
                        className="text-xs font-bold text-[#6750A4] hover:underline"
                    >
                        ← सर्व स्पर्धा यादी (Back to All Tournaments)
                    </Link>
                </div>

                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#6750A4]">
                            <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-medium text-sm">सामने व वेळापत्रक लोड होत आहे...</p>
                        </div>
                    }
                >
                    <TournamentOverviewContent params={params} />
                </Suspense>
            </div>
        </div>
    );
}
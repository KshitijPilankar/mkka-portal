import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getMatchDetailsAction, getMatchScoreLogsAction } from '@/app/actions/match-actions';
import MatchScorerClient from './MatchScorerClient';

interface Props {
    params: Promise<{ id: string; matchId: string }>;
}

export const metadata = {
    title: 'थेट सामना गुण नोंदणी व नियंत्रण कक्ष | MKKA Match Center',
    description: 'Official Match Scoring and Revision Audit Logs',
};

async function MatchScorerContainer({ params }: { params: Promise<{ id: string; matchId: string }> }) {
    const { matchId } = await params;
    const [matchRes, logsRes] = await Promise.all([
        getMatchDetailsAction(matchId),
        getMatchScoreLogsAction(matchId),
    ]);

    if (!matchRes.success || !matchRes.match) {
        notFound();
    }

    return <MatchScorerClient match={matchRes.match} initialLogs={logsRes.logs || []} />;
}

export default function MatchScorerPage({ params }: Props) {
    return (
        <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] p-6 md:p-10 space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#6750A4]">
                            <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-medium text-sm">सामना केंद्र व नोंदणी इतिहास लोड होत आहे...</p>
                        </div>
                    }
                >
                    <MatchScorerContainer params={params} />
                </Suspense>
            </div>
        </div>
    );
}
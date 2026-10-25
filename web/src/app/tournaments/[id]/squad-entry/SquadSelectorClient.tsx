'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    getEligibleDistrictPlayersAction,
    submitTournamentSquadAction,
} from '@/app/actions/squad-actions';
import PaperRosterScannerModal from './PaperRosterScannerModal';

interface DistrictItem {
    id: string;
    name_mr: string;
    name_en: string;
    code: string;
}

interface Props {
    tournament: any;
    districts: DistrictItem[];
}

export default function SquadSelectorClient({ tournament, districts }: Props) {
    const router = useRouter();

    const [selectedDistrictId, setSelectedDistrictId] = useState<string>(districts[0]?.id || '');
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [playerPool, setPlayerPool] = useState<any[]>([]);

    const [coachName, setCoachName] = useState('');
    const [managerName, setManagerName] = useState('');

    // Selected Squad Map: { [playerId]: { jerseyNo: number, role: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER' } }
    const [selectedSquad, setSelectedSquad] = useState<{
        [key: string]: { jerseyNo: number; role: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER' };
    }>({});

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Load players when district changes
    async function loadPlayers() {
        if (!selectedDistrictId) return;
        setLoadingPlayers(true);
        setMessage(null);

        const res = await getEligibleDistrictPlayersAction(
            selectedDistrictId,
            tournament.category,
            tournament.id
        );

        if (res.success) {
            setPlayerPool(res.players);

            if (res.existingSquad) {
                setCoachName(res.existingSquad.coach_name || '');
                setManagerName(res.existingSquad.manager_name || '');

                const preMap: any = {};
                res.existingSquad.tournament_squad_players?.forEach((sp: any) => {
                    preMap[sp.player_id] = {
                        jerseyNo: sp.jersey_no,
                        role: sp.role,
                    };
                });
                setSelectedSquad(preMap);
            } else {
                setCoachName('');
                setManagerName('');
                setSelectedSquad({});
            }
        }
        setLoadingPlayers(false);
    }

    useEffect(() => {
        loadPlayers();
    }, [selectedDistrictId, tournament.id, tournament.category]);

    const selectedCount = Object.keys(selectedSquad).length;

    function handleTogglePlayer(playerId: string) {
        if (selectedSquad[playerId]) {
            const next = { ...selectedSquad };
            delete next[playerId];
            setSelectedSquad(next);
        } else {
            if (selectedCount >= 15) {
                alert('एका संघात जास्तीत जास्त १५ खेळाडू निवडता येतात.');
                return;
            }
            const nextJersey = selectedCount + 1;
            setSelectedSquad({
                ...selectedSquad,
                [playerId]: {
                    jerseyNo: nextJersey,
                    role: selectedCount === 0 ? 'CAPTAIN' : selectedCount === 1 ? 'VICE_CAPTAIN' : 'PLAYER',
                },
            });
        }
    }

    function handleJerseyChange(playerId: string, jersey: number) {
        if (!selectedSquad[playerId]) return;
        setSelectedSquad({
            ...selectedSquad,
            [playerId]: {
                ...selectedSquad[playerId],
                jerseyNo: jersey,
            },
        });
    }

    function handleRoleChange(playerId: string, role: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER') {
        if (!selectedSquad[playerId]) return;
        setSelectedSquad({
            ...selectedSquad,
            [playerId]: {
                ...selectedSquad[playerId],
                role,
            },
        });
    }

    async function handleSubmitSquad(e: React.FormEvent) {
        e.preventDefault();
        if (selectedCount < 12) {
            alert('अधिकृत नियमांनुसार किमान १२ खेळाडू निवडणे आवश्यक आहे.');
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const playersArray = Object.entries(selectedSquad).map(([playerId, info]) => ({
            playerId,
            jerseyNo: Number(info.jerseyNo),
            role: info.role,
        }));

        const res = await submitTournamentSquadAction({
            tournamentId: tournament.id,
            districtId: selectedDistrictId,
            coachName,
            managerName,
            players: playersArray,
        });

        setSubmitting(false);
        if (res.success) {
            setMessage('अधिकृत जिल्हा संघ व खेळाडू यादी यशस्वीरीत्या नोंदवली गेली! ✓');
            setTimeout(() => {
                router.push(`/tournaments/${tournament.id}`);
            }, 1200);
        } else {
            setMessage('त्रुटी: संघ जतन करता आला नाही.');
        }
    }

    const currentDistrictObj = districts.find((d) => d.id === selectedDistrictId);

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex justify-between items-center">
                <Link
                    href={`/tournaments/${tournament.id}`}
                    className="text-xs font-bold text-[#6750A4] hover:underline flex items-center gap-1"
                >
                    ← स्पर्धा केंद्राकडे परत जा (Back to Tournament Hub)
                </Link>
            </div>

            {/* Header Banner */}
            <div className="bg-[#F3EDF7] p-6 md:p-8 rounded-[36px] border border-[#CAC4D0]/40 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6750A4] bg-white px-3 py-1 rounded-full border">
                    {tournament.category === 'SENIOR'
                        ? 'वरिष्ठ गट (Senior Open)'
                        : tournament.category === 'SUB_JUNIOR'
                            ? 'सब-ज्युनिअर (१४ वर्षांखालील)'
                            : 'ज्युनिअर (१८ वर्षांखालील)'}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-[#1C1B1F]">
                    अधिकृत जिल्हा संघ निवड (Select District Squad)
                </h1>
                <p className="text-xs text-gray-600">
                    असोसिएशनच्या डेटाबेसमधील नोंदणीकृत खेळाडू निवडा किंवा कागदावरील यादी थेट AI द्वारे स्कॅन करून आयात करा
                </p>
            </div>

            {message && (
                <div className="p-4 bg-green-100 text-green-900 rounded-2xl text-xs font-bold text-center">
                    {message}
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmitSquad} className="space-y-6">
                <div className="bg-white rounded-[32px] border border-[#CAC4D0]/60 p-6 md:p-8 shadow-sm space-y-6">
                    {/* District Selector & Officials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                जिल्हा निवडा (Select District):
                            </label>
                            <select
                                value={selectedDistrictId}
                                onChange={(e) => setSelectedDistrictId(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FDF8FD] text-xs font-bold outline-none cursor-pointer"
                            >
                                {districts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name_mr} ({d.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                प्रशिक्षक (Coach Name):
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="उदा. सचिन मोरे"
                                value={coachName}
                                onChange={(e) => setCoachName(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FDF8FD] text-xs font-semibold outline-none focus:border-[#6750A4]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                व्यवस्थापक (Manager Name):
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="उदा. राजेश साळवी"
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-[#FDF8FD] text-xs font-semibold outline-none focus:border-[#6750A4]"
                            />
                        </div>
                    </div>

                    {/* Squad Counter Bar + AI Scanner Integration */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-purple-50 rounded-2xl border border-purple-200 gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[#6750A4]">
                                खेळाडू संख्या: <strong>{selectedCount} / १५ निवडले</strong> (किमान १२ आवश्यक)
                            </span>
                            <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedCount >= 12
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                            >
                                {selectedCount >= 12 ? '✓ संघ पात्र (Ready)' : 'अजून खेळाडू निवडा'}
                            </span>
                        </div>

                        {/* AI Document Scanner Trigger Button */}
                        <PaperRosterScannerModal
                            districtId={selectedDistrictId}
                            districtName={currentDistrictObj ? `${currentDistrictObj.name_mr} (${currentDistrictObj.code})` : 'निवडलेला जिल्हा'}
                            onSuccess={() => {
                                loadPlayers();
                            }}
                        />
                    </div>

                    {/* Player Selection Table */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-black text-gray-900">
                            जिल्ह्यातील नोंदणीकृत खेळाडू (Registered Players in District):
                        </h3>

                        {loadingPlayers ? (
                            <div className="py-12 text-center text-xs text-[#6750A4] font-bold">
                                खेळाडू लोड होत आहेत...
                            </div>
                        ) : playerPool.length === 0 ? (
                            <div className="py-10 text-center text-xs text-gray-400 border border-dashed rounded-2xl space-y-2">
                                <p>या जिल्ह्यासाठी कोणतेही मान्यताप्राप्त (APPROVED) खेळाडू उपलब्ध नाहीत.</p>
                                <p className="text-[11px] text-gray-500">
                                    कागदावर खेळाडूंची यादी असल्यास वर दिलेल्या <strong>"कागदावरील खेळाडू यादी स्कॅन करा"</strong> बटणाचा वापर करा.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700 font-bold border-b">
                                            <th className="p-3 w-10 text-center">निवड</th>
                                            <th className="p-3">खेळाडूचे नाव</th>
                                            <th className="p-3">नोंदणी क्र. (ID)</th>
                                            <th className="p-3 text-center">जन्मदिनांक (वय)</th>
                                            <th className="p-3 text-center">पात्रता स्थिती</th>
                                            <th className="p-3 w-24 text-center">जर्सी क्र.</th>
                                            <th className="p-3 w-36 text-center">भूमिका</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {playerPool.map((p) => {
                                            const isSelected = !!selectedSquad[p.id];
                                            const squadInfo = selectedSquad[p.id];

                                            return (
                                                <tr
                                                    key={p.id}
                                                    className={`hover:bg-gray-50/80 transition-all ${isSelected ? 'bg-purple-50/40' : ''
                                                        }`}
                                                >
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            disabled={!p.isEligible}
                                                            onChange={() => handleTogglePlayer(p.id)}
                                                            className="w-4 h-4 text-[#6750A4] rounded cursor-pointer accent-[#6750A4]"
                                                        />
                                                    </td>
                                                    <td className="p-3 font-bold text-gray-900">
                                                        {p.first_name} {p.middle_name || ''} {p.surname}
                                                    </td>
                                                    <td className="p-3 font-mono text-gray-500 text-[11px]">
                                                        {p.player_id_number || '-'}
                                                    </td>
                                                    <td className="p-3 text-center font-mono">
                                                        {p.dob ? new Date(p.dob).toLocaleDateString('en-IN') : '-'}{' '}
                                                        <span className="text-gray-500 font-sans">({p.age} वर्षे)</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isEligible
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {p.eligibilityNote}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {isSelected ? (
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={99}
                                                                value={squadInfo.jerseyNo}
                                                                onChange={(e) =>
                                                                    handleJerseyChange(p.id, Number(e.target.value))
                                                                }
                                                                className="w-16 h-8 text-center font-mono font-bold border border-gray-300 rounded-lg outline-none bg-white focus:border-[#6750A4]"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300 font-mono">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {isSelected ? (
                                                            <select
                                                                value={squadInfo.role}
                                                                onChange={(e) =>
                                                                    handleRoleChange(p.id, e.target.value as any)
                                                                }
                                                                className="h-8 px-2 text-[11px] font-bold border border-gray-300 rounded-lg bg-white outline-none cursor-pointer"
                                                            >
                                                                <option value="PLAYER">खेळाडू</option>
                                                                <option value="CAPTAIN">कर्णधार (C)</option>
                                                                <option value="VICE_CAPTAIN">उपकर्णधार (VC)</option>
                                                            </select>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Submit Action */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={submitting || selectedCount < 12}
                            className="px-8 py-3 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-md disabled:opacity-40"
                        >
                            {submitting ? 'संघ जतन होत आहे...' : 'अधिकृत संघ नोंदणी करा (Confirm & Save Squad) →'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
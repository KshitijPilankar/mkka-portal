'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getDistrictSquadStatusAction, submitDistrictSquadAction } from '@/app/actions/squad-actions';

interface Props {
    tournament: any;
    districts: any[];
}

interface SelectedPlayer {
    playerId: string;
    fullName: string;
    dob: string;
    jerseyNo: number;
    role: 'CAPTAIN' | 'VICE_CAPTAIN' | 'PLAYER';
}

export default function SquadEntryClient({ tournament, districts }: Props) {
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
    const [existingSquadData, setExistingSquadData] = useState<any | null>(null);

    // Team Officials
    const [coachName, setCoachName] = useState('');
    const [coachContact, setCoachContact] = useState('');
    const [managerName, setManagerName] = useState('');
    const [managerContact, setManagerContact] = useState('');

    // Selected Squad
    const [squad, setSquad] = useState<SelectedPlayer[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // जिल्हा बदलल्यावर स्थिती व खेळाडू तपासणे
    async function handleDistrictChange(districtId: string) {
        setSelectedDistrictId(districtId);
        setSquad([]);
        setErrorMsg(null);
        setExistingSquadData(null);

        if (!districtId) {
            setAvailablePlayers([]);
            return;
        }

        setLoadingStatus(true);
        const res = await getDistrictSquadStatusAction(tournament.id, districtId);
        setLoadingStatus(false);

        if (res.success) {
            if (res.alreadySubmitted) {
                setExistingSquadData(res.squad);
            } else {
                setAvailablePlayers(res.players);
            }
        } else {
            setErrorMsg(res.error || 'तपशील लोड करता आले नाहीत');
        }
    }

    // वय पात्रता तपासणी
    function checkEligibility(dobStr: string): { eligible: boolean; reason?: string } {
        if (!tournament.age_cutoff_date) return { eligible: true };
        const cutoff = new Date(tournament.age_cutoff_date);
        const birth = new Date(dobStr);
        if (birth < cutoff) {
            return { eligible: false, reason: 'वयोमर्यादा ओलांडली (Overage)' };
        }
        return { eligible: true };
    }

    // खेळाडू संघात जोडणे
    function handleAddPlayer(player: any) {
        if (squad.length >= tournament.max_squad_size) {
            alert(`संघात कमाल ${tournament.max_squad_size} खेळाडूच समाविष्ट करता येतात.`);
            return;
        }

        const { eligible, reason } = checkEligibility(player.dob);
        if (!eligible) {
            alert(`हा खेळाडू अपात्र आहे: ${reason}`);
            return;
        }

        const nextJersey = squad.length + 1;
        setSquad((prev) => [
            ...prev,
            {
                playerId: player.id,
                fullName: `${player.first_name} ${player.surname}`,
                dob: player.dob,
                jerseyNo: nextJersey,
                role: 'PLAYER',
            },
        ]);
    }

    function handleRemovePlayer(playerId: string) {
        setSquad((prev) => prev.filter((p) => p.playerId !== playerId));
    }

    function updatePlayerField(playerId: string, field: 'jerseyNo' | 'role', val: any) {
        setSquad((prev) =>
            prev.map((p) => {
                if (p.playerId === playerId) {
                    return { ...p, [field]: val };
                }
                if (field === 'role' && val === 'CAPTAIN' && p.role === 'CAPTAIN') {
                    return { ...p, role: 'PLAYER' };
                }
                return p;
            })
        );
    }

    async function handleSubmitSquad(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        if (!selectedDistrictId) {
            setErrorMsg('कृपया संबंधित जिल्हा निवडा.');
            return;
        }

        if (squad.length < tournament.min_squad_size) {
            setErrorMsg(`संघात किमान ${tournament.min_squad_size} खेळाडू असणे अनिवार्य आहे.`);
            return;
        }

        setSubmitting(true);
        const res = await submitDistrictSquadAction({
            tournamentId: tournament.id,
            districtId: selectedDistrictId,
            coachName,
            coachContact,
            managerName,
            managerContact,
            players: squad.map((p) => ({
                playerId: p.playerId,
                jerseyNo: Number(p.jerseyNo),
                role: p.role,
            })),
        });
        setSubmitting(false);

        if (res.success) {
            setSubmitSuccess('अधिकृत जिल्हा संघ यशस्वीरित्या दाखल झाला आहे!');
            handleDistrictChange(selectedDistrictId);
        } else {
            setErrorMsg(res.error || 'संघ सबमिशन अयशस्वी झाले');
        }
    }

    const selectedDistrictObj = districts.find((d) => d.id === selectedDistrictId);

    return (
        <div className="space-y-6">
            {/* Tournament Info Banner */}
            <div className="bg-[#F3EDF7] p-6 md:p-8 rounded-[32px] border border-[#CAC4D0]/40 space-y-2">
                <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-bold">
                        {tournament.category === 'SENIOR' ? 'वरिष्ठ राज्य अजिंक्यपद' : 'सब-ज्युनिअर अजिंक्यपद'}
                    </span>
                    <span className="text-xs font-semibold text-[#49454F]">
                        किमान {tournament.min_squad_size} ते कमाल {tournament.max_squad_size} खेळाडू
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-[#1C1B1F]">{tournament.name_mr}</h1>
                <p className="text-xs text-[#49454F]">
                    📍 {tournament.venue_district?.name_mr} • {tournament.venue_ground} | 📅{' '}
                    {new Date(tournament.start_date).toLocaleDateString('en-IN')} ते{' '}
                    {new Date(tournament.end_date).toLocaleDateString('en-IN')}
                </p>
            </div>

            {/* District Selector */}
            <div className="bg-white p-6 rounded-[28px] border border-[#CAC4D0]/50 shadow-sm space-y-3">
                <label className="text-sm font-bold text-[#1C1B1F] block">
                    जिल्हा संघटना निवडा (Select District)
                </label>
                <select
                    value={selectedDistrictId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-[#FDF8FD] border border-[#CAC4D0] text-sm outline-none focus:border-[#6750A4]"
                >
                    <option value="">-- जिल्हा निवडा (Select Participating District) --</option>
                    {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name_mr} ({d.name_en})
                        </option>
                    ))}
                </select>
            </div>

            {loadingStatus && (
                <div className="py-8 text-center text-xs font-bold text-[#6750A4]">
                    माहिती तपासत आहे... / Checking District Squad Status...
                </div>
            )}

            {/* VIEW A: IF SQUAD IS ALREADY SUBMITTED (SHOW OFFICIAL LINEUP SHEET) */}
            {existingSquadData && (
                <div className="bg-white rounded-[32px] border-2 border-green-600/40 p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                ✓ संघ अधिकृतपणे दाखल (OFFICIAL SQUAD SUBMITTED)
                            </span>
                            <h2 className="text-xl font-black text-[#1C1B1F] mt-2">
                                {selectedDistrictObj?.name_mr} ({selectedDistrictObj?.name_en}) अधिकृत संघ पत्रक
                            </h2>
                            <p className="text-xs text-gray-500">
                                दाखल दिनांक: {new Date(existingSquadData.created_at).toLocaleDateString('en-IN')}
                            </p>
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all flex items-center gap-2"
                        >
                            🖨️ अधिकृत संघ पत्रक प्रिंट करा (Print Team Sheet)
                        </button>
                    </div>

                    {/* Officials Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F2FA] p-4 rounded-2xl text-xs">
                        <div>
                            <span className="text-gray-500 block">प्रशिक्षक (Coach):</span>
                            <strong className="text-gray-900 text-sm">{existingSquadData.coach_name}</strong>
                            <div className="text-gray-600 font-mono">📱 {existingSquadData.coach_contact}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 block">व्यवस्थापक (Manager):</span>
                            <strong className="text-gray-900 text-sm">{existingSquadData.manager_name}</strong>
                            <div className="text-gray-600 font-mono">📱 {existingSquadData.manager_contact}</div>
                        </div>
                    </div>

                    {/* Squad Players Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#ECE6F0] text-[#49454F] font-bold uppercase">
                                    <th className="py-3 px-4">जर्सी क्र.</th>
                                    <th className="py-3 px-4">खेळाडूचे नाव (Player Name)</th>
                                    <th className="py-3 px-4">MKKA ID</th>
                                    <th className="py-3 px-4">जन्मतारीख</th>
                                    <th className="py-3 px-4">भूमिका</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {existingSquadData.tournament_squad_players?.map((sp: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono font-bold text-base text-[#6750A4]">
                                            #{sp.jersey_no}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            {sp.player?.first_name} {sp.player?.middle_name} {sp.player?.surname}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-gray-600">
                                            {sp.player?.player_id_number}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{sp.player?.dob}</td>
                                        <td className="py-3 px-4">
                                            {sp.role === 'CAPTAIN' ? (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold">
                                                    कर्णधार (C)
                                                </span>
                                            ) : sp.role === 'VICE_CAPTAIN' ? (
                                                <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-bold">
                                                    उपकर्णधार (VC)
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">खेळाडू</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VIEW B: IF SQUAD NOT YET SUBMITTED (SHOW ENTRY FORM) */}
            {!existingSquadData && selectedDistrictId && !loadingStatus && (
                <form onSubmit={handleSubmitSquad} className="space-y-6">
                    {errorMsg && (
                        <div className="p-4 bg-red-100 text-red-800 text-xs font-semibold rounded-2xl">
                            {errorMsg}
                        </div>
                    )}

                    {/* Officials Form */}
                    <div className="bg-white p-6 rounded-[28px] border border-[#CAC4D0]/50 shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-[#1C1B1F]">२. संघ मार्गदर्शक व व्यवस्थापक (Team Officials)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-[#49454F] block mb-1">प्रशिक्षक नाव (Coach Name) *</label>
                                <input
                                    type="text"
                                    required
                                    value={coachName}
                                    onChange={(e) => setCoachName(e.target.value)}
                                    placeholder="उदा. सचिन मोरे"
                                    className="w-full h-11 px-4 rounded-xl border border-[#CAC4D0] text-xs outline-none focus:border-[#6750A4]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#49454F] block mb-1">प्रशिक्षक संपर्क (Coach Mobile) *</label>
                                <input
                                    type="tel"
                                    required
                                    value={coachContact}
                                    onChange={(e) => setCoachContact(e.target.value)}
                                    placeholder="१० अंकी मोबाईल क्र."
                                    className="w-full h-11 px-4 rounded-xl border border-[#CAC4D0] text-xs outline-none focus:border-[#6750A4]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#49454F] block mb-1">व्यवस्थापक नाव (Manager Name) *</label>
                                <input
                                    type="text"
                                    required
                                    value={managerName}
                                    onChange={(e) => setManagerName(e.target.value)}
                                    placeholder="उदा. राजेश साळवी"
                                    className="w-full h-11 px-4 rounded-xl border border-[#CAC4D0] text-xs outline-none focus:border-[#6750A4]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#49454F] block mb-1">व्यवस्थापक संपर्क (Manager Mobile) *</label>
                                <input
                                    type="tel"
                                    required
                                    value={managerContact}
                                    onChange={(e) => setManagerContact(e.target.value)}
                                    placeholder="१० अंकी मोबाईल क्र."
                                    className="w-full h-11 px-4 rounded-xl border border-[#CAC4D0] text-xs outline-none focus:border-[#6750A4]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Squad Players Selection */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-[28px] border border-[#CAC4D0]/50 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-[#1C1B1F]">
                                मान्यताप्राप्त खेळाडू ({availablePlayers.length})
                            </h2>
                            {availablePlayers.length === 0 ? (
                                <p className="text-xs text-gray-500 py-6 text-center">
                                    या जिल्ह्यात कोणतेही मंजूर खेळाडू उपलब्ध नाहीत.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                    {availablePlayers.map((player) => {
                                        const isSelected = squad.some((p) => p.playerId === player.id);
                                        const { eligible, reason } = checkEligibility(player.dob);

                                        return (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-[#FDF8FD] hover:bg-gray-50 text-xs"
                                            >
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {player.first_name} {player.surname}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 font-mono">
                                                        ID: {player.player_id_number} • जन्म: {player.dob}
                                                    </div>
                                                    {!eligible && (
                                                        <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                                                            ✕ {reason}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isSelected || !eligible}
                                                    onClick={() => handleAddPlayer(player)}
                                                    className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all ${isSelected
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            : !eligible
                                                                ? 'bg-red-50 text-red-400 cursor-not-allowed'
                                                                : 'bg-[#6750A4] text-white hover:bg-[#523e85]'
                                                        }`}
                                                >
                                                    {isSelected ? 'निवडला ✓' : '+ संघात घ्या'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-[28px] border border-[#6750A4]/40 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base font-bold text-[#1C1B1F]">
                                    दाखल केलेला अधिकृत संघ ({squad.length} / {tournament.max_squad_size})
                                </h2>
                                <span className={`text-xs font-bold ${squad.length >= tournament.min_squad_size ? 'text-green-700' : 'text-amber-700'
                                    }`}>
                                    {squad.length < tournament.min_squad_size
                                        ? `किमान आणखी ${tournament.min_squad_size - squad.length} हवेत`
                                        : 'आवश्यक संख्या पूर्ण ✓'}
                                </span>
                            </div>

                            {squad.length === 0 ? (
                                <div className="py-12 text-center text-xs text-gray-400 border border-dashed rounded-2xl">
                                    डाव्या बाजूच्या यादीतून खेळाडू जोडा.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                    {squad.map((p, idx) => (
                                        <div
                                            key={p.playerId}
                                            className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-2xl text-xs"
                                        >
                                            <span className="w-6 text-center font-bold text-gray-500">{idx + 1}.</span>
                                            <div className="flex-1 font-semibold text-gray-900 truncate">
                                                {p.fullName}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-gray-500">जर्सी:</span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={99}
                                                    value={p.jerseyNo}
                                                    onChange={(e) => updatePlayerField(p.playerId, 'jerseyNo', e.target.value)}
                                                    className="w-12 h-7 text-center border rounded-lg font-mono font-bold"
                                                />
                                            </div>

                                            <select
                                                value={p.role}
                                                onChange={(e) => updatePlayerField(p.playerId, 'role', e.target.value)}
                                                className="h-7 px-2 border rounded-lg text-[11px] font-semibold bg-gray-50"
                                            >
                                                <option value="PLAYER">खेळाडू</option>
                                                <option value="CAPTAIN">कर्णधार (C)</option>
                                                <option value="VICE_CAPTAIN">उपकर्णधार (VC)</option>
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => handleRemovePlayer(p.playerId)}
                                                className="text-red-500 hover:text-red-700 font-bold px-2"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || squad.length < tournament.min_squad_size}
                            className="px-8 py-3.5 rounded-full bg-[#6750A4] text-white font-bold text-xs hover:bg-[#523e85] active:scale-95 disabled:opacity-50 transition-all shadow-md"
                        >
                            {submitting ? 'संघ दाखल करत आहे...' : 'अधिकृत जिल्हा संघ दाखल करा (Submit Official Squad) →'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
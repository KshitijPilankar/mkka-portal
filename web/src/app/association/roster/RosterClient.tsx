'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Props {
    initialPlayers: any[];
    initialReferees: any[];
    districts: any[];
}

export default function RosterClient({ initialPlayers, initialReferees, districts }: Props) {
    const [activeTab, setActiveTab] = useState<'PLAYERS' | 'REFEREES'>('PLAYERS');
    const [search, setSearch] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Filtered Players
    const filteredPlayers = useMemo(() => {
        return initialPlayers.filter((p) => {
            const matchSearch =
                `${p.first_name} ${p.surname} ${p.player_id_number || ''} ${p.aadhar_no || ''}`
                    .toLowerCase()
                    .includes(search.toLowerCase());
            const matchDistrict =
                selectedDistrict === 'ALL' || p.playing_district?.code === selectedDistrict;
            return matchSearch && matchDistrict;
        });
    }, [initialPlayers, search, selectedDistrict]);

    // Filtered Referees
    const filteredReferees = useMemo(() => {
        return initialReferees.filter((r) => {
            const matchSearch =
                `${r.first_name} ${r.surname} ${r.referee_id_number || ''} ${r.referee_grade || ''}`
                    .toLowerCase()
                    .includes(search.toLowerCase());
            const matchDistrict =
                selectedDistrict === 'ALL' || r.affiliated_district?.code === selectedDistrict;
            return matchSearch && matchDistrict;
        });
    }, [initialReferees, search, selectedDistrict]);

    // Export to CSV
    const handleExportCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        if (activeTab === 'PLAYERS') {
            csvContent += 'MKKA ID,Full Name,District,Gender,DOB,Mobile,Approved Date\n';
            filteredPlayers.forEach((p) => {
                csvContent += `"${p.player_id_number || ''}","${p.first_name} ${p.surname}","${p.playing_district?.name_mr || ''}","${p.gender}","${p.dob}","${p.mobile_no}","${p.approved_at ? new Date(p.approved_at).toLocaleDateString('en-IN') : ''}"\n`;
            });
        } else {
            csvContent += 'Referee ID,Full Name,District,Grade,Experience,Mobile,Approved Date\n';
            filteredReferees.forEach((r) => {
                csvContent += `"${r.referee_id_number || ''}","${r.first_name} ${r.surname}","${r.affiliated_district?.name_mr || ''}","${r.referee_grade}","${r.experience_years} Years","${r.mobile_no}","${r.approved_at ? new Date(r.approved_at).toLocaleDateString('en-IN') : ''}"\n`;
            });
        }
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `MKKA_${activeTab}_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Controls: Tabs, Search & Filters */}
            <div className="bg-white rounded-[32px] p-6 border border-[#CAC4D0]/50 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Toggle Tabs */}
                <div className="flex bg-[#F3EDF7] p-1.5 rounded-full self-start">
                    <button
                        onClick={() => setActiveTab('PLAYERS')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'PLAYERS'
                                ? 'bg-[#6750A4] text-white shadow-sm'
                                : 'text-[#49454F] hover:text-[#1C1B1F]'
                            }`}
                    >
                        मान्यताप्राप्त खेळाडू ({filteredPlayers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('REFEREES')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'REFEREES'
                                ? 'bg-[#8B5000] text-white shadow-sm'
                                : 'text-[#49454F] hover:text-[#1C1B1F]'
                            }`}
                    >
                        अधिकृत पंच ({filteredReferees.length})
                    </button>
                </div>

                {/* Search & District Dropdown */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="नाव किंवा आयडी शोधा / Search..."
                        className="w-full sm:w-64 h-11 px-4 rounded-full bg-[#FDF8FD] border border-[#CAC4D0] text-xs outline-none focus:border-[#6750A4]"
                    />

                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full sm:w-48 h-11 px-4 rounded-full bg-[#FDF8FD] border border-[#CAC4D0] text-xs outline-none focus:border-[#6750A4]"
                    >
                        <option value="ALL">सर्व जिल्हे (All Districts)</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.code}>
                                {d.name_mr} ({d.code})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleExportCSV}
                        className="w-full sm:w-auto px-5 h-11 rounded-full border border-green-700 text-green-700 hover:bg-green-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                        📥 Excel/CSV Export
                    </button>
                </div>
            </div>

            {/* Roster Table */}
            <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'PLAYERS' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#ECE6F0] text-[#49454F] text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">फोटो</th>
                                    <th className="py-4 px-6">खेळाडूचे नाव (Player Name)</th>
                                    <th className="py-4 px-6">अधिकृत MKKA ID</th>
                                    <th className="py-4 px-6">जिल्हा (District)</th>
                                    <th className="py-4 px-6">लिंग / वय</th>
                                    <th className="py-4 px-6">मान्यता दिनांक</th>
                                    <th className="py-4 px-6 text-center">कृती</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#CAC4D0]/30 text-sm">
                                {filteredPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-[#79747E] text-sm">
                                            कोणतेही खेळाडू आढळले नाहीत.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlayers.map((player) => (
                                        <tr key={player.id} className="hover:bg-[#F7F2FA] transition-colors">
                                            <td className="py-3 px-6">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                                                    {player.photo_path ? (
                                                        <img
                                                            src={`${supabaseUrl}/storage/v1/object/public/player-documents/${player.photo_path}`}
                                                            alt={player.first_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs flex items-center justify-center h-full">👤</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-[#1C1B1F]">
                                                {player.first_name} {player.middle_name} {player.surname}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs font-bold text-[#6750A4]">
                                                {player.player_id_number || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-[#49454F]">
                                                <span className="px-2.5 py-1 bg-[#E8DEF8] text-[#1D192B] rounded-full text-xs font-medium">
                                                    {player.playing_district?.name_mr}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-[#49454F]">
                                                {player.gender === 'MALE' ? 'पुरुष' : 'महिला'} • {player.dob}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-[#49454F]">
                                                {player.approved_at ? new Date(player.approved_at).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Link
                                                    href={`/track?query=${player.player_id_number}`}
                                                    target="_blank"
                                                    className="px-4 py-1.5 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-semibold hover:bg-[#D0BCFF] transition-all inline-block"
                                                >
                                                    कार्ड पहा ↗
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FFF8F2] text-[#554330] text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">फोटो</th>
                                    <th className="py-4 px-6">पंचाचे नाव (Referee Name)</th>
                                    <th className="py-4 px-6">अधिकृत License ID</th>
                                    <th className="py-4 px-6">संलग्न जिल्हा</th>
                                    <th className="py-4 px-6">श्रेणी / अनुभव</th>
                                    <th className="py-4 px-6">मान्यता दिनांक</th>
                                    <th className="py-4 px-6 text-center">कृती</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#CAC4D0]/30 text-sm">
                                {filteredReferees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-[#79747E] text-sm">
                                            कोणतेही पंच आढळले नाहीत.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReferees.map((referee) => (
                                        <tr key={referee.id} className="hover:bg-[#FFFBF8] transition-colors">
                                            <td className="py-3 px-6">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                                                    {referee.photo_path ? (
                                                        <img
                                                            src={`${supabaseUrl}/storage/v1/object/public/player-documents/${referee.photo_path}`}
                                                            alt={referee.first_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs flex items-center justify-center h-full">⚖️</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-[#1C1B1F]">
                                                {referee.first_name} {referee.middle_name} {referee.surname}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs font-bold text-[#8B5000]">
                                                {referee.referee_id_number || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-[#49454F]">
                                                <span className="px-2.5 py-1 bg-[#FFDDB6]/50 text-[#6C3E00] rounded-full text-xs font-medium">
                                                    {referee.affiliated_district?.name_mr}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-[#49454F]">
                                                <strong className="text-[#8B5000]">{referee.referee_grade}</strong> • {referee.experience_years} वर्षे
                                            </td>
                                            <td className="py-4 px-6 text-xs text-[#49454F]">
                                                {referee.approved_at ? new Date(referee.approved_at).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Link
                                                    href={`/track?query=${referee.referee_id_number}`}
                                                    target="_blank"
                                                    className="px-4 py-1.5 rounded-full bg-[#FFDDB6] text-[#6C3E00] text-xs font-semibold hover:bg-[#FFC98B] transition-all inline-block"
                                                >
                                                    लायसन्स पहा ↗
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
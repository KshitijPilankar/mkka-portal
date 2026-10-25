'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournamentAction } from '@/app/actions/tournament-actions';

interface DistrictItem {
    id: string;
    name_mr: string;
    name_en: string;
    code: string;
}

interface Props {
    districts: DistrictItem[];
}

export default function CreateTournamentModal({ districts }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nameMr, setNameMr] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [category, setCategory] = useState<'SENIOR' | 'JUNIOR' | 'SUB_JUNIOR'>('SENIOR');
    const [genderGroup, setGenderGroup] = useState('MEN_AND_WOMEN');
    const [venueDistrictId, setVenueDistrictId] = useState(districts[0]?.id || '');
    const [venueGround, setVenueGround] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await createTournamentAction({
            nameMr,
            nameEn,
            category,
            genderGroup,
            venueDistrictId,
            venueGround,
            startDate,
            endDate,
            registrationDeadline,
        });

        setLoading(false);
        if (res.success && res.tournamentId) {
            setIsOpen(false);
            router.push(`/tournaments/${res.tournamentId}`);
        } else {
            setError(res.error || 'स्पर्धा तयार करता आली नाही.');
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
                <span>🏆</span>
                <span>+ नवीन स्पर्धा आयोजित करा (Host Tournament)</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[32px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
                        <div className="flex justify-between items-start border-b pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-[#6750A4] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                                    MKKA Official Championship Host
                                </span>
                                <h2 className="text-lg md:text-xl font-black text-gray-900 mt-1">
                                    नवीन राज्य अजिंक्यपद स्पर्धा आयोजित करा
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200">
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
                            <div className="space-y-1">
                                <label className="text-gray-700 block">स्पर्धेचे नाव (मराठी):</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="उदा. ६० वी वरिष्ठ गट पुरुष व महिला राज्य अजिंक्यपद खो-खो स्पर्धा २०२६-२७"
                                    value={nameMr}
                                    onChange={(e) => setNameMr(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-[#6750A4]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-gray-700 block">स्पर्धेचे नाव (English):</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 60th Senior State Kho-Kho Championship 2026-27"
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-[#6750A4]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-gray-700 block">गट / प्रवर्ग (Category):</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none bg-white cursor-pointer"
                                    >
                                        <option value="SENIOR">वरिष्ठ गट (Senior Open)</option>
                                        <option value="JUNIOR">ज्युनिअर (१८ वर्षांखालील)</option>
                                        <option value="SUB_JUNIOR">सब-ज्युनिअर (१४ वर्षांखालील)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-gray-700 block">लिंग विभाग (Gender Group):</label>
                                    <select
                                        value={genderGroup}
                                        onChange={(e) => setGenderGroup(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none bg-white cursor-pointer"
                                    >
                                        <option value="MEN_AND_WOMEN">पुरुष व महिला (संयुक्त)</option>
                                        <option value="MEN">फक्त पुरुष (Men / Boys)</option>
                                        <option value="WOMEN">फक्त महिला (Women / Girls)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-gray-700 block">यजमान जिल्हा (Host District):</label>
                                    <select
                                        value={venueDistrictId}
                                        onChange={(e) => setVenueDistrictId(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none bg-white cursor-pointer"
                                    >
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name_mr} ({d.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-gray-700 block">क्रीडांगण / मैदान नाव (Venue Ground):</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="उदा. शिवाजी पार्क, दादर, मुंबई"
                                        value={venueGround}
                                        onChange={(e) => setVenueGround(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-300 outline-none focus:border-[#6750A4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-gray-700 block">नोंदणी अंतिम दिनांक:</label>
                                    <input
                                        type="date"
                                        required
                                        value={registrationDeadline}
                                        onChange={(e) => setRegistrationDeadline(e.target.value)}
                                        className="w-full h-10 px-2 rounded-xl border border-gray-300 outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-gray-700 block">स्पर्धा सुरू दिनांक:</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full h-10 px-2 rounded-xl border border-gray-300 outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-gray-700 block">स्पर्धा समाप्ती दिनांक:</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full h-10 px-2 rounded-xl border border-gray-300 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                                >
                                    रद्द करा
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-full bg-[#6750A4] text-white font-bold hover:bg-[#523e85] active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'तयार होत आहे...' : 'स्पर्धा प्रकाशित करा (Publish Tournament) ✓'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
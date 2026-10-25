'use client';

import React, { useState } from 'react';
import { batchRegisterScannedPlayersAction } from '@/app/actions/register-player';

interface Props {
    districtId: string;
    districtName: string;
    onSuccess: () => void;
}

export default function PaperRosterScannerModal({ districtId, districtName, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scannedPlayers, setScannedPlayers] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setScannedPlayers([]);
            setErrorMessage(null);
        }
    }

    async function handleScanImage() {
        if (!selectedFile) return;
        setScanning(true);
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const res = await fetch('/api/scan-roster', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success && data.players?.length > 0) {
                setScannedPlayers(data.players);
            } else {
                setErrorMessage(data.error || 'यादीमधील खेळाडू ओळखता आले नाहीत. कृपया स्वच्छ फोटो अपलोड करा.');
            }
        } catch (err: any) {
            setErrorMessage('स्कॅनिंग दरम्यान त्रुटी आली. इंटरनेट किंवा API तपासा.');
        }
        setScanning(false);
    }

    function handleEditField(idx: number, field: string, val: string) {
        const updated = [...scannedPlayers];
        updated[idx] = { ...updated[idx], [field]: val };
        setScannedPlayers(updated);
    }

    function handleRemovePlayer(idx: number) {
        setScannedPlayers(scannedPlayers.filter((_, i) => i !== idx));
    }

    async function handleBatchSave() {
        if (scannedPlayers.length === 0) return;
        setSaving(true);
        setErrorMessage(null);

        const res = await batchRegisterScannedPlayersAction({
            districtId,
            players: scannedPlayers,
        });

        setSaving(false);
        if (res.success) {
            alert(`${res.count} खेळाडू यशस्वीरीत्या मान्यताप्राप्त करून नोंदवले गेले! ✓`);
            setIsOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            setScannedPlayers([]);
            onSuccess();
        } else {
            setErrorMessage(res.error || 'नोंदणी सेव्ह करता आली नाही.');
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6750A4] to-[#795EB4] text-white text-xs font-bold hover:shadow-md active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
                <span>📷</span>
                <span>कागदावरील खेळाडू यादी स्कॅन करा (AI Scanner)</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
                        <div className="flex justify-between items-start border-b pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-[#6750A4] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                                    AI Computer Vision Roster Extraction
                                </span>
                                <h2 className="text-lg md:text-xl font-black text-gray-900 mt-1">
                                    कागदावरील किंवा हस्तलिखित खेळाडू यादी स्कॅन करा
                                </h2>
                                <p className="text-xs text-gray-500">
                                    जिल्हा: <strong>{districtName}</strong> • फोटो अपलोड करा, सिस्टम आपोआप सर्व खेळाडूंचा डेटा तयार करेल
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold">
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        {/* Upload Area */}
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-[#CAC4D0] hover:border-[#6750A4] rounded-2xl p-6 text-center bg-[#FDF8FD] transition-all">
                                <input
                                    type="file"
                                    id="roster-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label htmlFor="roster-upload" className="cursor-pointer space-y-2 block">
                                    <div className="text-4xl">📸</div>
                                    <div className="text-xs font-bold text-gray-800">
                                        कागदाचा फोटो निवडा किंवा कॅमेऱ्याने फोटो काढा
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        PNG, JPG किंवा JPEG फाईल (हस्तलिखित किंवा टाईप केलेली यादी)
                                    </p>
                                    <span className="inline-block mt-2 px-4 py-1.5 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold">
                                        + फाईल निवडा (Choose Image)
                                    </span>
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
                                        <div>
                                            <span className="text-xs font-bold text-gray-800 block truncate max-w-xs">
                                                {selectedFile?.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {Math.round((selectedFile?.size || 0) / 1024)} KB
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={scanning}
                                        onClick={handleScanImage}
                                        className="px-5 py-2 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 shadow-md disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {scanning ? '🤖 AI स्कॅन सुरू आहे...' : '⚡ यादी स्कॅन करा (Start AI Scan)'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Extracted Players Table */}
                        {scannedPlayers.length > 0 && (
                            <div className="space-y-3 pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                        ओळखलेले खेळाडू ({scannedPlayers.length} खेळाडू सापडले):
                                    </h3>
                                    <span className="text-[11px] text-gray-500">
                                        माहितीची खात्री करा किंवा गरज असल्यास दुरुस्त करा
                                    </span>
                                </div>

                                <div className="overflow-x-auto border border-gray-200 rounded-2xl max-h-60 overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b">
                                            <tr>
                                                <th className="p-2 w-8 text-center">#</th>
                                                <th className="p-2">प्रथम नाव</th>
                                                <th className="p-2">वडिलांचे नाव</th>
                                                <th className="p-2">आडनाव</th>
                                                <th className="p-2 text-center">जन्मदिनांक (YYYY-MM-DD)</th>
                                                <th className="p-2 text-center">लिंग</th>
                                                <th className="p-2 w-10 text-center">हटवा</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {scannedPlayers.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="p-2 text-center font-mono text-gray-400">{idx + 1}</td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={p.first_name}
                                                            onChange={(e) => handleEditField(idx, 'first_name', e.target.value)}
                                                            className="w-full h-8 px-2 border rounded-md text-xs font-bold outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={p.middle_name}
                                                            onChange={(e) => handleEditField(idx, 'middle_name', e.target.value)}
                                                            className="w-full h-8 px-2 border rounded-md text-xs outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={p.surname}
                                                            onChange={(e) => handleEditField(idx, 'surname', e.target.value)}
                                                            className="w-full h-8 px-2 border rounded-md text-xs font-bold outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <input
                                                            type="text"
                                                            value={p.dob}
                                                            placeholder="2012-05-10"
                                                            onChange={(e) => handleEditField(idx, 'dob', e.target.value)}
                                                            className="w-28 h-8 px-2 text-center font-mono border rounded-md text-xs outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <select
                                                            value={p.gender}
                                                            onChange={(e) => handleEditField(idx, 'gender', e.target.value)}
                                                            className="h-8 px-2 border rounded-md text-xs font-bold outline-none"
                                                        >
                                                            <option value="MALE">MALE</option>
                                                            <option value="FEMALE">FEMALE</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePlayer(idx)}
                                                            className="text-red-500 hover:text-red-700 font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-5 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                        रद्द करा
                                    </button>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleBatchSave}
                                        className="px-6 py-2.5 rounded-full bg-green-700 text-white text-xs font-bold hover:bg-green-800 active:scale-95 shadow-md disabled:opacity-50"
                                    >
                                        {saving ? 'नोंदणी होत आहे...' : `सर्व ${scannedPlayers.length} खेळाडूंची नोंदणी पूर्ण करा ✓`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
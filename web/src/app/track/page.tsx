'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getEntityStatusAction } from '@/app/actions/track-player';

function TrackContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';

    const [query, setQuery] = useState(initialQuery);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ type: 'PLAYER' | 'REFEREE'; data: any } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Auto-search trigger jab URL me ?query= parameter aaye (Roster link se aane par)
    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            executeSearch(initialQuery);
        }
    }, [initialQuery]);

    async function executeSearch(searchTerm: string) {
        if (!searchTerm.trim()) return;

        setLoading(true);
        setErrorMsg(null);
        setResult(null);

        const res = await getEntityStatusAction(searchTerm);
        setLoading(false);

        if (!res.success || !res.data) {
            setErrorMsg(res.error || 'कोणतीही नोंद आढळली नाही');
        } else {
            setResult({ type: res.type as 'PLAYER' | 'REFEREE', data: res.data });
        }
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        executeSearch(query);
    }

    const entity = result?.data;
    const isReferee = result?.type === 'REFEREE';
    const entityId = isReferee ? entity?.referee_id_number : entity?.player_id_number;

    // Verification URL for dynamic QR Code
    const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/track?query=${encodeURIComponent(entityId || '')}`
        : '';

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Search Header Card */}
            <div className="bg-[#F3EDF7] rounded-[36px] p-8 shadow-sm text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-semibold mb-3">
                    महाराष्ट्र राज्य खो-खो असोसिएशन • केंद्रीकृत पडताळणी कक्ष
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1C1B1F] mb-2">
                    अर्ज स्थिती व अधिकृत डिजिटल कार्ड
                </h1>
                <p className="text-sm text-[#49454F] mb-6">
                    Track Status, Verify QR Code & Download Official MKKA Passes
                </p>

                <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        required
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter Tracking ID or MKKA / REF ID"
                        className="flex-1 h-13 px-5 rounded-full bg-white border border-[#CAC4D0] text-sm outline-none focus:border-[#6750A4] focus:ring-2 focus:ring-[#6750A4]/20 shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 rounded-full bg-[#6750A4] text-white font-medium text-sm transition-all hover:bg-[#523e85] active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'शोधत आहे...' : 'शोधा / Search'}
                    </button>
                </form>

                {errorMsg && (
                    <div className="mt-4 p-3 rounded-2xl bg-red-100 text-red-800 text-xs font-semibold">
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Display Card Result */}
            {entity && (
                <div className="bg-white rounded-[36px] border border-[#CAC4D0]/60 p-6 md:p-10 shadow-sm space-y-6">
                    {/* Status Header */}
                    <div className="flex justify-between items-center border-b pb-4">
                        <div>
                            <span className="text-xs text-[#79747E] block">
                                {isReferee ? 'पंच अर्ज स्थिती' : 'खेळाडू अर्ज स्थिती'}
                            </span>
                            <span className={`inline-block mt-1 px-4 py-1 rounded-full text-xs font-bold ${entity.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    entity.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                ● {entity.status === 'APPROVED' ? 'मान्यताप्राप्त अधिकृत नोंदणी (APPROVED)' :
                                    entity.status === 'REJECTED' ? 'नाकारले (REJECTED)' : 'छाननी प्रलंबित (PENDING)'}
                            </span>
                        </div>

                        {entity.status === 'APPROVED' && (
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2 rounded-full border border-[#6750A4] text-[#6750A4] text-xs font-bold hover:bg-[#6750A4]/10 transition-all flex items-center gap-1.5"
                            >
                                🖨️ कार्ड प्रिंट करा (Print Pass)
                            </button>
                        )}
                    </div>

                    {/* Official Digital ID Card with QR */}
                    {entity.status === 'APPROVED' ? (
                        <div className={`border-2 rounded-3xl p-6 relative overflow-hidden shadow-md ${isReferee
                                ? 'border-[#8B5000] bg-gradient-to-br from-[#FFF8F2] via-white to-[#FFDDB6]/30'
                                : 'border-[#6750A4] bg-gradient-to-br from-[#F3EDF7] via-white to-[#EADDFF]/30'
                            }`}>
                            {/* Badge */}
                            <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-4 py-1 rounded-bl-2xl uppercase tracking-wider ${isReferee ? 'bg-[#8B5000]' : 'bg-[#6750A4]'
                                }`}>
                                {isReferee ? 'Official Referee License 2026-27' : 'Official MKKA Player Pass 2026-27'}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                                {/* Photo */}
                                <div className="w-28 h-36 bg-gray-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                                    <img
                                        src={`${supabaseUrl}/storage/v1/object/public/player-documents/${entity.photo_path}`}
                                        alt={entity.first_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 text-center sm:text-left space-y-2">
                                    <h2 className="text-xl font-bold text-[#1C1B1F]">
                                        {entity.first_name} {entity.middle_name} {entity.surname}
                                    </h2>
                                    <p className={`text-xs font-mono font-bold inline-block px-3 py-1 rounded-lg ${isReferee ? 'text-[#8B5000] bg-[#FFDDB6]' : 'text-[#6750A4] bg-[#E8DEF8]'
                                        }`}>
                                        ID: {entityId}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-[#49454F] pt-2">
                                        <div>
                                            <span className="font-semibold block text-[#1C1B1F]">
                                                {isReferee ? 'संलग्न जिल्हा:' : 'खेळणारा जिल्हा:'}
                                            </span>
                                            {entity.district?.name_mr} ({entity.district?.name_en})
                                        </div>
                                        <div>
                                            <span className="font-semibold block text-[#1C1B1F]">
                                                {isReferee ? 'पंच श्रेणी (Grade):' : 'जन्मतारीख:'}
                                            </span>
                                            {isReferee ? entity.referee_grade : entity.dob}
                                        </div>
                                        <div>
                                            <span className="font-semibold block text-[#1C1B1F]">
                                                {isReferee ? 'अनुभव (Experience):' : 'लिंग:'}
                                            </span>
                                            {isReferee ? `${entity.experience_years} वर्षे` : (entity.gender === 'MALE' ? 'पुरुष' : 'महिला')}
                                        </div>
                                        <div>
                                            <span className="font-semibold block text-[#1C1B1F]">मान्यता दिनांक:</span>
                                            {entity.approved_at ? new Date(entity.approved_at).toLocaleDateString('en-IN') : '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Verification QR Code */}
                                <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-gray-200 shadow-sm shrink-0">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(verificationUrl)}`}
                                        alt="Verification QR"
                                        className="w-20 h-20"
                                    />
                                    <span className="text-[9px] font-bold text-[#79747E] mt-1 tracking-wider uppercase">
                                        Scan to Verify
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#CAC4D0]/50 text-center text-[10px] text-[#79747E]">
                                महाराष्ट्र राज्य खो-खो असोसिएशन द्वारे डिजिटल स्वाक्षरीकृत व अधिकृत मान्यताप्राप्त ओळखपत्र.
                            </div>
                        </div>
                    ) : entity.status === 'REJECTED' ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800">
                            <strong>नाकारण्याचे कारण:</strong> {entity.rejection_reason || 'कागदपत्रांची पडताळणी अपूर्ण'}
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                            आपला अर्ज सध्या छाननी कक्षामध्ये तपासणीसाठी प्रलंबित आहे. पडताळणी पूर्ण झाल्यावर अधिकृत कार्ड येथे उपलब्ध होईल.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function TrackApplicationPage() {
    return (
        <div className="min-h-screen bg-[#FDF8FD] py-12 px-4 md:px-8">
            <Suspense
                fallback={
                    <div className="flex justify-center items-center py-20 text-xs font-semibold text-[#6750A4]">
                        लोड होत आहे...
                    </div>
                }
            >
                <TrackContent />
            </Suspense>
        </div>
    );
}
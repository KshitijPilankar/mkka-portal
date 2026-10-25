'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminLoginAction } from '@/app/actions/admin-auth';

export default function AdminLoginPage() {
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('pin', pin);

        const res = await adminLoginAction(formData);
        setLoading(false);

        if (res.success) {
            router.push('/association/dashboard');
            router.refresh();
        } else {
            setError(res.error || 'प्रवेश नाकारला');
        }
    }

    return (
        <div className="min-h-screen bg-[#FDF8FD] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[32px] border border-[#CAC4D0]/60 p-8 shadow-xl space-y-6 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mkka-logo.png" alt="MKKA Logo" className="w-20 h-20 object-contain mx-auto" />

                <div>
                    <span className="text-[10px] font-black uppercase text-[#6750A4] tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        अधिकृत प्रशासकीय प्रवेश (MKKA Admin Auth)
                    </span>
                    <h1 className="text-xl font-black text-gray-900 mt-2">
                        प्रशासकीय नियंत्रण कक्ष (Admin Hub)
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        खेळाडू व पंच छाननी आणि स्पर्धा व्यवस्थापनासाठी अधिकृत सुरक्षा पिन प्रविष्ट करा
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">सुरक्षा ॲडमिन पिन (Admin Security PIN):</label>
                        <input
                            type="password"
                            required
                            placeholder="सुरक्षा पिन टाका (Default: MKKA2026)"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-gray-300 text-sm font-bold tracking-widest outline-none focus:border-[#6750A4] bg-[#FDF8FD]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-full bg-[#6750A4] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#523e85] active:scale-95 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? 'पडताळणी सुरू आहे...' : 'नियंत्रण कक्षात प्रवेश करा (Login) →'}
                    </button>
                </form>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                    <Link href="/" className="text-gray-500 hover:text-gray-800">
                        ← मुख्य पोर्टलकडे परत जा
                    </Link>
                    <span className="text-[11px] font-mono text-gray-400">PIN: MKKA2026</span>
                </div>
            </div>
        </div>
    );
}
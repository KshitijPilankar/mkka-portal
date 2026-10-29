"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Building2,
    Lock,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    Loader2,
    User,
    ArrowLeft,
} from "lucide-react";
import { loginDistrictAction } from "@/app/actions/district-auth";

interface DistrictOption {
    id: string;
    code: string;
    name_en: string;
    name_mr: string;
    username: string;
}

interface DistrictLoginClientProps {
    districts: DistrictOption[];
}

export default function DistrictLoginClient({ districts }: DistrictLoginClientProps) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUsername = e.target.value;
        setUsername(selectedUsername);
        setErrorMsg(null);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username.trim()) {
            setErrorMsg("कृपया तुमचा जिल्हा निवडा किंवा युझरनेम प्रविष्ट करा.");
            return;
        }
        if (!password.trim()) {
            setErrorMsg("कृपया पासवर्ड प्रविष्ट करा.");
            return;
        }

        setErrorMsg(null);

        startTransition(async () => {
            const formData = new FormData();
            formData.append("username", username.trim());
            formData.append("password", password.trim());

            const res = await loginDistrictAction(formData);
            if (res.success) {
                router.push("/district/dashboard");
                router.refresh();
            } else {
                setErrorMsg(res.error || "लॉगिन अयशस्वी झाले.");
            }
        });
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> मुख्य पोर्टल (Back to Home)
                    </Link>
                    <div className="w-16 h-16 rounded-3xl bg-[#EADDFF] flex items-center justify-center text-[#21005D] mx-auto shadow-sm">
                        <Building2 className="w-8 h-8 text-[#6750A4]" />
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#EADDFF]/60 text-[#21005D] text-[11px] font-bold tracking-wider uppercase">
                        अधिकृत जिल्हा प्रवेश (DISTRICT PORTAL AUTH)
                    </span>
                    <h1 className="text-2xl font-extrabold text-[#1C1B1F]">
                        जिल्हा संघटना नियंत्रण कक्ष
                    </h1>
                    <p className="text-xs text-[#49454F]">
                        महाराष्ट्रातील ३६ संलग्न जिल्हा संघटनांसाठी अधिकृत लॉगिन कक्ष
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="p-8 rounded-[36px] bg-white border border-[#CAC4D0]/60 shadow-lg space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Quick District Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1C1B1F]">
                                जिल्हा निवडा (Select Your District):
                            </label>
                            <select
                                onChange={handleDistrictSelect}
                                value={username}
                                className="w-full h-12 px-4 rounded-xl bg-[#F3EDF7]/50 border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            >
                                <option value="">-- ३६ अधिकृत जिल्ह्यांमधून निवडा --</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.username}>
                                        {d.name_mr} ({d.name_en}) [{d.code}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1C1B1F]">
                                जिल्हा युझरनेम (Username)*:
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                                <input
                                    type="text"
                                    placeholder="उदा. dist_mumbai_city"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F3EDF7]/50 border border-[#CAC4D0] font-mono text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1C1B1F]">
                                जिल्हा पासवर्ड (District Password)*:
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79747E]" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F3EDF7]/50 border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-[#79747E]">
                                * डीफॉल्ट पासवर्ड: <strong>mkka@123</strong> (किंवा राज्य असोसिएशनने दिलेला पासवर्ड)
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 rounded-full bg-[#6750A4] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#6750A4]/90 active:scale-95 transition-all disabled:opacity-50 shadow-md"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>प्रमाणीकरण होत आहे...</span>
                                </>
                            ) : (
                                <>
                                    <span>जिल्हा कक्षात प्रवेश करा (LOGIN)</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-[#CAC4D0]/40 text-center">
                        <Link
                            href="/association/login"
                            className="text-[11px] font-semibold text-[#6750A4] hover:underline"
                        >
                            राज्य प्रशासकीय नियंत्रण कक्ष (State Association Login) येथे जा →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/association/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.replace("/association/dashboard");
            } else {
                setError(data.message || "अवैध सुरक्षा पिन! कृपया अचूक पिन प्रविष्ट करा.");
                setIsLoading(false);
            }
        } catch {
            setError("सर्व्हरशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">

                {/* MKKA Official Logo */}
                <div className="flex justify-center">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-purple-200 bg-white p-2 shadow-xs">
                        <Image
                            src="/mkka-logo.png"
                            alt="MKKA Logo"
                            width={72}
                            height={72}
                            className="h-full w-full object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="mt-6 text-center">
                    <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200">
                        अधिकृत प्रशासकीय प्रवेश (MKKA ADMIN AUTH)
                    </span>
                    <h2 className="mt-3 text-xl font-extrabold text-gray-900">
                        प्रशासकीय नियंत्रण कक्ष (Admin Hub)
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                        खेळाडू व पंच छाननी आणि स्पर्धा व्यवस्थापनासाठी अधिकृत सुरक्षा पिन प्रविष्ट करा
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="mt-8 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700">
                            सुरक्षा ॲडमिन पिन (Admin Security PIN):
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="सुरक्षा पिन टाका"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value);
                                setError("");
                            }}
                            className="mt-1.5 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold tracking-wider text-gray-900 focus:border-purple-600 focus:outline-hidden"
                        />
                        {error && (
                            <p className="mt-2 text-xs font-bold text-red-600">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-2xl bg-[#5E428F] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#4C3375] disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? "पडताळणी सुरू आहे..." : "नियंत्रण कक्षात प्रवेश करा (LOGIN) →"}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <Link href="/" className="hover:text-purple-700 font-semibold">
                        ← मुख्य पोर्टलकडे परत जा
                    </Link>
                    <span className="text-gray-400">सुरक्षित सर्व्हर प्रमाणीकरण</span>
                </div>

            </div>
        </div>
    );
}
"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BellRing,
    Upload,
    Download,
    Trash2,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    ExternalLink,
} from "lucide-react";
import { uploadNoticeAction, deleteNoticeAction } from "@/app/actions/association-notices";

interface NoticeItem {
    id: string;
    subject: string;
    attachment_path: string;
    created_at: string;
}

interface NoticeBoardClientProps {
    initialNotices: NoticeItem[];
}

export default function NoticeBoardClient({ initialNotices }: NoticeBoardClientProps) {
    const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
    const [subject, setSubject] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [alertState, setAlertState] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Safe resolver route for Supabase Storage signed downloads
    const getPublicFileUrl = (path: string) => {
        if (!path) return "#";
        return `/api/view-document?path=${encodeURIComponent(path)}`;
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) {
            setAlertState({ type: "error", text: "कृपया सूचनेचा विषय प्रविष्ट करा." });
            return;
        }
        if (!selectedFile) {
            setAlertState({ type: "error", text: "कृपया परिपत्रक फाईल निवडा." });
            return;
        }

        setAlertState(null);

        startTransition(async () => {
            const formData = new FormData();
            formData.append("subject", subject.trim());
            formData.append("file", selectedFile);

            const result = await uploadNoticeAction(formData);

            if (result.success) {
                setAlertState({ type: "success", text: "परिपत्रक यशस्वीरित्या प्रकाशित करण्यात आले!" });
                setSubject("");
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                setAlertState({ type: "error", text: result.error || "परिपत्रक अपलोड करताना त्रुटी आली." });
            }
        });
    };

    const handleDelete = (id: string, path: string) => {
        if (!confirm("तुम्हाला खात्री आहे का हे परिपत्रक हटवायचे आहे? (Confirm Delete)")) return;

        setDeletingId(id);
        startTransition(async () => {
            const result = await deleteNoticeAction(id, path);
            if (result.success) {
                setNotices((prev) => prev.filter((item) => item.id !== id));
                setAlertState({ type: "success", text: "परिपत्रक यशस्वीरित्या हटवण्यात आले." });
            } else {
                setAlertState({ type: "error", text: result.error || "परिपत्रक हटवताना त्रुटी आली." });
            }
            setDeletingId(null);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/association/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6750A4] hover:underline mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> मुख्य नियंत्रण कक्ष (Back to Dashboard)
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1C1B1F] flex items-center gap-2">
                        <BellRing className="w-7 h-7 text-[#6750A4]" />
                        अधिकृत सूचना फलक व्यवस्थापन (Official Notice Board)
                    </h1>
                    <p className="text-xs text-[#49454F] mt-1">
                        राज्य संघटना परिपत्रके, स्पर्धा नियमपुस्तिका व अधिकृत घोषणा अपलोड, डाऊनलोड व नियंत्रित करा.
                    </p>
                </div>
            </div>

            {alertState && (
                <div
                    className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${alertState.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                >
                    {alertState.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{alertState.text}</span>
                </div>
            )}

            {/* Upload Form Card */}
            <div className="rounded-[32px] bg-[#F3EDF7] p-6 border border-[#CAC4D0]/50 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-[#21005D] mb-4">
                    <Upload className="w-4 h-4 text-[#6750A4]" />
                    <span>नवीन परिपत्रक / सूचना अपलोड करा (Upload New Circular)</span>
                </div>

                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6 space-y-1">
                        <label className="text-xs font-medium text-[#1C1B1F]">
                            सूचनेचा विषय (Notice Subject)*:
                        </label>
                        <input
                            type="text"
                            placeholder="उदा. ५९ वी राज्य अजिंक्यपद निवड चाचणी नियम व मार्गदर्शक तत्त्वे"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-white border border-[#CAC4D0] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        />
                    </div>

                    <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-medium text-[#1C1B1F]">
                            परिपत्रक फाईल निवडा (PDF / Image)*:
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full h-11 px-3 py-2 rounded-xl bg-white border border-[#CAC4D0] text-xs text-[#49454F] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-[#EADDFF] file:text-[#21005D] hover:file:bg-[#EADDFF]/80 cursor-pointer"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-11 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>अपलोड होत आहे...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>प्रकाशित करा</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Published Notices Archive Table */}
            <div className="rounded-[28px] bg-white border border-[#CAC4D0]/60 overflow-hidden shadow-sm">
                <div className="p-4 bg-[#F3EDF7]/50 border-b border-[#CAC4D0]/40 flex items-center justify-between">
                    <div className="text-xs font-bold text-[#1C1B1F] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6750A4]" />
                        <span>पूर्वी अपलोड केलेल्या अधिकृत सूचनांची यादी (Published Notices Archive)</span>
                    </div>
                    <span className="text-[11px] text-[#49454F]">एकूण: <strong>{notices.length}</strong> परिपत्रके</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EADDFF]/40 border-b border-[#CAC4D0]/60 text-[11px] font-bold text-[#21005D]">
                                <th className="py-3 px-3 text-center w-12">अ.क्र.</th>
                                <th className="py-3 px-4">सूचनेचा विषय (Subject)</th>
                                <th className="py-3 px-4 w-40">प्रकाशित दिनांक</th>
                                <th className="py-3 px-4 text-center w-48">कृती (Actions)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CAC4D0]/30 text-xs text-[#1C1B1F]">
                            {notices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-[#49454F]">
                                        अद्याप कोणतीही सूचना अपलोड केलेली नाही.
                                    </td>
                                </tr>
                            ) : (
                                notices.map((item, index) => {
                                    const fileUrl = getPublicFileUrl(item.attachment_path);
                                    const isDeleting = deletingId === item.id;
                                    const dateStr = item.created_at
                                        ? new Date(item.created_at).toLocaleDateString("en-GB")
                                        : "N/A";

                                    return (
                                        <tr key={item.id} className="hover:bg-[#F3EDF7]/30 transition-colors">
                                            <td className="py-3.5 px-3 text-center font-medium text-[#79747E]">
                                                {index + 1}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-[#1C1B1F]">
                                                {item.subject}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#49454F] font-mono text-[11px]">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-[#79747E]" />
                                                    {dateStr}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="inline-flex items-center gap-2">
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EADDFF] text-[#21005D] text-[11px] font-semibold hover:bg-[#EADDFF]/80 active:scale-95 transition-all"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Download</span>
                                                    </a>

                                                    <button
                                                        onClick={() => handleDelete(item.id, item.attachment_path)}
                                                        disabled={isDeleting}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
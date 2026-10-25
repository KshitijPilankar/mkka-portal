'use client';

import React, { useState, useTransition, useId } from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Shield,
    Upload,
    CheckCircle2,
    AlertCircle,
    FileText,
    Image as ImageIcon,
    FileCheck,
    X,
    Loader2,
    Calendar,
    ChevronDown,
    Copy,
    Printer,
    Award,
    Check,
    Info,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { registerPlayerAction } from '@/app/actions/register-player';

export interface District {
    id: string;
    name_en: string;
    name_mr: string;
    code?: string;
}

interface PlayerFormClientProps {
    districts: District[];
}

// Fallback 36 Maharashtra Districts in case database seed is not yet hydrated
const FALLBACK_DISTRICTS: District[] = [
    { id: 'df2be881-c1b0-4a29-81a9-16e7a6b44cd3', code: 'AHM', name_en: 'Ahmednagar', name_mr: 'अहमदनगर' },
    { id: 'dbe9be6e-20c0-4912-ac9d-7f13ec41aecb', code: 'AKO', name_en: 'Akola', name_mr: 'अकोला' },
    { id: '3d43c007-49b0-4910-9e6d-f10190e3185b', code: 'AMR', name_en: 'Amravati', name_mr: 'अमरावती' },
    { id: '1d76c51e-b47d-4816-a7d7-214442195120', code: 'BID', name_en: 'Beed', name_mr: 'बीड' },
    { id: '6c6a9ba1-7bcf-4bf4-809f-f699a6e31cb5', code: 'BHD', name_en: 'Bhandara', name_mr: 'भंडारा' },
    { id: '77031c9c-211a-448f-9161-358929270d79', code: 'BUL', name_en: 'Buldhana', name_mr: 'बुलढाणा' },
    { id: 'b73e2019-3f01-49a3-af98-c66899bcc25d', code: 'CHA', name_en: 'Chandrapur', name_mr: 'चंद्रपूर' },
    { id: '9c70f18c-59e1-4a6b-a525-2833c0876791', code: 'CHH', name_en: 'Chhatrapati Sambhajinagar', name_mr: 'छत्रपती संभाजीनगर' },
    { id: '3072d403-984b-47fa-b496-a277fc887750', code: 'DHA', name_en: 'Dharashiv', name_mr: 'धाराशिव' },
    { id: 'b9bebab7-f7c6-427c-98b3-8543538fc93d', code: 'DHU', name_en: 'Dhule', name_mr: 'धुळे' },
    { id: 'c824c074-306e-486f-a79f-d1f7c230ad29', code: 'GAD', name_en: 'Gadchiroli', name_mr: 'गडचिरोली' },
    { id: '3f635fad-8054-4b60-a5a6-721401ab5800', code: 'GON', name_en: 'Gondia', name_mr: 'गोंदिया' },
    { id: '4d33afe3-a088-433e-a084-f5ae996f6d16', code: 'HIN', name_en: 'Hingoli', name_mr: 'हिंगोली' },
    { id: 'a59cbc07-336d-44dc-ada5-06af56041655', code: 'JAL', name_en: 'Jalgaon', name_mr: 'जळगाव' },
    { id: '3aab4850-8431-4cbe-8b36-657543bd9717', code: 'JLN', name_en: 'Jalna', name_mr: 'जालना' },
    { id: '16064448-bc53-4f6c-94c8-52ef44fdab4b', code: 'KOL', name_en: 'Kolhapur', name_mr: 'कोल्हापूर' },
    { id: '1c0574ae-17fd-499c-9f97-54c1d8e17f55', code: 'LAT', name_en: 'Latur', name_mr: 'लातूर' },
    { id: '9fb67a72-722b-4990-b38b-39dd62c9e39a', code: 'MUM', name_en: 'Mumbai City', name_mr: 'मुंबई शहर' },
    { id: '47627bb5-a08a-40ac-a880-d44f76e34f5b', code: 'MSU', name_en: 'Mumbai Suburban', name_mr: 'मुंबई उपनगर' },
    { id: '14c77cdf-8d21-422b-aa75-c96fffc01d2b', code: 'NAG', name_en: 'Nagpur', name_mr: 'नागपूर' },
    { id: 'e456a508-4279-490c-84b4-c0755cbdf008', code: 'NDD', name_en: 'Nanded', name_mr: 'नांदेड' },
    { id: '863fd5bb-3f1e-45cd-9b1f-3c306438bec7', code: 'NDB', name_en: 'Nandurbar', name_mr: 'नंदुरबार' },
    { id: '65f50d09-9d41-4c66-9389-022e77163fd8', code: 'NAS', name_en: 'Nashik', name_mr: 'नाशिक' },
    { id: 'e128fd8b-2009-49a6-ba68-294d73b51e66', code: 'PAL', name_en: 'Palghar', name_mr: 'पालघर' },
    { id: '34fd704a-dcd7-4b10-a5fe-834e73b37b15', code: 'PAR', name_en: 'Parbhani', name_mr: 'परभणी' },
    { id: 'c58e5ea8-d597-45a5-8dba-89c8c5453507', code: 'PUN', name_en: 'Pune', name_mr: 'पुणे' },
    { id: '7787f87c-b861-42fc-9420-236015e8be51', code: 'RAI', name_en: 'Raigad', name_mr: 'रायगड' },
    { id: '3723ae90-c923-43e2-8f75-e33a2bbba9ce', code: 'RAT', name_en: 'Ratnagiri', name_mr: 'रत्नागिरी' },
    { id: '617d8c89-d44c-457a-a393-01bf979508bf', code: 'SAN', name_en: 'Sangli', name_mr: 'सांगली' },
    { id: 'be0f01d0-8d9a-4847-b46f-bcb0cfc66310', code: 'SAT', name_en: 'Satara', name_mr: 'सातारा' },
    { id: '09a1bd88-f36a-4af9-9daf-45af8c395b46', code: 'SIN', name_en: 'Sindhudurg', name_mr: 'सिंधुदुर्ग' },
    { id: 'b579ca61-b7fc-4b66-ba03-55ce539aee0b', code: 'SOL', name_en: 'Solapur', name_mr: 'सोलापूर' },
    { id: '1a47fd03-62f9-4dc4-95f4-435f5e81afd7', code: 'THA', name_en: 'Thane', name_mr: 'ठाणे' },
    { id: '12ec6127-0c0a-423c-ac5e-6b08b4bf5722', code: 'WAR', name_en: 'Wardha', name_mr: 'वर्धा' },
    { id: '71029ae5-4327-4bc1-85ec-f34e0ff3336a', code: 'WAS', name_en: 'Washim', name_mr: 'वाशिम' },
    { id: '5574688d-7238-483d-91bc-8a9caebfe0d2', code: 'YAV', name_en: 'Yavatmal', name_mr: 'यवतमाळ' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export default function PlayerFormClient({ districts = [] }: PlayerFormClientProps) {
    const activeDistricts = districts.length > 0 ? districts : FALLBACK_DISTRICTS;
    const [isPending, startTransition] = useTransition();

    // Form Field States
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        surname: '',
        fatherName: '',
        motherName: '',
        aadharNo: '',
        gender: '' as 'MALE' | 'FEMALE' | '',
        dob: '',
        mobileNo: '',
        reMobileNo: '',
        email: '',
        reEmail: '',
        residentialDistrictId: '',
        taluka: '',
        city: '',
        pincode: '',
        fullAddress: '',
        playingDistrictId: '',
    });

    // Checkboxes for Terms
    const [termAgreed1, setTermAgreed1] = useState(false);
    const [termAgreed2, setTermAgreed2] = useState(false);
    const [termAgreed3, setTermAgreed3] = useState(false);

    // Files State & Previews
    const [files, setFiles] = useState<{
        photoFile: File | null;
        aadharFile: File | null;
        idProofFile: File | null;
        dobProofFile: File | null;
        otherDocFile: File | null;
    }>({
        photoFile: null,
        aadharFile: null,
        idProofFile: null,
        dobProofFile: null,
        otherDocFile: null,
    });

    const [previews, setPreviews] = useState<{
        photoFile?: string;
        aadharFile?: string;
        idProofFile?: string;
        dobProofFile?: string;
        otherDocFile?: string;
    }>({});

    // Error Handling
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Submission Success State
    const [submissionResult, setSubmissionResult] = useState<{
        trackingId: string;
        submittedAt: string;
        playerName: string;
        playingDistrict: string;
        residentialDistrict: string;
    } | null>(null);

    const [copied, setCopied] = useState(false);

    // Form Input Change Handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for field upon edit
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        if (globalError) setGlobalError(null);
    };

    // File Input Change Handler with validation & preview
    const handleFileChange = (field: keyof typeof files, selectedFile: File | null) => {
        if (!selectedFile) return;

        // Size check
        if (selectedFile.size > MAX_FILE_SIZE) {
            setErrors((prev) => ({
                ...prev,
                [field]: 'File size exceeds 5MB limit / फाईलचा आकार ५ एमबी पेक्षा जास्त असू नये',
            }));
            return;
        }

        // Type check
        if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
            setErrors((prev) => ({
                ...prev,
                [field]: 'Only JPG, PNG or PDF allowed / फक्त JPG, PNG किंवा PDF फॉरमॅट चालेल',
            }));
            return;
        }

        setFiles((prev) => ({ ...prev, [field]: selectedFile }));

        // Generate image preview if not PDF
        if (selectedFile.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(selectedFile);
            setPreviews((prev) => ({ ...prev, [field]: previewUrl }));
        } else {
            setPreviews((prev) => ({ ...prev, [field]: undefined }));
        }

        // Clear error for this file field
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    // Remove selected file
    const handleRemoveFile = (field: keyof typeof files) => {
        setFiles((prev) => ({ ...prev, [field]: null }));
        if (previews[field]) {
            URL.revokeObjectURL(previews[field]!);
            setPreviews((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Client-side validation prior to action dispatch
    const validateClientSide = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Section 1: Personal
        if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name is required / प्रथम नाव आवश्यक आहे';
        }
        if (!formData.middleName.trim() || formData.middleName.trim().length < 2) {
            newErrors.middleName = 'Middle name is required / मधले नाव आवश्यक आहे';
        }
        if (!formData.surname.trim() || formData.surname.trim().length < 2) {
            newErrors.surname = 'Surname is required / आडनाव आवश्यक आहे';
        }
        if (!formData.aadharNo || !/^\d{12}$/.test(formData.aadharNo.trim())) {
            newErrors.aadharNo = 'Aadhaar must be exactly 12 digits / आधार कार्ड १२ अंकी असावे';
        }
        if (!formData.gender) {
            newErrors.gender = 'Please select gender / लिंग निवडा';
        }
        if (!formData.dob) {
            newErrors.dob = 'Valid date of birth required / वैध जन्मतारीख आवश्यक आहे';
        }

        // Section 2: Contact
        if (!formData.mobileNo || !/^[6-9]\d{9}$/.test(formData.mobileNo.trim())) {
            newErrors.mobileNo = 'Enter valid 10-digit mobile number / वैध १० अंकी मोबाईल नंबर टाका';
        }
        if (formData.mobileNo !== formData.reMobileNo) {
            newErrors.reMobileNo = 'Mobile numbers do not match / मोबाईल क्रमांक जुळत नाहीत';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Enter valid email address / वैध ईमेल पत्ता टाका';
        }
        if (formData.email !== formData.reEmail) {
            newErrors.reEmail = 'Email addresses do not match / ईमेल पत्ते जुळत नाहीत';
        }

        // Section 3: Address & Districts
        if (!formData.residentialDistrictId) {
            newErrors.residentialDistrictId = 'Select residential district / संपर्क जिल्हा निवडा';
        }
        if (!formData.pincode || !/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = 'Enter valid 6-digit pincode / ६ अंकी पिनकोड टाका';
        }
        if (!formData.fullAddress.trim() || formData.fullAddress.trim().length < 5) {
            newErrors.fullAddress = 'Full address is required / संपूर्ण पत्ता आवश्यक आहे';
        }
        if (!formData.playingDistrictId) {
            newErrors.playingDistrictId = 'Select playing district / खेळणारा नोंदणी जिल्हा निवडा';
        }

        // Section 5: Mandatory Documents
        if (!files.photoFile) {
            newErrors.photoFile = 'Passport photo is required / पासपोर्ट फोटो आवश्यक आहे';
        }
        if (!files.aadharFile) {
            newErrors.aadharFile = 'Address proof (Aadhaar) is required / पत्ता पुरावा आवश्यक आहे';
        }
        if (!files.idProofFile) {
            newErrors.idProofFile = 'ID proof is required / ओळखपत्र पुरावा आवश्यक आहे';
        }
        if (!files.dobProofFile) {
            newErrors.dobProofFile = 'DOB proof is required / जन्म दाखला आवश्यक आहे';
        }

        // Section 6: Terms
        if (!termAgreed1 || !termAgreed2 || !termAgreed3) {
            newErrors.terms = 'Please accept all terms and conditions / कृपया सर्व अटी व शर्ती मान्य करा';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Scroll to the first error field smoothly
            const firstErrorKey = Object.keys(newErrors)[0];
            const el = document.getElementById(`field-${firstErrorKey}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        return true;
    };

    // Form Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError(null);

        if (!validateClientSide()) {
            return;
        }

        startTransition(async () => {
            try {
                const payload = new FormData();
                payload.append('firstName', formData.firstName.trim());
                payload.append('middleName', formData.middleName.trim());
                payload.append('surname', formData.surname.trim());
                if (formData.fatherName.trim()) payload.append('fatherName', formData.fatherName.trim());
                if (formData.motherName.trim()) payload.append('motherName', formData.motherName.trim());
                payload.append('aadharNo', formData.aadharNo.trim());
                payload.append('gender', formData.gender);
                payload.append('dob', formData.dob);
                payload.append('mobileNo', formData.mobileNo.trim());
                payload.append('reMobileNo', formData.reMobileNo.trim());
                payload.append('email', formData.email.trim());
                payload.append('reEmail', formData.reEmail.trim());
                payload.set('residentialDistrictId', formData.residentialDistrictId ? formData.residentialDistrictId.trim() : '');
                if (formData.taluka.trim()) payload.append('taluka', formData.taluka.trim());
                if (formData.city.trim()) payload.append('city', formData.city.trim());
                payload.append('pincode', formData.pincode.trim());
                payload.append('fullAddress', formData.fullAddress.trim());
                payload.set('playingDistrictId', formData.playingDistrictId ? formData.playingDistrictId.trim() : '');
                payload.append('termsAccepted', 'on');

                // Attach files
                if (files.photoFile) payload.append('photoFile', files.photoFile);
                if (files.aadharFile) payload.append('aadharFile', files.aadharFile);
                if (files.idProofFile) payload.append('idProofFile', files.idProofFile);
                if (files.dobProofFile) payload.append('dobProofFile', files.dobProofFile);
                if (files.otherDocFile) payload.append('otherDocFile', files.otherDocFile);

                const res = await registerPlayerAction(payload);

                if (res.success && res.trackingId) {
                    const playingDistObj = activeDistricts.find((d) => d.id === formData.playingDistrictId);
                    const resDistObj = activeDistricts.find((d) => d.id === formData.residentialDistrictId);

                    setSubmissionResult({
                        trackingId: res.trackingId,
                        submittedAt: new Date().toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        playerName: `${formData.firstName} ${formData.middleName} ${formData.surname}`.toUpperCase(),
                        playingDistrict: playingDistObj ? `${playingDistObj.name_en} (${playingDistObj.name_mr})` : 'Selected District',
                        residentialDistrict: resDistObj ? `${resDistObj.name_en} (${resDistObj.name_mr})` : 'Selected District',
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (!res.success) {
                    if (res.errors) {
                        const mappedErrors: Record<string, string> = {};
                        Object.entries(res.errors).forEach(([k, v]) => {
                            if (Array.isArray(v) && v.length > 0) {
                                mappedErrors[k] = v[0];
                            }
                        });
                        setErrors(mappedErrors);
                        setGlobalError('Please review highlighted fields / कृपया त्रुटी असलेले रकाने तपासा');
                    } else if (res.error) {
                        setGlobalError(res.error);
                    }
                }
            } catch (err: any) {
                setGlobalError(err.message || 'An unexpected error occurred during submission.');
            }
        });
    };

    const copyTrackingId = () => {
        if (!submissionResult?.trackingId) return;
        navigator.clipboard.writeText(submissionResult.trackingId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => {
        window.print();
    };

    const resetForm = () => {
        setSubmissionResult(null);
        setFormData({
            firstName: '',
            middleName: '',
            surname: '',
            fatherName: '',
            motherName: '',
            aadharNo: '',
            gender: '',
            dob: '',
            mobileNo: '',
            reMobileNo: '',
            email: '',
            reEmail: '',
            residentialDistrictId: '',
            taluka: '',
            city: '',
            pincode: '',
            fullAddress: '',
            playingDistrictId: '',
        });
        setFiles({
            photoFile: null,
            aadharFile: null,
            idProofFile: null,
            dobProofFile: null,
            otherDocFile: null,
        });
        setPreviews({});
        setTermAgreed1(false);
        setTermAgreed2(false);
        setTermAgreed3(false);
        setErrors({});
        setGlobalError(null);
    };

    // ==========================================
    // SUCCESS ACKNOWLEDGEMENT RECEIPT (Material You)
    // ==========================================
    if (submissionResult) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in-50 duration-500">
                <div className="bg-[#F3EDF7] rounded-[36px] p-6 md:p-12 shadow-md border border-[#E7E0EC] relative overflow-hidden">
                    {/* Atmospheric Glow */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#6750A4]/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#7D5260]/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="text-center relative z-10 mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#EADDFF] text-[#21005D] mb-4 shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-[#6750A4]" />
                        </div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-semibold tracking-wide mb-3">
                            MAHARASHTRA KHO-KHO ASSOCIATION • खेळाडू नोंदणी २०२६-२७
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1B1F]">
                            अर्ज यशस्वीरीत्या सादर केला!
                        </h2>
                        <p className="text-sm md:text-base text-[#49454F] mt-1">
                            Application Submitted Successfully for Verification
                        </p>
                    </div>

                    {/* Tracking ID Badge */}
                    <div className="bg-[#FFFBFE] rounded-2xl p-6 border border-[#CAC4D0] mb-8 relative z-10 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <div className="text-xs font-semibold text-[#49454F] uppercase tracking-wider">
                                    Application Tracking ID / अर्ज नोंदणी क्रमांक
                                </div>
                                <div className="text-xl md:text-2xl font-mono font-bold text-[#6750A4] mt-1 select-all break-all">
                                    {submissionResult.trackingId}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={copyTrackingId}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EADDFF] text-[#21005D] text-sm font-medium transition-all hover:bg-[#d8c7fa] active:scale-95 shadow-sm"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied / कॉपी केले' : 'Copy ID / प्रत करा'}
                            </button>
                        </div>
                    </div>

                    {/* Application Details Summary */}
                    <div className="bg-[#FFFBFE] rounded-2xl p-6 border border-[#CAC4D0] mb-8 space-y-4 text-sm text-[#1C1B1F]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#E7E0EC]">
                            <div>
                                <span className="text-xs font-medium text-[#49454F] block">Player Full Name / खेळाडूचे पूर्ण नाव:</span>
                                <span className="font-semibold text-base">{submissionResult.playerName}</span>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-[#49454F] block">Submission Date / अर्ज सादर दिनांक:</span>
                                <span className="font-medium">{submissionResult.submittedAt}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#E7E0EC]">
                            <div>
                                <span className="text-xs font-medium text-[#49454F] block">Playing District / खेळणारा नोंदणी जिल्हा:</span>
                                <span className="font-semibold text-[#6750A4]">{submissionResult.playingDistrict}</span>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-[#49454F] block">Residential District / राहणारा संपर्क जिल्हा:</span>
                                <span className="font-medium">{submissionResult.residentialDistrict}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-medium text-[#49454F]">Status / स्थिती:</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3E0] text-[#EF6C00] font-semibold text-xs border border-[#FFE0B2]">
                                <span className="w-2 h-2 rounded-full bg-[#EF6C00] animate-pulse" />
                                PENDING SCRUTINY / छाननी प्रलंबित
                            </span>
                        </div>
                    </div>

                    {/* Instructions Note */}
                    <div className="bg-[#EADDFF]/50 rounded-2xl p-4 mb-8 flex items-start gap-3 border border-[#EADDFF]">
                        <Info className="w-5 h-5 text-[#6750A4] shrink-0 mt-0.5" />
                        <div className="text-xs md:text-sm text-[#21005D] leading-relaxed">
                            <strong>पुढील टप्पा (Next Step):</strong> आपला अर्ज संबंधित जिल्हा खो-खो असोसिएशन व राज्य तांत्रिक समितीकडे पडताळणीसाठी पाठवण्यात आला आहे. कागदपत्रांची छाननी पूर्ण झाल्यानंतर आपल्या मोबाईल नंबर व ईमेलवर पुष्टीकरण पाठवले जाईल.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full sm:w-auto h-12 px-8 rounded-full border border-[#79747E] bg-white text-[#6750A4] font-medium shadow-sm transition-all hover:bg-[#F3EDF7] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print Receipt / पोचपावती प्रिंट करा
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#6750A4] text-white font-medium shadow-md transition-all hover:bg-[#5b4594] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Register Another Player / नवीन नोंदणी
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN REGISTRATION FORM (Material You MD3)
    // ==========================================
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="bg-[#F3EDF7] rounded-[36px] p-6 md:p-10 mb-8 shadow-sm border border-[#E7E0EC] relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#6750A4]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6750A4] to-[#7D5260] text-white flex items-center justify-center shadow-md shrink-0">
                        <Award className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-semibold mb-2">
                            <span>महाराष्ट्र राज्य खो-खो असोसिएशन</span>
                            <span>•</span>
                            <span>सत्र २०२६-२७</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1C1B1F]">
                            राज्य खेळाडू अधिकृत नोंदणी अर्ज
                        </h1>
                        <p className="text-sm text-[#49454F] mt-1 font-medium">
                            Official State Player Membership Registration Portal • Bilingual Form
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Error Banner */}
            {globalError && (
                <div className="mb-6 p-4 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#B3261E] flex items-center gap-3 animate-in fade-in-50">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{globalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
                {/* Hidden inputs to guarantee district ID binding in form data */}
                <input type="hidden" name="residentialDistrictId" value={formData.residentialDistrictId} />
                <input type="hidden" name="playingDistrictId" value={formData.playingDistrictId} />

                {/* ------------------------------------------------------------- */}
                {/* SECTION 1: वैयक्तिक माहिती / Personal Information */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-[#F3EDF7]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#CAC4D0]">
                        <div className="w-10 h-10 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#6750A4]" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F]">
                                १. वैयक्तिक माहिती (Personal Information)
                            </h2>
                            <p className="text-xs text-[#49454F]">खेळाडूचे संपूर्ण नाव व अधिकृत ओळख तपशील</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* First Name */}
                        <div id="field-firstName" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                First Name / प्रथम नाव <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="उदा. राहुल / Rahul"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.firstName
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.firstName && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.firstName}
                                </p>
                            )}
                        </div>

                        {/* Middle Name */}
                        <div id="field-middleName" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Middle Name / मधले नाव <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                placeholder="उदा. सुरेश / Suresh"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.middleName
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.middleName && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.middleName}
                                </p>
                            )}
                        </div>

                        {/* Surname */}
                        <div id="field-surname" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Surname / आडनाव <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleInputChange}
                                placeholder="उदा. गायकवाड / Gaikwad"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.surname
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.surname && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.surname}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                        {/* Father Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Father Name / वडिलांचे नाव
                            </label>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleInputChange}
                                placeholder="वडिलांचे नाव / Father's Name"
                                className="h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20 focus:outline-none transition-all placeholder:text-[#49454F]/50"
                            />
                        </div>

                        {/* Mother Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Mother Name / आईचे नाव
                            </label>
                            <input
                                type="text"
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleInputChange}
                                placeholder="आईचे नाव / Mother's Name"
                                className="h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20 focus:outline-none transition-all placeholder:text-[#49454F]/50"
                            />
                        </div>

                        {/* Aadhar Card Number */}
                        <div id="field-aadharNo" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Aadhar No. / आधार कार्ड क्र. <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="text"
                                name="aadharNo"
                                maxLength={12}
                                value={formData.aadharNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData((p) => ({ ...p, aadharNo: val }));
                                    if (errors.aadharNo) {
                                        setErrors((prev) => {
                                            const n = { ...prev };
                                            delete n.aadharNo;
                                            return n;
                                        });
                                    }
                                }}
                                placeholder="12-digit number (१२ अंकी क्रमांक)"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 font-mono tracking-widest transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.aadharNo
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.aadharNo && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.aadharNo}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        {/* Gender Radio */}
                        <div id="field-gender" className="flex flex-col justify-center">
                            <label className="text-xs font-semibold text-[#49454F] mb-2 uppercase tracking-wider">
                                Gender / लिंग <span className="text-[#B3261E]">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label
                                    className={`flex items-center justify-center gap-2 h-14 rounded-full border-2 cursor-pointer font-medium text-sm transition-all ${
                                        formData.gender === 'MALE'
                                            ? 'bg-[#EADDFF] border-[#6750A4] text-[#21005D] shadow-sm'
                                            : 'bg-[#E7E0EC] border-transparent text-[#1C1B1F] hover:bg-[#ded6e4]'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="MALE"
                                        checked={formData.gender === 'MALE'}
                                        onChange={() => {
                                            setFormData((p) => ({ ...p, gender: 'MALE' }));
                                            if (errors.gender) {
                                                setErrors((prev) => {
                                                    const n = { ...prev };
                                                    delete n.gender;
                                                    return n;
                                                });
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    <span>Male / पुरुष</span>
                                </label>

                                <label
                                    className={`flex items-center justify-center gap-2 h-14 rounded-full border-2 cursor-pointer font-medium text-sm transition-all ${
                                        formData.gender === 'FEMALE'
                                            ? 'bg-[#EADDFF] border-[#6750A4] text-[#21005D] shadow-sm'
                                            : 'bg-[#E7E0EC] border-transparent text-[#1C1B1F] hover:bg-[#ded6e4]'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="FEMALE"
                                        checked={formData.gender === 'FEMALE'}
                                        onChange={() => {
                                            setFormData((p) => ({ ...p, gender: 'FEMALE' }));
                                            if (errors.gender) {
                                                setErrors((prev) => {
                                                    const n = { ...prev };
                                                    delete n.gender;
                                                    return n;
                                                });
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    <span>Female / महिला</span>
                                </label>
                            </div>
                            {errors.gender && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.gender}
                                </p>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div id="field-dob" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Date of Birth / जन्मदिनांक <span className="text-[#B3261E]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="dob"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className={`w-full h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none ${
                                        errors.dob
                                            ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                            : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                    }`}
                                />
                            </div>
                            {errors.dob && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.dob}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 2: संपर्क तपशील / Contact Details */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-[#F3EDF7]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#CAC4D0]">
                        <div className="w-10 h-10 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center">
                            <Phone className="w-5 h-5 text-[#6750A4]" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F]">
                                २. संपर्क तपशील (Contact Details)
                            </h2>
                            <p className="text-xs text-[#49454F]">मोबाईल क्रमांक व ईमेलची अचूकता आवश्यक</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Mobile Number */}
                        <div id="field-mobileNo" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Mobile Number / मोबाईल क्रमांक <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="tel"
                                name="mobileNo"
                                maxLength={10}
                                value={formData.mobileNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData((p) => ({ ...p, mobileNo: val }));
                                    if (errors.mobileNo) {
                                        setErrors((prev) => {
                                            const n = { ...prev };
                                            delete n.mobileNo;
                                            return n;
                                        });
                                    }
                                }}
                                placeholder="10-digit number (१० अंकी मोबाईल नंबर)"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 font-mono tracking-wider transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.mobileNo
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.mobileNo && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.mobileNo}
                                </p>
                            )}
                        </div>

                        {/* Re-enter Mobile */}
                        <div id="field-reMobileNo" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Re-Enter Mobile / तोच मोबाईल क्रमांक पुन्हा टाका <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="tel"
                                name="reMobileNo"
                                maxLength={10}
                                value={formData.reMobileNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData((p) => ({ ...p, reMobileNo: val }));
                                    if (errors.reMobileNo) {
                                        setErrors((prev) => {
                                            const n = { ...prev };
                                            delete n.reMobileNo;
                                            return n;
                                        });
                                    }
                                }}
                                placeholder="Confirm 10-digit number"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 font-mono tracking-wider transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.reMobileNo
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.reMobileNo && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.reMobileNo}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        {/* Email */}
                        <div id="field-email" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Email Address / इमेल पत्ता <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="player@example.com"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.email
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Re-enter Email */}
                        <div id="field-reEmail" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Re-Enter Email / तोच इमेल पुन्हा टाका <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="email"
                                name="reEmail"
                                value={formData.reEmail}
                                onChange={handleInputChange}
                                placeholder="Confirm email address"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.reEmail
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.reEmail && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.reEmail}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 3: संपर्क पत्ता / Residential Address */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-[#F3EDF7]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#CAC4D0]">
                        <div className="w-10 h-10 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-[#6750A4]" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F]">
                                ३. संपर्क पत्ता (Residential Address)
                            </h2>
                            <p className="text-xs text-[#49454F]">खेळाडू सध्या ज्या पत्त्यावर वास्तव्य करतो तो पत्ता</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Residential District Dropdown */}
                        <div id="field-residentialDistrictId" className="flex flex-col md:col-span-1">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Residential District / संपर्क जिल्हा <span className="text-[#B3261E]">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="residentialDistrictId"
                                    id="residentialDistrictSelect"
                                    value={formData.residentialDistrictId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => ({ ...prev, residentialDistrictId: val }));
                                        if (val) {
                                            setErrors((prev) => {
                                                const next = { ...prev };
                                                delete next.residentialDistrictId;
                                                return next;
                                            });
                                        }
                                        if (globalError) setGlobalError(null);
                                    }}
                                    className={`w-full h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 appearance-none transition-all focus:outline-none pr-10 font-medium ${
                                        errors.residentialDistrictId
                                            ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                            : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                    }`}
                                >
                                    <option value="">-- जिल्हा निवडा (Select District) --</option>
                                    {activeDistricts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name_en} ({d.name_mr})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-[#49454F] absolute right-4 top-5 pointer-events-none" />
                            </div>
                            {errors.residentialDistrictId && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.residentialDistrictId}
                                </p>
                            )}
                        </div>

                        {/* Taluka */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Taluka / तालुका
                            </label>
                            <input
                                type="text"
                                name="taluka"
                                value={formData.taluka}
                                onChange={handleInputChange}
                                placeholder="तालुका (उदा. हवेली / Haveli)"
                                className="h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20 focus:outline-none transition-all placeholder:text-[#49454F]/50"
                            />
                        </div>

                        {/* City / Village */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                City / Village / शहर किंवा गाव
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="शहर किंवा गावाचे नाव"
                                className="h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20 focus:outline-none transition-all placeholder:text-[#49454F]/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                        {/* Pincode */}
                        <div id="field-pincode" className="flex flex-col">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Pincode / पिनकोड <span className="text-[#B3261E]">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                maxLength={6}
                                value={formData.pincode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData((p) => ({ ...p, pincode: val }));
                                    if (errors.pincode) {
                                        setErrors((prev) => {
                                            const n = { ...prev };
                                            delete n.pincode;
                                            return n;
                                        });
                                    }
                                }}
                                placeholder="6-digit pincode"
                                className={`h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 font-mono tracking-wider transition-all focus:outline-none placeholder:text-[#49454F]/50 ${
                                    errors.pincode
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.pincode && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.pincode}
                                </p>
                            )}
                        </div>

                        {/* Full Address */}
                        <div id="field-fullAddress" className="flex flex-col md:col-span-2">
                            <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                                Complete Address / पिनकोड सहित संपूर्ण पत्ता <span className="text-[#B3261E]">*</span>
                            </label>
                            <textarea
                                name="fullAddress"
                                rows={2}
                                value={formData.fullAddress}
                                onChange={handleInputChange}
                                placeholder="घर क्र., इमारत/गल्ली, परिसर, पोस्ट व पिनकोडसह संपूर्ण पत्ता"
                                className={`p-3.5 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 transition-all focus:outline-none placeholder:text-[#49454F]/50 resize-none ${
                                    errors.fullAddress
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            />
                            {errors.fullAddress && (
                                <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fullAddress}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 4: खेळणारा नोंदणी जिल्हा / Playing Representation */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-[#F3EDF7]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#CAC4D0]">
                        <div className="w-10 h-10 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center">
                            <Award className="w-5 h-5 text-[#6750A4]" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F]">
                                ४. नोंदणी जिल्हा निवड (Playing District Representation)
                            </h2>
                            <p className="text-xs text-[#49454F]">खेळाडू ज्या जिल्ह्याकडून स्पर्धा खेळू इच्छितो तो जिल्हा निवडा</p>
                        </div>
                    </div>

                    {/* Rule Highlight Card */}
                    <div className="bg-[#EADDFF]/50 border border-[#CAC4D0] rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#6750A4] shrink-0 mt-0.5" />
                        <div className="text-xs md:text-sm text-[#21005D] leading-relaxed">
                            <strong>अधिकृत नियम (Association Guideline):</strong> खेळाडू कोणत्याही जिल्ह्यात राहत असला तरी, तो/ती ज्या जिल्ह्याकडून स्पर्धा खेळू इच्छितो तो नोंदणी जिल्हा (Playing District) निवडण्याचा त्याला अधिकार आहे. आपल्या निवडीनुसार हा अर्ज त्या जिल्हा संघटनेकडे मंजुरीसाठी पाठवला जाईल.
                        </div>
                    </div>

                    <div id="field-playingDistrictId" className="flex flex-col">
                        <label className="text-xs font-semibold text-[#49454F] mb-1.5 uppercase tracking-wider">
                            नोंदणी कोणत्या जिल्ह्यामध्ये करायची आहे? (Playing District)* <span className="text-[#B3261E]">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="playingDistrictId"
                                id="playingDistrictSelect"
                                value={formData.playingDistrictId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => ({ ...prev, playingDistrictId: val }));
                                    if (val) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.playingDistrictId;
                                            return next;
                                        });
                                    }
                                    if (globalError) setGlobalError(null);
                                }}
                                className={`w-full h-14 px-4 rounded-t-xl rounded-b-none bg-[#E7E0EC] text-[#1C1B1F] border-b-2 appearance-none transition-all focus:outline-none pr-10 font-medium ${
                                    errors.playingDistrictId
                                        ? 'border-[#B3261E] bg-[#FFEBEE]/50'
                                        : 'border-[#79747E] focus:border-[#6750A4] focus:bg-[#EADDFF]/20'
                                }`}
                            >
                                <option value="">-- ३६ अधिकृत जिल्ह्यांमधून निवडा (Select from 36 Districts) --</option>
                                {activeDistricts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name_en} ({d.name_mr}) {d.code ? `• [${d.code}]` : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-[#49454F] absolute right-4 top-5 pointer-events-none" />
                        </div>
                        {errors.playingDistrictId && (
                            <p className="text-xs font-medium text-[#B3261E] mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.playingDistrictId}
                            </p>
                        )}
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 5: आवश्यक कागदपत्रे / Document Uploads */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-[#F3EDF7]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#CAC4D0]">
                        <div className="w-10 h-10 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center">
                            <Upload className="w-5 h-5 text-[#6750A4]" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F]">
                                ५. आवश्यक कागदपत्रे (Mandatory Document Attachments)
                            </h2>
                            <p className="text-xs text-[#49454F]">कमाल फाईल आकार: ५ MB प्रति दस्तऐवज (JPG, PNG किंवा PDF)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* 1. Photograph */}
                        <FileUploadCard
                            id="field-photoFile"
                            title="१. पासपोर्ट साईझ फोटो (Photograph)"
                            subtitle="Recent passport size color photograph"
                            fileKey="photoFile"
                            required
                            file={files.photoFile}
                            previewUrl={previews.photoFile}
                            error={errors.photoFile}
                            onChange={(file) => handleFileChange('photoFile', file)}
                            onRemove={() => handleRemoveFile('photoFile')}
                            icon={<ImageIcon className="w-6 h-6 text-[#6750A4]" />}
                        />

                        {/* 2. Address Proof */}
                        <FileUploadCard
                            id="field-aadharFile"
                            title="२. वास्तव्याचा पुरावा (Address Proof)"
                            subtitle="Aadhaar Card (दोन्ही बाजू / Front & Back)"
                            fileKey="aadharFile"
                            required
                            file={files.aadharFile}
                            previewUrl={previews.aadharFile}
                            error={errors.aadharFile}
                            onChange={(file) => handleFileChange('aadharFile', file)}
                            onRemove={() => handleRemoveFile('aadharFile')}
                            icon={<FileText className="w-6 h-6 text-[#6750A4]" />}
                        />

                        {/* 3. ID Proof */}
                        <FileUploadCard
                            id="field-idProofFile"
                            title="३. ओळखपत्र (ID Proof)"
                            subtitle="School ID / Voter ID / Passport / Driving License"
                            fileKey="idProofFile"
                            required
                            file={files.idProofFile}
                            previewUrl={previews.idProofFile}
                            error={errors.idProofFile}
                            onChange={(file) => handleFileChange('idProofFile', file)}
                            onRemove={() => handleRemoveFile('idProofFile')}
                            icon={<Shield className="w-6 h-6 text-[#6750A4]" />}
                        />

                        {/* 4. DOB Proof */}
                        <FileUploadCard
                            id="field-dobProofFile"
                            title="४. जन्माचा पुरावा (DOB Proof)"
                            subtitle="Birth Certificate (जन्म दाखला) / Bonafide Certificate"
                            fileKey="dobProofFile"
                            required
                            file={files.dobProofFile}
                            previewUrl={previews.dobProofFile}
                            error={errors.dobProofFile}
                            onChange={(file) => handleFileChange('dobProofFile', file)}
                            onRemove={() => handleRemoveFile('dobProofFile')}
                            icon={<Calendar className="w-6 h-6 text-[#6750A4]" />}
                        />
                    </div>

                    {/* Optional 5th Document */}
                    <div className="mt-5">
                        <FileUploadCard
                            id="field-otherDocFile"
                            title="५. इतर कागदपत्र (Other Document - Optional / ऐच्छिक)"
                            subtitle="राजपत्र (Gazette Notification) किंवा इतर संलग्न कागदपत्र"
                            fileKey="otherDocFile"
                            required={false}
                            file={files.otherDocFile}
                            previewUrl={previews.otherDocFile}
                            error={errors.otherDocFile}
                            onChange={(file) => handleFileChange('otherDocFile', file)}
                            onRemove={() => handleRemoveFile('otherDocFile')}
                            icon={<FileCheck className="w-6 h-6 text-[#49454F]" />}
                        />
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 6: अटी व शर्ती / Terms & Conditions */}
                {/* ------------------------------------------------------------- */}
                <div id="field-terms" className="bg-[#F3EDF7]/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#CAC4D0]">
                        <div className="w-10 h-10 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#6750A4]" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-[#1C1B1F]">
                                ६. हमीपत्र व अटी-शर्ती (Terms & Conditions)
                            </h2>
                            <p className="text-xs text-[#49454F]">कृपया खालील सर्व मुद्द्यांचे वाचन करून संमती द्या</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Checkbox 1 */}
                        <label className="flex items-start gap-3.5 p-3 rounded-2xl transition-all cursor-pointer hover:bg-[#EADDFF]/20">
                            <input
                                type="checkbox"
                                checked={termAgreed1}
                                onChange={(e) => {
                                    setTermAgreed1(e.target.checked);
                                    if (errors.terms) {
                                        setErrors((p) => {
                                            const n = { ...p };
                                            delete n.terms;
                                            return n;
                                        });
                                    }
                                }}
                                className="w-5 h-5 rounded accent-[#6750A4] mt-0.5 shrink-0 cursor-pointer"
                            />
                            <span className="text-xs md:text-sm text-[#1C1B1F] leading-relaxed select-none">
                                मी प्रमाणित करतो की, या अर्जात भरलेली सर्व माहिती माझ्या वैयक्तिक माहितीनुसार खरी आणि अचूक आहे. (I certify that all information provided in this registration form is true, correct, and complete to the best of my knowledge).
                            </span>
                        </label>

                        {/* Checkbox 2 */}
                        <label className="flex items-start gap-3.5 p-3 rounded-2xl transition-all cursor-pointer hover:bg-[#EADDFF]/20">
                            <input
                                type="checkbox"
                                checked={termAgreed2}
                                onChange={(e) => {
                                    setTermAgreed2(e.target.checked);
                                    if (errors.terms) {
                                        setErrors((p) => {
                                            const n = { ...p };
                                            delete n.terms;
                                            return n;
                                        });
                                    }
                                }}
                                className="w-5 h-5 rounded accent-[#6750A4] mt-0.5 shrink-0 cursor-pointer"
                            />
                            <span className="text-xs md:text-sm text-[#1C1B1F] leading-relaxed select-none">
                                कोणत्याही टप्प्यावर कोणतीही माहिती किंवा कागदपत्रे खोटी किंवा दिशाभूल करणारी आढळल्यास महाराष्ट्र खो-खो असोसिएशन द्वारे माझे सभासदत्व व नोंदणी तात्काळ रद्द केली जाऊ शकते याची मला पूर्ण जाणीव आहे. (I understand that my membership may be terminated immediately by MKKA if any false information is detected).
                            </span>
                        </label>

                        {/* Checkbox 3 */}
                        <label className="flex items-start gap-3.5 p-3 rounded-2xl transition-all cursor-pointer hover:bg-[#EADDFF]/20">
                            <input
                                type="checkbox"
                                checked={termAgreed3}
                                onChange={(e) => {
                                    setTermAgreed3(e.target.checked);
                                    if (errors.terms) {
                                        setErrors((p) => {
                                            const n = { ...p };
                                            delete n.terms;
                                            return n;
                                        });
                                    }
                                }}
                                className="w-5 h-5 rounded accent-[#6750A4] mt-0.5 shrink-0 cursor-pointer"
                            />
                            <span className="text-xs md:text-sm text-[#1C1B1F] leading-relaxed select-none">
                                मी माझी वैयक्तिक माहिती आणि सादर केलेली कागदपत्रे महाराष्ट्र खो-खो असोसिएशनच्या तांत्रिक समितीकडे पडताळणीसाठी आणि अधिकृत खेळाडू ओळखपत्र तयार करण्यासाठी वापरण्यास संमती देत आहे. (I consent to sharing my personal details and documents with the State Technical Committee for verification and ID generation).
                            </span>
                        </label>
                    </div>

                    {errors.terms && (
                        <p className="text-xs font-medium text-[#B3261E] mt-3 flex items-center gap-1.5 p-2 bg-[#FFEBEE] rounded-xl border border-[#FFCDD2]">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.terms}
                        </p>
                    )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SUBMISSION CTA BAR (Material You Pill Architecture) */}
                {/* ------------------------------------------------------------- */}
                <div className="pt-4 pb-12 text-center">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-3 w-full sm:w-auto min-w-[340px] h-14 px-10 rounded-full bg-[#6750A4] text-white font-semibold text-base shadow-lg transition-all duration-300 ease-out hover:bg-[#5b4594] hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>कागदपत्रे अपलोड व नोंदणी होत आहे... / Submitting...</span>
                            </>
                        ) : (
                            <>
                                <span>SUBMIT FOR MEMBERSHIP / सभासदत्वासाठी अर्ज करा</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    <p className="text-xs text-[#49454F] mt-3">
                        नोंदणीनंतर अधिकृत पोचपावती व अर्ज ट्रॅकिंग क्रमांक (Tracking ID) दिला जाईल
                    </p>
                </div>
            </form>
        </div>
    );
}

// ==========================================
// COMPONENT: Material You File Upload Card
// ==========================================
interface FileUploadCardProps {
    id?: string;
    title: string;
    subtitle: string;
    fileKey: string;
    required?: boolean;
    file: File | null;
    previewUrl?: string;
    error?: string;
    onChange: (file: File | null) => void;
    onRemove: () => void;
    icon: React.ReactNode;
}

function FileUploadCard({
    id,
    title,
    subtitle,
    fileKey,
    required = true,
    file,
    previewUrl,
    error,
    onChange,
    onRemove,
    icon,
}: FileUploadCardProps) {
    const inputId = useId();

    return (
        <div
            id={id}
            className={`p-4 rounded-2xl border transition-all ${
                error
                    ? 'border-[#B3261E] bg-[#FFEBEE]/40'
                    : file
                    ? 'border-[#6750A4] bg-[#EADDFF]/20'
                    : 'border-[#CAC4D0] bg-[#FFFBFE] hover:border-[#6750A4]'
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                    <span className="text-xs font-semibold text-[#1C1B1F] block">
                        {title} {required && <span className="text-[#B3261E]">*</span>}
                    </span>
                    <span className="text-[11px] text-[#49454F] block mt-0.5">{subtitle}</span>
                </div>
                <div className="shrink-0">{icon}</div>
            </div>

            {/* If file is chosen */}
            {file ? (
                <div className="mt-3 flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#CAC4D0]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-12 h-12 rounded-lg object-cover border border-[#E7E0EC] shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#EADDFF] text-[#21005D] flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-[#1C1B1F] truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-[10px] text-[#49454F]">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1.5 rounded-full hover:bg-[#FFEBEE] text-[#B3261E] transition-colors"
                        title="Remove file"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                /* Upload trigger */
                <label
                    htmlFor={inputId}
                    className="mt-3 flex flex-col items-center justify-center py-4 px-3 rounded-xl border border-dashed border-[#79747E] hover:border-[#6750A4] bg-[#E7E0EC]/40 hover:bg-[#EADDFF]/10 cursor-pointer transition-all text-center group"
                >
                    <Upload className="w-5 h-5 text-[#49454F] group-hover:text-[#6750A4] transition-colors mb-1" />
                    <span className="text-xs font-medium text-[#6750A4]">
                        फाईल निवडा / Choose File
                    </span>
                    <span className="text-[10px] text-[#49454F] mt-0.5">
                        PDF, JPG, PNG (Max 5MB)
                    </span>
                    <input
                        id={inputId}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                onChange(e.target.files[0]);
                            }
                        }}
                        className="sr-only"
                    />
                </label>
            )}

            {error && (
                <p className="text-xs font-medium text-[#B3261E] mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </p>
            )}
        </div>
    );
}

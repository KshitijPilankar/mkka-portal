import React from "react";
import Link from "next/link";
import {
    Trophy,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    Building2,
    Users,
} from "lucide-react";

export default function AppFooter() {
    return (
        <footer className="w-full bg-[#1C1B1F] text-white pt-14 pb-8 border-t border-[#CAC4D0]/30 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* 4-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

                    {/* Column 1: Association Brand with Official Logo */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-xs flex items-center justify-center shrink-0">
                                <img
                                    src="/mkka-logo.png"
                                    alt="MKKA Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                                महाराष्ट्र राज्य खो-खो असोसिएशन
                            </h3>
                        </div>
                        <p className="text-xs text-[#CAC4D0] leading-relaxed">
                            राज्यभरातील सर्व अधिकृत खो-खो खेळाडू, पंच आणि ३६ जिल्हा संघटनांसाठी केंद्रीयकृत डिजिटल पडताळणी व अजिंक्यपद व्यवस्थापन प्रणाली.
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-[11px] text-[#EADDFF] font-medium border border-white/10">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>मान्यताप्राप्त राज्य क्रीडा संघटना</span>
                        </div>
                    </div>

                    {/* Column 2: Player & Public Services */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#D0BCFF] uppercase tracking-wider">
                            खेळाडू व सार्वजनिक सेवा
                        </h4>
                        <ul className="space-y-2 text-xs text-[#CAC4D0]">
                            <li>
                                <Link href="/register" className="hover:text-white transition-colors">
                                    खेळाडू नोंदणी अर्ज (Register Now)
                                </Link>
                            </li>
                            <li>
                                <Link href="/track" className="hover:text-white transition-colors">
                                    अर्ज स्थिती व QR ओळखपत्र (Track ID)
                                </Link>
                            </li>
                            <li>
                                <Link href="/tournaments" className="hover:text-white transition-colors">
                                    राज्य अजिंक्यपद स्पर्धा कॅलेंडर
                                </Link>
                            </li>
                            <li>
                                <Link href="/officials/referees" className="hover:text-white transition-colors">
                                    पंच व परीक्षक नोंदणी कक्ष (Referee Hub)
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: District & Association Portal Links */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#D0BCFF] uppercase tracking-wider">
                            संघटना व प्रशासकीय नियंत्रण
                        </h4>
                        <ul className="space-y-2 text-xs text-[#CAC4D0]">
                            <li>
                                <Link href="/district/login" className="hover:text-white transition-colors">
                                    ३६ जिल्हा संघटना लॉगिन कक्ष
                                </Link>
                            </li>
                            <li>
                                <Link href="/association/players/approvals" className="hover:text-white transition-colors">
                                    खेळाडू नोंदणी छाननी व पडताळणी
                                </Link>
                            </li>
                            <li>
                                <Link href="/association/tournaments" className="hover:text-white transition-colors">
                                    अधिकृत स्पर्धा घोषणा व DOB मर्यादा
                                </Link>
                            </li>
                            <li>
                                <Link href="/association/login" className="hover:text-white transition-colors">
                                    प्रशासकीय नियंत्रण कक्ष (State Admin)
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Official Headquarters & Contact */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#D0BCFF] uppercase tracking-wider">
                            अधिकृत संपर्क व मुख्यालय
                        </h4>
                        <div className="space-y-2.5 text-xs text-[#CAC4D0]">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-[#D0BCFF] shrink-0 mt-0.5" />
                                <span>शिवछत्रपती क्रीडा संकुल, बालेवाडी, पुणे, महाराष्ट्र - ४११०४५</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#D0BCFF] shrink-0" />
                                <span>support@mkka.org / admin@mkka.org</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                                <Phone className="w-4 h-4 text-[#D0BCFF] shrink-0" />
                                <span>+91 020-27390000 / 9822112233</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Strip */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#CAC4D0]/80">
                    <div>
                        © २०२६-२७ महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA). सर्व हक्क राखीव.
                    </div>
                    <div className="flex items-center gap-6">
                        <span>सत्र २०२६-२७ अधिकृत डिजिटल प्रणाली</span>
                        <span>गोपनीयता धोरण (Privacy)</span>
                        <span>नियम व अटी (Terms)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
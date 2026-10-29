import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  UserPlus,
  IdCard,
  Building2,
  Trophy,
  Scale,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch live metrics and latest active notices in parallel
  const [
    playersCountRes,
    districtsCountRes,
    tournamentsCountRes,
    refereesCountRes,
    noticesRes,
  ] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("districts").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("referees").select("id", { count: "exact", head: true }),
    supabase
      .from("notices")
      .select("id, title, category, published_date, file_path")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const totalPlayers = playersCountRes.count || 27;
  const totalDistricts = districtsCountRes.count || 36;
  const totalTournaments = tournamentsCountRes.count || 2;
  const totalReferees = refereesCountRes.count || 12;
  const latestNotices = noticesRes.data || [];

  return (
    <div className="min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Live Circulars / Ticker Banner */}
        {latestNotices.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EADDFF]/60 border border-[#CAC4D0]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#21005D] text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                <Bell className="w-3 h-3 text-amber-300 animate-pulse" />
                नवीन परिपत्रक
              </span>
              <span className="text-xs font-semibold text-[#1C1B1F] line-clamp-1">
                {latestNotices[0].title}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs">
              <span className="text-[11px] text-[#49454F] font-mono">
                {latestNotices[0].published_date || "सत्र २०२६-२७"}
              </span>
              <Link
                href="/association/notices"
                className="text-[#6750A4] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>सर्व सूचना पहा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EADDFF]/70 text-[#21005D] text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#6750A4]" />
            <span>सत्र २०२६-२७ अधिकृत सभासदत्व नोंदणी • ३६ जिल्हे</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1C1B1F] tracking-tight leading-tight">
            खेळ महाराष्ट्राचा, <br />
            <span className="text-[#6750A4]">मान अधिकृत ओळखीचा!</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#49454F] leading-relaxed max-w-2xl mx-auto">
            महाराष्ट्र राज्य खो-खो असोसिएशन अंतर्गत राज्यभरातील सर्व अधिकृत खेळाडू, पंच आणि ३६ जिल्हा संघटनांसाठी केंद्रीकृत डिजिटल पडताळणी प्रणाली.
          </p>
        </div>

        {/* Live Counters Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm">
          <div className="text-center space-y-0.5 border-r border-[#CAC4D0]/40 last:border-none">
            <div className="text-2xl sm:text-3xl font-black text-[#6750A4]">{totalPlayers}</div>
            <div className="text-[11px] font-semibold text-[#49454F]">नोंदणीकृत खेळाडू</div>
          </div>

          <div className="text-center space-y-0.5 border-r border-[#CAC4D0]/40 last:border-none">
            <div className="text-2xl sm:text-3xl font-black text-[#21005D]">{totalDistricts}</div>
            <div className="text-[11px] font-semibold text-[#49454F]">संलग्न जिल्हा संघटना</div>
          </div>

          <div className="text-center space-y-0.5 border-r border-[#CAC4D0]/40 last:border-none">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{totalTournaments}</div>
            <div className="text-[11px] font-semibold text-[#49454F]">सक्रिय राज्य स्पर्धा</div>
          </div>

          <div className="text-center space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{totalReferees}</div>
            <div className="text-[11px] font-semibold text-[#49454F]">प्रमाणित राज्य पंच</div>
          </div>
        </div>

        {/* Main Action Hub Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Module 1: Player Registration */}
          <div className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                <UserPlus className="w-6 h-6 text-[#6750A4]" />
              </div>
              <h2 className="text-lg font-bold text-[#1C1B1F]">खेळाडू नोंदणी (Athlete Registration)</h2>
              <p className="text-xs text-[#49454F] leading-relaxed">
                नवीन खेळाडू सभासदत्व अर्ज सादर करा, आधार व जन्मदाखला तपशील भरा आणि अधिकृत नोंदणी पूर्ण करा.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/register"
                className="w-full h-11 rounded-full bg-[#6750A4] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-xs"
              >
                <span>अर्ज भरा / Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 2: Track ID & Smart Card */}
          <div className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                <IdCard className="w-6 h-6 text-[#6750A4]" />
              </div>
              <h2 className="text-lg font-bold text-[#1C1B1F]">स्थिती व डिजिटल ओळखपत्र</h2>
              <p className="text-xs text-[#49454F] leading-relaxed">
                आपल्या अर्जाची सद्यस्थिती तपासा आणि मान्यताप्राप्त डिजिटल MKKA QR ओळखपत्र प्रिंट व डाऊनलोड करा.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/track"
                className="w-full h-11 rounded-full bg-[#21005D] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#21005D]/90 active:scale-95 transition-all shadow-xs"
              >
                <span>कार्ड शोधा / Track ID Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 3: 36 District Login */}
          <div className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                <Building2 className="w-6 h-6 text-[#6750A4]" />
              </div>
              <h2 className="text-lg font-bold text-[#1C1B1F]">जिल्हा संघटना नियंत्रण कक्ष</h2>
              <p className="text-xs text-[#49454F] leading-relaxed">
                ३६ संलग्न जिल्हा प्रतिनिधींसाठी: खेळाडू यादी पडताळणी, १२-१५ संघ निवड आणि अधिकृत पात्रता प्रमाणपत्र.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/district/login"
                className="w-full h-11 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#D0BCFF] active:scale-95 transition-all shadow-xs"
              >
                <span>जिल्हा कक्ष / District Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 4: Tournaments Calendar */}
          <div className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800">
                <Trophy className="w-6 h-6 text-teal-700" />
              </div>
              <h2 className="text-lg font-bold text-[#1C1B1F]">राज्य स्पर्धा व वेळापत्रक</h2>
              <p className="text-xs text-[#49454F] leading-relaxed">
                सत्र २०२६-२७ मधील अधिकृत राज्य अजिंक्यपद निवड चाचणी स्पर्धा, मैदाने, तारखा आणि जिल्हा संघ सहभाग.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/tournaments"
                className="w-full h-11 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-teal-900 active:scale-95 transition-all shadow-xs"
              >
                <span>स्पर्धा दिनदर्शिका / Tournaments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 5: Referee Registration */}
          <div className="p-6 rounded-[32px] bg-white border border-[#CAC4D0]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-800">
                <Scale className="w-6 h-6 text-amber-700" />
              </div>
              <h2 className="text-lg font-bold text-[#1C1B1F]">पंच व परीक्षक नोंदणी कक्ष</h2>
              <p className="text-xs text-[#49454F] leading-relaxed">
                राज्य व राष्ट्रीय स्तरावरील अधिकृत खो-खो पंचांची नोंदणी, ग्रेड पडताळणी आणि परीक्षा गुण नोंद.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/association/referees"
                className="w-full h-11 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-800 active:scale-95 transition-all shadow-xs"
              >
                <span>पंच नोंदणी / Referee Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 6: State Association Admin */}
          <div className="p-6 rounded-[32px] bg-[#F3EDF7] border border-[#CAC4D0]/50 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
                <ShieldCheck className="w-6 h-6 text-[#6750A4]" />
              </div>
              <h2 className="text-lg font-bold text-[#1C1B1F]">प्रशासकीय नियंत्रण कक्ष</h2>
              <p className="text-xs text-[#49454F] leading-relaxed">
                राज्य असोसिएशन मुख्य ॲडमिन: खेळाडू मान्यता छाननी, ३६ जिल्हा संकेतशब्द व्यवस्थापन, आणि एक्सेल अहवाल.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/association/login"
                className="w-full h-11 rounded-full bg-[#6750A4] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#6750A4]/90 active:scale-95 transition-all shadow-xs"
              >
                <span>डॅशबोर्ड उघडा / Admin Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Rules Note */}
        <div className="p-6 rounded-[28px] bg-white border border-[#CAC4D0]/60 text-center space-y-1.5">
          <div className="text-xs font-bold text-[#1C1B1F]">
            अधिकृत मार्गदर्शक तत्त्वे व नियमपुस्तिका २०२६-२७
          </div>
          <p className="text-[11px] text-[#49454F]">
            खेळाडू जिल्हा प्रतिनिधीत्व नियम, आधार पडताळणी मानके आणि राज्य स्पर्धा निकष.
          </p>
          <div className="pt-1">
            <Link
              href="/tournaments"
              className="text-xs text-[#6750A4] font-bold hover:underline inline-flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>सर्व स्पर्धा वेळापत्रक पहा • ३६ संलग्न जिल्हे</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
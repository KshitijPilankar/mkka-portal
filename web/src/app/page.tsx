import Link from 'next/link';

export const metadata = {
  title: 'महाराष्ट्र राज्य खो-खो असोसिएशन | Maharashtra Kho-Kho Association',
  description: 'Official State Player, Referee & Tournament Registration Web Portal 2026-27',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#CAC4D0]/40 bg-[#F3EDF7]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6750A4] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              MKKA
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-[#1C1B1F]">
                महाराष्ट्र राज्य खो-खो असोसिएशन
              </h1>
              <p className="text-xs text-[#49454F] font-medium">
                Maharashtra Kho-Kho Association (Official State Portal 2026-27)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/tournaments"
              className="px-5 py-2 rounded-full border border-[#6750A4] bg-white text-[#6750A4] text-xs font-bold hover:bg-[#6750A4]/10 transition-all shadow-sm"
            >
              🏆 स्पर्धा / Tournaments
            </Link>
            <Link
              href="/track"
              className="px-5 py-2 rounded-full border border-[#CAC4D0] bg-white text-[#49454F] text-xs font-bold hover:bg-gray-100 transition-all"
            >
              कार्ड शोधा / Track ID Card
            </Link>
            <Link
              href="/association/dashboard"
              className="px-5 py-2 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold hover:bg-[#D0BCFF] transition-all"
            >
              नियंत्रण कक्ष / Admin Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-bold tracking-wide">
            सत्र २०२६-२७ अधिकृत सभासदत्व नोंदणी • ३६ जिल्हे
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1C1B1F] leading-tight">
            खेळ महाराष्ट्राचा, <br className="hidden sm:inline" />
            <span className="text-[#6750A4]">मान अधिकृत ओळखीचा!</span>
          </h2>
          <p className="text-sm md:text-base text-[#49454F] leading-relaxed">
            महाराष्ट्र राज्य खो-खो असोसिएशन अंतर्गत राज्यभरातील सर्व अधिकृत खेळाडू, पंच आणि जिल्हा संघटनांसाठी केंद्रीकृत डिजिटल पडताळणी प्रणाली.
          </p>
        </div>

        {/* 4 Core Action Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Player Registration */}
          <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all border-t-4 border-t-[#6750A4] group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8DEF8] text-[#6750A4] flex items-center justify-center text-2xl font-bold">
                🏃
              </div>
              <h3 className="text-lg font-bold text-[#1C1B1F] group-hover:text-[#6750A4] transition-colors">
                खेळाडू नोंदणी <br />
                <span className="text-xs font-normal text-[#49454F]">Player Registration</span>
              </h3>
              <p className="text-xs text-[#49454F] leading-relaxed">
                नवीन खेळाडू सभासदत्व अर्ज सादर करा, तपशील भरा आणि कागदपत्रे अपलोड करा.
              </p>
            </div>
            <Link
              href="/register/player"
              className="mt-6 w-full text-center py-3 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] active:scale-95 transition-all shadow-sm"
            >
              अर्ज भरा / Register Now →
            </Link>
          </div>

          {/* Card 2: Track ID & Download */}
          <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all border-t-4 border-t-[#006A6A] group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#CCE8E7] text-[#006A6A] flex items-center justify-center text-2xl font-bold">
                🪪
              </div>
              <h3 className="text-lg font-bold text-[#1C1B1F] group-hover:text-[#006A6A] transition-colors">
                स्थिती व डिजिटल कार्ड <br />
                <span className="text-xs font-normal text-[#49454F]">Track Status & Card</span>
              </h3>
              <p className="text-xs text-[#49454F] leading-relaxed">
                आपल्या अर्जाची सद्यस्थिती तपासा आणि मान्यताप्राप्त डिजिटल MKKA ओळखपत्र प्रिंट करा.
              </p>
            </div>
            <Link
              href="/track"
              className="mt-6 w-full text-center py-3 rounded-full bg-[#006A6A] text-white text-xs font-bold hover:bg-[#004f4f] active:scale-95 transition-all shadow-sm"
            >
              कार्ड शोधा / Track Card →
            </Link>
          </div>

          {/* Card 3: Central Admin Dashboard */}
          <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all border-t-4 border-t-[#7B5367] group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD8E9] text-[#7B5367] flex items-center justify-center text-2xl font-bold">
                📊
              </div>
              <h3 className="text-lg font-bold text-[#1C1B1F] group-hover:text-[#7B5367] transition-colors">
                प्रशासकीय नियंत्रण कक्ष <br />
                <span className="text-xs font-normal text-[#49454F]">Admin Dashboard</span>
              </h3>
              <p className="text-xs text-[#49454F] leading-relaxed">
                राज्य व जिल्हा सांख्यिकी, थेट अर्ज आकडेवारी आणि खेळाडू/पंच छाननी व्यवस्थापन.
              </p>
            </div>
            <Link
              href="/association/dashboard"
              className="mt-6 w-full text-center py-3 rounded-full bg-[#7B5367] text-white text-xs font-bold hover:bg-[#623c4f] active:scale-95 transition-all shadow-sm"
            >
              डॅशबोर्ड उघडा / Open Hub →
            </Link>
          </div>

          {/* Card 4: Referee Portal */}
          <div className="bg-white rounded-[32px] border border-[#CAC4D0]/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all border-t-4 border-t-[#8B5000] group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFDDB6] text-[#8B5000] flex items-center justify-center text-2xl font-bold">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-[#1C1B1F] group-hover:text-[#8B5000] transition-colors">
                पंच नोंदणी कक्ष <br />
                <span className="text-xs font-normal text-[#49454F]">Referee Registration</span>
              </h3>
              <p className="text-xs text-[#49454F] leading-relaxed">
                राज्य व राष्ट्रीय स्तरावरील अधिकृत खो-खो पंचांची नोंदणी व परीक्षा ग्रेड नोंद.
              </p>
            </div>
            <Link
              href="/register/referee"
              className="mt-6 w-full text-center py-3 rounded-full bg-[#8B5000] text-white text-xs font-bold hover:bg-[#6c3e00] active:scale-95 transition-all shadow-sm"
            >
              पंच नोंदणी / Referee Form →
            </Link>
          </div>
        </div>

        {/* Association Guidelines Strip */}
        <div className="bg-[#F3EDF7] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#CAC4D0]/40">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-[#1C1B1F] text-sm">
              अधिकृत मार्गदर्शक तत्त्वे व नियमपुस्तिका २०२६-२७
            </h4>
            <p className="text-xs text-[#49454F]">
              खेळाडू जिल्हा प्रतिनिधित्व नियम, आधार पडताळणी मानके आणि राज्य स्पर्धा निकष.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/tournaments"
              className="px-4 py-2 rounded-full bg-[#6750A4] text-white text-xs font-semibold hover:bg-[#523e85] transition-all"
            >
              🏆 सर्व स्पर्धा वेळापत्रक पहा
            </Link>
            <span className="px-4 py-2 rounded-full bg-white text-xs font-semibold text-[#49454F] border border-[#CAC4D0]/40">
              ✓ ३६ संलग्न जिल्हे
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#CAC4D0]/40 bg-[#ECE6F0] py-6 px-6 text-center text-xs text-[#49454F]">
        <p className="font-semibold text-[#1C1B1F]">
          महाराष्ट्र राज्य खो-खो असोसिएशन (Maharashtra Kho-Kho Association)
        </p>
        <p className="mt-1">
          अधिकृत राज्य क्रीडा पोर्टल • All Rights Reserved © 2026-2027
        </p>
      </footer>
    </div>
  );
}
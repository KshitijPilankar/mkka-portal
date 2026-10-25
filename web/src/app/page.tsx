import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F]">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/70 px-4 py-1.5 text-xs font-semibold text-purple-800 shadow-2xs">
            <span>सत्र २०२६-२७ अधिकृत सभासदत्व नोंदणी • ३६ जिल्हे</span>
          </div>

          {/* Heading with gap fix to prevent overlap */}
          <h1 className="mt-8 flex flex-col items-center gap-2 text-3xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl sm:gap-3 leading-normal">
            <span>खेळ महाराष्ट्राचा,</span>
            <span className="text-purple-800">मान अधिकृत ओळखीचा!</span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
            महाराष्ट्र राज्य खो-खो असोसिएशन अंतर्गत राज्यभरातील सर्व अधिकृत खेळाडू,
            पंच आणि जिल्हा संघटनांसाठी केंद्रीकृत डिजिटल पडताळणी प्रणाली.
          </p>
        </div>

        {/* 4 Primary Navigation Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* Card 1: Player Registration */}
          <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div>
              <span className="text-3xl">🏃</span>
              <h2 className="mt-4 text-lg font-bold text-gray-900">खेळाडू नोंदणी</h2>
              <p className="text-xs font-medium text-gray-500">Player Registration</p>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                नवीन खेळाडू सभासदत्व अर्ज सादर करा, तपशील भरा आणि कागदपत्रे अपलोड करा.
              </p>
            </div>
            <Link
              href="/register/player"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#6750A4] py-2.5 text-xs font-semibold text-white transition hover:bg-[#533f85]"
            >
              अर्ज भरा / Register Now →
            </Link>
          </div>

          {/* Card 2: Track Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div>
              <span className="text-3xl">🪪</span>
              <h2 className="mt-4 text-lg font-bold text-gray-900">स्थिती व डिजिटल कार्ड</h2>
              <p className="text-xs font-medium text-gray-500">Track Status & Card</p>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                आपल्या अर्जाची सद्यस्थिती तपासा आणि मान्यताप्राप्त डिजिटल MKKA ओळखपत्र प्रिंट करा.
              </p>
            </div>
            <Link
              href="/track"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#006A6A] py-2.5 text-xs font-semibold text-white transition hover:bg-[#005252]"
            >
              कार्ड शोधा / Track Card →
            </Link>
          </div>

          {/* Card 3: Admin Dashboard */}
          <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div>
              <span className="text-3xl">📊</span>
              <h2 className="mt-4 text-lg font-bold text-gray-900">प्रशासकीय नियंत्रण कक्ष</h2>
              <p className="text-xs font-medium text-gray-500">Admin Dashboard</p>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                राज्य व जिल्हा सांख्यिकी, थेट अर्ज आकडेवारी आणि खेळाडू/पंच छाननी व्यवस्थापन.
              </p>
            </div>
            <Link
              href="/association/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#7D5260] py-2.5 text-xs font-semibold text-white transition hover:bg-[#633f4c]"
            >
              डॅशबोर्ड उघडा / Open Hub →
            </Link>
          </div>

          {/* Card 4: Referee Registration */}
          <div className="flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div>
              <span className="text-3xl">⚖️</span>
              <h2 className="mt-4 text-lg font-bold text-gray-900">पंच नोंदणी कक्ष</h2>
              <p className="text-xs font-medium text-gray-500">Referee Registration</p>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                राज्य व राष्ट्रीय स्तरावरील अधिकृत खो-खो पंचांची नोंदणी व परीक्षा ग्रेड नोंद.
              </p>
            </div>
            <Link
              href="/register/referee"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#8B5000] py-2.5 text-xs font-semibold text-white transition hover:bg-[#704000]"
            >
              पंच नोंदणी / Referee Form →
            </Link>
          </div>

        </div>

        {/* Guidelines / Info Section */}
        <div className="mt-16 rounded-3xl border border-purple-100 bg-white p-6 text-center shadow-xs sm:p-8">
          <h3 className="text-base font-bold text-gray-900">
            अधिकृत मार्गदर्शक तत्त्वे व नियमपुस्तिका २०२६-२७
          </h3>
          <p className="mt-2 text-xs text-gray-600 sm:text-sm">
            खेळाडू जिल्हा प्रतिनिधित्व नियम, आधार पडताळणी मानके आणि राज्य स्पर्धा निकष.
          </p>
          <div className="mt-4">
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 underline underline-offset-4 hover:text-purple-900"
            >
              <span>🏆</span>
              <span>सर्व स्पर्धा वेळापत्रक पहा • ३६ संलग्न जिल्हे</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
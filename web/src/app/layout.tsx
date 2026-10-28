import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA)",
  description: "Maharashtra Kho-Kho Association - Official State Portal 2026-27",
  icons: {
    icon: "/mkka-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#FDF8FD] text-[#1C1B1F] antialiased selection:bg-purple-100 selection:text-purple-900"
        suppressHydrationWarning
      >
        {/* Top Official Header */}
        <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

            {/* Left: Official Logo + Association Typography */}
            <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-purple-200 bg-white shadow-xs">
                <Image
                  src="/mkka-logo.png"
                  alt="महाराष्ट्र राज्य खो-खो असोसिएशन अधिकृत लोगो"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
                  महाराष्ट्र राज्य खो-खो असोसिएशन
                </span>
                <span className="text-xs font-medium text-gray-500 sm:text-xs">
                  Maharashtra Kho-Kho Association (Official State Portal 2026-27)
                </span>
              </div>
            </Link>

            {/* Right: Quick Action Navigation */}
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/tournaments"
                className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-800 transition hover:bg-purple-100 hover:shadow-xs"
              >
                <span>🏆</span>
                <span>स्पर्धा / Tournaments</span>
              </Link>
              <Link
                href="/track"
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-purple-700"
              >
                कार्ड शोधा / Track ID Card
              </Link>
              <Link
                href="/association/dashboard"
                className="rounded-full bg-purple-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-purple-900"
              >
                नियंत्रण कक्ष / Admin Dashboard
              </Link>
            </nav>

          </div>
        </header>

        {/* Main Page Content */}
        <main>{children}</main>

        {/* Official Footer */}
        <footer className="mt-16 border-t border-purple-100 bg-white py-6 text-center text-xs text-gray-500">
          <p>© 2026-2027 महाराष्ट्र राज्य खो-खो असोसिएशन (MKKA) • सर्व हक्क राखीव</p>
        </footer>
      </body>
    </html>
  );
}
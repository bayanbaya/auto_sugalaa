import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/NavBar";
import MainWrapper from "./components/MainWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MB Sugalaa",
  description: "Сугалааны код шалгах",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-white relative overflow-x-hidden bg-black`}
      >
        {/* World-Class Background System - Refined & Sophisticated */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Pure black base - Premium foundation */}
          <div className="absolute inset-0 bg-black" />

          {/* Subtle gradient overlay - Depth without distraction */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black opacity-80" />

          {/* Refined ambient orbs - Minimal, purposeful */}
          <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-[128px] animate-float" />
          <div
            className="absolute top-1/4 -right-40 w-80 h-80 bg-yellow-500/[0.02] rounded-full blur-[96px] animate-float"
            style={{ animationDelay: '1.5s', animationDuration: '4s' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[32rem] h-[32rem] bg-amber-600/[0.02] rounded-full blur-[128px] animate-float"
            style={{ animationDelay: '3s', animationDuration: '5s' }}
          />

          {/* Subtle noise texture - Premium grain */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-20 mix-blend-soft-light" />

          {/* Minimal grid - Subtle structure */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-30" />

          {/* Top fade - Clean header transition */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Content - Pixel-perfect structure */}
        <div className="relative z-0 flex flex-col min-h-screen">
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
        </div>
      </body>
    </html>
  );
}

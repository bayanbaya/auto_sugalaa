// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/NavBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MB Sugalaa",
  description: "Сугалааны код шалгах",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-white`}>
        <Navbar />
        <main className="flex-grow px-6 py-12 pt-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

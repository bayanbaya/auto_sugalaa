"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // /add route дээр Navbar нуух
  if (pathname.startsWith("/add") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Лого ба Нэр */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.svg"
            alt="MB Auto Худалдаа лого"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-white text-lg sm:text-xl font-bold">
            MB Авто Худалдаа
          </span>
        </Link>

        {/* Ирээдүйд нэмэх цэс (optional) */}
        {/* 
        <div className="hidden sm:flex space-x-6">
          <Link href="/about" className="text-white/80 hover:text-white text-sm">Бидний тухай</Link>
        </div> 
        */}
      </div>
    </nav>
  );
}

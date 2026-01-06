"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // /add route дээр Navbar нуух
  if (pathname.startsWith("/add") || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 backdrop-blur-2xl bg-black/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-all duration-300">
                <Image
                  src="/logo.svg"
                  alt="MB Auto Худалдаа лого"
                  width={28}
                  height={28}
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain brightness-0"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-white text-base sm:text-lg lg:text-xl font-bold tracking-tight group-hover:text-yellow-400 transition-colors duration-300">
                MB Авто Худалдаа
              </span>
              <span className="text-[10px] sm:text-xs text-white/40 font-medium tracking-wider uppercase hidden sm:block">
                Premium Lottery
              </span>
            </div>
          </Link>

          {/* Right Side - Login Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/admin/login"
              className="group relative"
            >
              {/* Glow on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

              <div className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-95">
                <LogIn className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="text-xs sm:text-sm font-semibold text-white/80 group-hover:text-white transition-colors hidden xs:inline">
                  Нэвтрэх
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
    </nav>
  );
}

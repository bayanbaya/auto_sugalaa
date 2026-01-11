"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // /add route дээр Navbar нуух
  if (pathname.startsWith("/add") || pathname.startsWith("/admin") || pathname.startsWith("/login")
  || pathname.startsWith("/admin/error-tran") || pathname.startsWith("/login/all-lottery") || pathname.startsWith("/login/all-lottery") || pathname.startsWith("/admin/all-tran") ) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] backdrop-blur-xl bg-black/60 supports-[backdrop-filter]:bg-black/40">
      {/* Container - Perfect spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand - Refined hierarchy */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Logo container - Premium treatment */}
            <div className="relative">
              {/* Subtle glow - Only on hover */}
              <div className="absolute -inset-1 bg-amber-400/0 group-hover:bg-amber-400/20 rounded-xl blur-lg transition-all duration-300" />

              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1px] shadow-lg shadow-black/20">
                <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                  <Image
                    src="/logo.svg"
                    alt="MB Auto Худалдаа лого"
                    width={24}
                    height={24}
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain brightness-0"
                  />
                </div>
              </div>
            </div>

            {/* Brand text - Clean typography */}
            <div className="flex flex-col -space-y-0.5">
              <span className="text-white text-[15px] sm:text-base font-semibold tracking-[-0.01em] leading-none group-hover:text-amber-400 transition-colors duration-200">
                MB Авто Худалдаа
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-wide leading-none hidden sm:block">
                PREMIUM LOTTERY
              </span>
            </div>
          </Link>

          {/* Right Side - Login Button - Minimal design */}
          <div className="flex items-center">
            <Link
              href="/admin/login"
              className="group relative inline-flex items-center gap-2 px-3 sm:px-3.5 h-9 sm:h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200 ease-out active:scale-[0.97]"
            >
              <LogIn className="w-[15px] h-[15px] sm:w-4 sm:h-4 text-zinc-400 group-hover:text-white transition-colors duration-200" />
              <span className="text-[13px] sm:text-sm font-medium text-zinc-400 group-hover:text-white transition-colors duration-200 hidden xs:inline">
                Нэвтрэх
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle bottom border - Premium detail */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </nav>
  );
}

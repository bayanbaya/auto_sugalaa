"use client";
import { usePathname } from "next/navigation";
import { Heart, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // /add route дээр Footer нуух
  if (pathname.startsWith("/add") || pathname.startsWith("/admin") || pathname.startsWith("/login")
  || pathname.startsWith("/admin/error-tran") || pathname.startsWith("/login/all-lottery") || pathname.startsWith("/login/all-lottery") || pathname.startsWith("/admin/all-tran")) {
    return null;
  }

  return (
    <footer className="relative mt-auto border-t border-white/[0.06] bg-zinc-950/30 backdrop-blur-xl">
      {/* Subtle top border - Premium detail */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Main container - Precise spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-16">

          {/* Brand Section - Refined typography */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1px]">
                <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-[-0.01em]">MB Авто Худалдаа</h3>
                <p className="text-[11px] text-zinc-500 font-medium tracking-wide">PREMIUM LOTTERY</p>
              </div>
            </div>
            <p className="text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
              Монголын хамгийн том, найдвартай автомашины сугалаа.
              Таны мөрөөдлийг бодит болгох найдвартай түнш.
            </p>
          </div>

          {/* Contact Section - Clean layout */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Холбоо барих</h4>
            <div className="space-y-3">
              <a
                href="tel:+97699431042"
                className="group flex items-center gap-3 text-[13px] sm:text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.06] group-hover:border-white/10 transition-all duration-200">
                  <Phone className="w-[15px] h-[15px]" />
                </div>
                <span>+976 9943-1042</span>
              </a>

              <a
                href="mailto:info@mbsugalaa.mn"
                className="group flex items-center gap-3 text-[13px] sm:text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.06] group-hover:border-white/10 transition-all duration-200">
                  <Mail className="w-[15px] h-[15px]" />
                </div>
                <span>info@mbsugalaa.mn</span>
              </a>

              <div className="flex items-start gap-3 text-[13px] sm:text-sm text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <MapPin className="w-[15px] h-[15px]" />
                </div>
                <span className="pt-1.5">Улаанбаатар, Монгол Улс</span>
              </div>
            </div>
          </div>

          {/* CTA Section - Premium button */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Вэбсайт хэрэгтэй юу?</h4>
            <p className="text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
              Таны бизнест тохирсон, мэргэжлийн вэбсайт бүтээх үйлчилгээ үзүүлнэ.
            </p>
            <a
              href="tel:+97699431042"
              className="group relative inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 ease-out active:scale-[0.97]"
            >
              <Phone className="w-[15px] h-[15px]" />
              <span>Залгаад захиалаарай</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom Section - Minimal */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright - Subtle */}
            <p className="text-xs text-zinc-500 text-center sm:text-left">
              © {year} MB Sugalaa. Бүх эрх хуулиар хамгаалагдсан.
            </p>

            {/* Social Links - Minimal */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 flex items-center justify-center transition-all duration-200 group"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-[15px] h-[15px] text-zinc-500 group-hover:text-white transition-colors duration-200"
                  fill="currentColor"
                >
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495V14.708h-3.13v-3.622h3.13V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badge - Subtle accent */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
          <span>Найдвартай, аюулгүй үйлчилгээ</span>
        </div>
      </div>
    </footer>
  );
}

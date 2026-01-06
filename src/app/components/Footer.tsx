"use client";
import { usePathname } from "next/navigation";
import { Heart, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // /add route дээр Footer нуух
  if (pathname.startsWith("/add") || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-black/20 backdrop-blur-xl">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Heart className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">MB Авто Худалдаа</h3>
                <p className="text-xs text-white/40">Premium Lottery Service</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Монголын хамгийн том, найдвартай автомашины сугалаа.
              Таны мөрөөдлийг бодит болгох найдвартай түнш.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Холбоо барих</h4>
            <div className="space-y-3">
              <a
                href="tel:+97699431042"
                className="group flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+976 9943-1042</span>
              </a>

              <a
                href="mailto:info@mbsugalaa.mn"
                className="group flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@mbsugalaa.mn</span>
              </a>

              <div className="flex items-start gap-3 text-sm text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-1">Улаанбаатар, Монгол Улс</span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Вэбсайт хэрэгтэй юу?</h4>
            <p className="text-sm text-white/60 leading-relaxed">
              Таны бизнест тохирсон, мэргэжлийн вэбсайт бүтээх үйлчилгээ үзүүлнэ.
            </p>
            <a
              href="tel:+97699431042"
              className="group relative inline-flex"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm sm:text-base shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 active:scale-95">
                <Phone className="w-4 h-4" />
                <span>Залгаад захиалаарай</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs sm:text-sm text-white/40 text-center sm:text-left">
              © {year} MB Sugalaa. Бүх эрх хуулиар хамгаалагдсан.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white/40 group-hover:text-white transition-colors"
                  fill="currentColor"
                >
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495V14.708h-3.13v-3.622h3.13V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-xs text-white/30">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Найдвартай, аюулгүй үйлчилгээ</span>
        </div>
      </div>
    </footer>
  );
}

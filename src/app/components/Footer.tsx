"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // /add route дээр Footer нуух
  if (pathname.startsWith("/add") || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <footer className="py-6 text-sm text-white/60">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-center">
          © {year} MB Sugalaa. Бүх эрх хуулиар хамгаалагдсан.
        </p>

        <a
          href="tel:+97699431042"
          className="group inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 border border-white/20 hover:bg-white/15 hover:border-white/40 transition text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 opacity-80 group-hover:opacity-100"
            fill="currentColor"
          >
            <path d="M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.5 2.7.8 4.1.8.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3c0-.6.4-1 1-1h2.2c.6 0 1 .4 1 1 0 1.4.3 2.8.8 4.1.1.4 0 .9-.2 1.2L6.6 10.8z" />
          </svg>
          <span className="font-semibold">Хүссэн website-аа залгаад хийлгээрэй</span>
          <span className="opacity-80">99431042</span>
        </a>
      </div>
    </footer>
  );
}

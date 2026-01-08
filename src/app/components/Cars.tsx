"use client";

import Image from "next/image";
import React, { useState, useEffect, memo } from "react";
import { Copy, CheckCircle, ExternalLink, Car as CarIcon, TrendingUp, AlertCircle, Sparkles, DollarSign, Ticket } from "lucide-react";

export type Car = {
  id?: string;
  carName: string;
  img: string;
  iban: string;
  ibanName?: string;
  price?: string | number;
  fbLink?: string;
  total?: string | number;
  sold?: string | number;
  fill?: number;
};

// --- Utilities ---
const FALLBACK_IMG = "/aldaa_car.png";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Abortable fetch with timeout + retry
async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
  retries = 2,
  backoffMs = 600
) {
  const { timeoutMs = 8000, ...rest } = init;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...rest, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status} ${res.statusText} :: ${text?.slice(0, 200)}`);
      if (retries > 0 && res.status >= 500) {
        await new Promise((r) => setTimeout(r, backoffMs));
        return fetchWithRetry(input, init, retries - 1, Math.min(backoffMs * 2, 5000));
      }
      throw err;
    }
    try {
      return await res.json();
    } catch {
      throw new Error("Invalid JSON received from /api/cars");
    }
  } catch (e) {
    let isAbort = false;
    let msg = "";
    if (e && typeof e === "object") {
      const maybe = e as { name?: string; message?: string };
      isAbort = maybe.name === "AbortError";
      if (typeof maybe.message === "string") msg = maybe.message;
    }
    if (retries > 0 && (isAbort || msg.includes("NetworkError") || msg.includes("Failed to fetch"))) {
      await new Promise((r) => setTimeout(r, backoffMs));
      return fetchWithRetry(input, init, retries - 1, Math.min(backoffMs * 2, 5000));
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// --- Error Boundary ---
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("Cars component crashed", { error, info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Алдаа гарлаа</h2>
          <p className="text-red-200/80 text-sm sm:text-base">
            Компонент дотор асуудал илэрсэн. Хуудас шинэчилнэ үү.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- CarCard ---
const CarCard = memo(function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState(car.img || FALLBACK_IMG);
  const [imgErrored, setImgErrored] = useState(false);

  const total = Number(car.total ?? 0);
  const sold = Number(car.sold ?? 0);
  const left = Math.max(0, total - sold);
  const percent = total > 0 ? Math.round((sold / total) * 100) : 0;

  // Progress color based on availability
  const getProgressColor = () => {
    if (percent >= 90) return "from-red-500 to-red-600";
    if (percent >= 70) return "from-orange-500 to-orange-600";
    if (percent >= 50) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  useEffect(() => {
    setImgSrc(car.img || FALLBACK_IMG);
    setImgErrored(false);
  }, [car.img]);

  const copy = async () => {
    try {
      if (!car?.iban) throw new Error("IBAN хоосон байна");
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(car.iban);
      } else {
        const ta = document.createElement("textarea");
        ta.value = car.iban;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
      alert("IBAN хуулж чадсангүй. Гараар хуулна уу.");
    }
  };

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_IMG) {
      setImgSrc(FALLBACK_IMG);
      setImgErrored(true);
    }
  };

  return (
    <li className="group relative">
      {/* Animated gradient glow - Yellow/Gold theme */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-2xl sm:rounded-[2rem] opacity-0 group-hover:opacity-30 blur transition-all duration-500 animate-gradient bg-[length:200%_auto]" />

      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-yellow-400/20 transition-all duration-500 hover:border-white/20">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <Image
            src={imgSrc}
            alt={car.carName || "Car"}
            width={960}
            height={640}
            className={classNames(
              "aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105",
              imgErrored && "opacity-90"
            )}
            placeholder="blur"
            blurDataURL="/blur/placeholder-24px.jpg"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={handleImageError}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Car name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-lg">
              {car.carName || "Тодорхойгүй нэр"}
            </h3>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-base sm:text-lg font-bold text-yellow-400">
                {String(car.price ?? "—")}₮
              </span>
            </div>
          </div>

          {/* Availability badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div className={classNames(
              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-xl border flex items-center gap-2 shadow-lg",
              left > 0
                ? "bg-green-500/20 border-green-400/30"
                : "bg-red-500/20 border-red-400/30"
            )}>
              <Ticket className={classNames(
                "w-3.5 h-3.5 sm:w-4 sm:h-4",
                left > 0 ? "text-green-400" : "text-red-400"
              )} />
              <span className={classNames(
                "text-xs sm:text-sm font-bold",
                left > 0 ? "text-green-400" : "text-red-400"
              )}>
                {left} үлдсэн
              </span>
            </div>
          </div>

          {/* Premium badge if low stock */}
          {left > 0 && left <= 3 && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-yellow-400/90 backdrop-blur-xl border border-yellow-300/50 flex items-center gap-1.5 shadow-lg animate-pulse">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                <span className="text-xs sm:text-sm font-bold text-black">
                  Цөөн үлдсэн
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
          {/* Progress Section - Moved to top */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                <span>
                  <span className="font-bold text-white">{sold}</span> / {total} зарагдсан
                </span>
              </div>
              <span className="font-bold text-yellow-400">{percent}%</span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden relative"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className={classNames(
                  "h-full rounded-full transition-all duration-700 bg-gradient-to-r relative overflow-hidden",
                  getProgressColor()
                )}
                style={{ width: `${percent}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* IBAN Section - Redesigned */}
          <div className="relative">
            <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 space-y-2.5 hover:bg-white/[0.07] hover:border-yellow-400/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider font-bold">
                  Дансны дугаар
                </span>
                <button
                  onClick={copy}
                  className={classNames(
                    "flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg font-bold text-xs transition-all duration-300 active:scale-95",
                    copied
                      ? "bg-yellow-400 text-black"
                      : "bg-white/10 hover:bg-yellow-400 hover:text-black text-white"
                  )}
                  aria-label="IBAN хуулах"
                  type="button"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Хуулсан
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Хуулах
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-sm sm:text-base lg:text-lg text-white font-bold break-all tracking-wider">
                {car.iban || "—"}
              </p>
              {car.ibanName && (
                <p className="text-xs text-white/50 pt-1 border-t border-white/5">
                  {car.ibanName}
                </p>
              )}
            </div>
          </div>

          {/* Facebook Link Button - Redesigned */}
          {car.fbLink && (
            <a
              href={car.fbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn block"
            >
              <div className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-black font-bold text-sm sm:text-base text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/50 active:scale-[0.98] hover:scale-[1.02]">
                <span>Дэлгэрэнгүй үзэх</span>
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </div>
            </a>
          )}
        </div>
      </div>
    </li>
  );
});

// --- Main ---
export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const isEmpty = !loading && !err && cars.length === 0;

  const loadCars = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = (await fetchWithRetry("/api/cars", { timeoutMs: 8000 }, 2)) as Car[];
      if (!Array.isArray(data)) throw new Error("Өгөгдөл буруу форматаар ирлээ (array биш)");
      setCars(data);
    } catch (e) {
      console.error("Failed to load cars", e);
      setErr("Машины жагсаалтыг татаж чадсангүй.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await loadCars();
      } finally {
        if (!alive) return;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Header Skeleton */}
        <div className="space-y-3 sm:space-y-4">
          <div className="h-10 sm:h-12 w-72 sm:w-96 bg-white/10 rounded-2xl animate-pulse" />
          <div className="h-4 w-56 bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-[2rem] overflow-hidden"
            >
              <div className="aspect-[16/10] bg-white/10 animate-pulse" />
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-3 bg-white/5 rounded-full animate-pulse" />
                <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
                <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Алдаа гарлаа</h3>
              <p className="text-sm sm:text-base text-red-200/80">{err}</p>
            </div>
            <button
              onClick={loadCars}
              type="button"
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300 active:scale-95"
            >
              Дахин оролдох
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleErrorBoundary>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Header - Redesigned */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl" />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <CarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Сугалаанд оролцох
              </h2>
            </div>
          </div>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed ml-0 sm:ml-[72px]">
            Доорх машинуудын данс руу гүйлгээ хийж сугалаанд оролцоорой. Гүйлгээний утга дээр <span className="font-bold text-yellow-400">утасны дугаараа</span> бичнэ үү.
          </p>
        </div>

        {/* Empty State - Redesigned */}
        {isEmpty && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-[2rem] p-10 sm:p-16 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white/10 border border-white/10 flex items-center justify-center mb-6">
              <CarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white/40" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Одоогоор машин байхгүй байна
            </h3>
            <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto">
              Удахгүй шинэ машинууд нэмэгдэх тул дахин зочилно уу
            </p>
          </div>
        )}

        {/* Cars Grid - Updated spacing */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {cars.map((car, i) => (
            <CarCard key={car.id || `${car.iban}-${car.carName}-${i}`} car={car} priority={i < 2} />
          ))}
        </ul>
      </div>
    </SimpleErrorBoundary>
  );
}

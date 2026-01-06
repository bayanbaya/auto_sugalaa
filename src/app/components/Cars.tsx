"use client";

import Image from "next/image";
import React, { useState, useEffect, memo } from "react";
import { Copy, CheckCircle, ExternalLink, Car as CarIcon, TrendingUp, AlertCircle } from "lucide-react";

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
      {/* Animated gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-40 blur-sm transition-all duration-500 animate-gradient bg-[length:200%_auto]" />

      <div className="relative bg-gradient-to-br from-[#1a1a1c] to-[#121214] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <Image
            src={imgSrc}
            alt={car.carName || "Car"}
            width={960}
            height={640}
            className={classNames(
              "aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-110",
              imgErrored && "opacity-90"
            )}
            placeholder="blur"
            blurDataURL="/blur/placeholder-24px.jpg"
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={handleImageError}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Availability badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${left > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white text-xs sm:text-sm font-bold">
                {left} үлдсэн
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Car Name & Price */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CarIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="truncate">{car.carName || "Тодорхойгүй нэр"}</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-white/60">Үнэ:</span>
              <span className="text-lg sm:text-xl font-bold text-green-400">
                {String(car.price ?? "—")}₮
              </span>
            </div>
          </div>

          {/* IBAN Section */}
          <div className="space-y-2">
            <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Данс</span>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-blue-400 hover:text-black text-white transition-all duration-300 text-xs font-medium active:scale-95"
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
              <p className="font-mono text-sm sm:text-base text-white font-medium break-all">
                {car.iban || "—"}
              </p>
              {copied && car.ibanName && (
                <p className="text-xs text-green-400 animate-in fade-in slide-in-from-top-2 duration-300">
                  ✓ Дансны нэр: {car.ibanName}
                </p>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <TrendingUp className="w-4 h-4" />
                <span>
                  <span className="font-bold text-white">{sold}</span> / {total} зарагдсан
                </span>
              </div>
              <span className="font-bold text-blue-400">{percent}%</span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-2.5 sm:h-3 rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className={classNames(
                  "h-full rounded-full transition-all duration-700 bg-gradient-to-r",
                  getProgressColor()
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Facebook Link Button */}
          {car.fbLink && (
            <a
              href={car.fbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn block"
            >
              <div className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm sm:text-base text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 active:scale-95">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110"
                  fill="currentColor"
                >
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495V14.708h-3.13v-3.622h3.13V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
                <span>Дэлгэрэнгүй</span>
                <ExternalLink className="w-4 h-4" />
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 sm:h-10 w-64 sm:w-80 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden"
            >
              <div className="aspect-[3/2] bg-white/10 animate-pulse" />
              <div className="p-5 sm:p-6 space-y-4">
                <div className="h-6 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 bg-white/5 rounded-lg animate-pulse w-3/4" />
                <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
                <div className="h-3 bg-white/5 rounded-full animate-pulse" />
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <CarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span>Зарлагдсан машинууд</span>
          </h2>
          <p className="text-sm sm:text-base text-white/50 ml-0 sm:ml-[60px]">
            Доорх данс руу гүйлгээ хийж сугалаанд оролцоорой
          </p>
        </div>

        {/* Empty State */}
        {isEmpty && (
          <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
              <CarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Машин байхгүй байна
            </h3>
            <p className="text-sm sm:text-base text-white/50">
              Дараа дахин шалгана уу
            </p>
          </div>
        )}

        {/* Cars Grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {cars.map((car, i) => (
            <CarCard key={car.id || `${car.iban}-${car.carName}-${i}`} car={car} priority={i < 2} />
          ))}
        </ul>
      </div>
    </SimpleErrorBoundary>
  );
}

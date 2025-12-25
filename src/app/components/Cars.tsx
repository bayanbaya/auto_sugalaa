"use client";

import Image from "next/image";
import React, { useState, useEffect, memo } from "react";

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
        <section className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">⚠️ Алдаа гарлаа</h2>
          <p className="text-yellow-200">
            Компонент дотор асуудал илэрсэн тул түр зогслоо. Дахин сэргээх бол хуудас шинэчилнэ үү.
          </p>
        </section>
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

  // Өнгө сонгох
  const progressColor =
    percent < 30 ? "#da9b27ff" : percent < 50 ? "#ffd54f" : "#4caf50";

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
      setTimeout(() => setCopied(false), 1500);
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
    <li className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-800 group transition-transform hover:scale-[1.02]">
      <Image
        src={imgSrc}
        alt={car.carName || "Car"}
        width={960}
        height={640}
        className={classNames("aspect-[3/2] w-full object-cover", imgErrored && "opacity-90")}
        placeholder="blur"
        blurDataURL="/blur/placeholder-24px.jpg"
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={handleImageError}
      />

      <div className="bg-white/10 backdrop-blur-md p-4 text-white space-y-3">
        <div className="text-center">
          <span className="block text-base font-semibold text-yellow-300">
            {car.carName || "Тодорхойгүй нэр"} &nbsp;{" "}
            <span className="font-bold text-green-300">{String(car.price ?? "—")}</span>
          </span>

          <span className="block text-sm font-mono tracking-wide bg-white/30 text-white px-3 py-1 rounded-lg inline-block mt-1">
            {car.iban || "—"}
          </span>

          <button
            onClick={copy}
            className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-200 hover:text-white underline"
            aria-label="IBAN хуулах"
            type="button"
          >
            <Image src="/copy.svg" alt="" width={20} height={20} />
            Хуулах
          </button>

          {copied && (
            <span className="block text-green-300 text-xs mt-1">
              ✅ Хуулсан! Дансны нэр : {car.ibanName || "—"}
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-white/80 mb-1">
            <span>
              {total} - {sold} = <b>{left}</b> ш эрх үлдлээ
            </span>
            <span>{percent}%</span>
          </div>

          <div
            className="w-full h-3.5 rounded-full bg-white/20 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5">
          <a
            href={car.fbLink || "#"}
            target={car.fbLink ? "_blank" : undefined}
            rel={car.fbLink ? "noopener noreferrer" : undefined}
            aria-disabled={!car.fbLink}
            className="w-full"
          >
            <div
              className={classNames(
                "group w-full text-sm sm:text-base rounded-xl py-3 font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-md",
                "hover:from-blue-500 hover:to-blue-400 hover:shadow-lg",
                !car.fbLink && "opacity-60 cursor-not-allowed"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                fill="currentColor"
              >
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495V14.708h-3.13v-3.622h3.13V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.314h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
              <span className="align-middle">Дэлгэрэнгүй мэдээлэл</span>
            </div>
          </a>
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
  const [debug, setDebug] = useState<string | null>(null);

  const isEmpty = !loading && !err && cars.length === 0;

  const loadCars = async () => {
    setLoading(true);
    setErr(null);
    setDebug(null);
    try {
      const data = (await fetchWithRetry("/api/cars", { timeoutMs: 8000 }, 2)) as Car[];
      if (!Array.isArray(data)) throw new Error("Өгөгдөл буруу форматаар ирлээ (array биш)");
      setCars(data);
      if (data.length === 0) setDebug("API амжилттай боловч хоосон жагсаалт буцав.");
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
      <section className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 text-center sm:text-left">
          🚗 Одоогоор манайд зарлагдсан машинууд
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white/10 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (err) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Алдаа</h2>
        <div className="rounded-lg border border-yellow-400 bg-yellow-50/10 p-4 text-yellow-200">
          <p className="mb-2">{err}</p>
          <div className="flex gap-2">
            <button
              onClick={loadCars}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-300 text-gray-900 px-4 py-2 font-semibold hover:bg-yellow-200"
            >
              Дахин оролдох
            </button>
            <button
              onClick={() => setDebug((d) => (d ? null : "Алдааны дэлгэрэнгүйг консол дээр шалгана уу."))}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
            >
              Дэлгэрэнгүй
            </button>
          </div>
          {debug && <p className="mt-2 text-xs opacity-80">{debug}</p>}
        </div>
      </section>
    );
  }

  return (
    <SimpleErrorBoundary>
      <section className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 text-center sm:text-left">
          🚗 Одоогоор манайд зарлагдсан машинууд
        </h2>

        <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded mb-6 shadow-md text-sm">
          <strong>Санамж:</strong> Сугалаанд оролцохыг хүсвэл та доорх данс руу гүйлгээ хийнэ үү.
        </div>

        {isEmpty && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white">
            Одоогоор машин байхгүй байна. Дараа дахин шалгана уу.
          </div>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car, i) => (
            <CarCard key={car.id || `${car.iban}-${car.carName}-${i}`} car={car} priority={i < 2} />
          ))}
        </ul>
      </section>
    </SimpleErrorBoundary>
  );
}
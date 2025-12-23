import Cars from "./components/Cars";

export default function Home() {
  return (
    <>
<section className="container mx-auto mt-10 sm:mt-16 px-4 grid gap-10 lg:grid-cols-2">
  {/* Зүүн тал */}
  <div>
    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-widest">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
      Шууд шалгах — 24/7
    </div>

    <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-snug text-white text-center sm:text-left">
      Утасны дугаараар{' '}
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200">
        код шалгах
      </span>
    </h1>

    <p className="mt-3 text-white/70 max-w-xl leading-relaxed text-sm sm:text-base text-center sm:text-left">
      Таны худалдан авсан сугалааны кодыг аюулгүй, шуурхай баталгаажуулна. Ил тод тайлан.
    </p>
  </div>

  {/* Баруун тал */}
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-2xl">
    <h3 className="text-2xl font-extrabold mb-4 text-yellow-300 tracking-wide">Код шалгах</h3>

    <div className="mb-6 flex items-center gap-3">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-glow animate-pulse text-xl">
        🛎️
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Код шалгах</h2>
        <p className="text-xs text-white/60">Утасны дугаараа шалгаарай</p>
      </div>
    </div>

    <a
      target="_blank"
      href="https://docs.google.com/spreadsheets/d/1LjPholQLpQ45hlujAin4JUm_eNe5pBYuQB8i3Ac_zTc/edit?gid=421356323#gid=421356323"
      rel="noopener noreferrer"
      className="block"
    >
      <button
        type="button"
        className="w-full text-sm sm:text-base rounded-xl py-3 font-semibold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 shadow-md hover:shadow-lg hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300 flex items-center justify-center gap-2"
      >
        Google sheet-ээс сугалаа ХАЙХ
      </button>
    </a>
  </div>
{/* Доорх мэдээллийн хэсэг */}

<div className="space-y-8 mt-0 lg:mt-10 lg:space-y-0 lg:flex lg:gap-8 lg:col-span-2">
  {/* Азын ерөөл */}
  <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-2xl">
    <h3 className="text-2xl font-extrabold mb-4 text-yellow-300 tracking-wide">Сугалааны Мэдээлэл</h3>
    <ul className="space-y-2 sm:space-y-3  text-gray-100 text-[14px] leading-relaxed">
      <li className="flex items-start gap-2">✅ Таныг азын бурхан тэнгэр ивээх болтугай</li>
      <li className="flex items-start gap-2">✅ Сугалаа болгон өөр өөр данстай</li>
       <li className="flex items-start gap-2">✅ Гүйлгээний утга: утасны дугаар бичнэ үү.</li>
    </ul>
  </div>

  {/* Буцах / Шилжүүлэх хэсэг */}
  <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-2xl">
    <h3 className="text-2xl font-extrabold mb-4 text-yellow-300 tracking-wide">Сугалаа буцааж болох уу?</h3>
    <div className=" space-y-2 sm:space-y-3  text-gray-100 text-[14px] leading-relaxed">
      <p>
        <strong>Сугалаа буцааж болох уу?</strong> Хариулт: Боломжгүй. Таны авсан сугалаа google шийтэд шивэгдэж дэс дарааллаар орсон тул{' '}
        <span className="text-red-400 font-semibold">БУЦААХ БОЛОМЖГҮЙ.</span>
      </p>
      <p>
        <strong>Сугалаа шилжүүлж болох уу?</strong> Хариулт: Боломжгүй ээ. Сугалаа болгон өөр өөр дансаар явагддаг.
      </p>
    </div>
  </div>
</div>


</section>

{/* Машинуудыг харуулах хэсэг */}
<div className="mt-8">
  <Cars />
</div>

    </>
  );
}

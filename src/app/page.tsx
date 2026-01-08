import Cars from "./components/Cars";
import LotteryChecker from "./components/LotteryChecker";
import { Sparkles, Shield, Ban, ArrowRightLeft, Info, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <>
      <LotteryChecker />

      {/* Information Cards Section - Redesigned */}
      

      {/* Cars Section with improved spacing */}
      <section className="container mx-auto mt-8 sm:mt-12 lg:mt-16 px-4 sm:px-6 lg:px-8">
        <Cars />
      </section>

      {/* Information Cards Section - World-Class Polish */}
      <section className="container mx-auto mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Lottery Information Card - Premium Refinement */}
          <div className="group relative">
            {/* Subtle hover glow - Minimal */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-400/10 to-yellow-600/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

            <div className="relative bg-zinc-950/50 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
              {/* Refined ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-3xl" />

              <div className="relative space-y-6">
                {/* Header - Clean hierarchy */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1px] transition-transform duration-200 group-hover:scale-105">
                    <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white tracking-[-0.01em]">
                      Сугалааны Мэдээлэл
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 font-medium">
                      Танд мэдэхэд зайлшгүй
                    </p>
                  </div>
                </div>

                {/* Information items - Refined */}
                <div className="space-y-3">
                  {[
                    { icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />, text: "Таныг азын бурхан тэнгэр ивээх болтугай" },
                    { icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />, text: "Сугалаа болгон өөр өөр данстай" },
                    { icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />, text: "Гүйлгээний утга: утасны дугаар бичнэ үү" }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 sm:p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group/item"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-400/5 border border-amber-400/10 flex items-center justify-center group-hover/item:bg-amber-400/10 transition-colors duration-200">
                        {item.icon}
                      </div>
                      <p className="text-[13px] sm:text-sm text-zinc-300 leading-relaxed pt-1.5">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom accent - Subtle */}
                <div className="pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                    <span className="text-xs font-medium">Ил тод, найдвартай үйлчилгээ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Card - Premium Refinement */}
          <div className="group relative">
            {/* Subtle hover glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-rose-400/10 to-orange-600/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

            <div className="relative bg-zinc-950/50 border border-white/[0.06] rounded-2xl p-6 sm:p-8 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.03] rounded-full blur-3xl" />

              <div className="relative space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-400 via-rose-500 to-orange-600 p-[1px] transition-transform duration-200 group-hover:scale-105">
                    <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white tracking-[-0.01em]">
                      Түгээмэл Асуулт
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 font-medium">
                      Анхаарна уу
                    </p>
                  </div>
                </div>

                {/* FAQ Items - Refined */}
                <div className="space-y-3">
                  {/* Question 1 */}
                  <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-400/5 border border-rose-400/10 flex items-center justify-center">
                        <Ban className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm sm:text-base font-semibold text-white mb-2">
                          Сугалаа буцааж болох уу?
                        </h4>
                        <p className="text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
                          <span className="text-zinc-500">Хариулт:</span> Боломжгүй. Таны авсан сугалаа google шийтэд шивэгдэж дэс дарааллаар орсон тул{' '}
                          <span className="text-rose-400 font-semibold">БУЦААХ БОЛОМЖГҮЙ.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-400/5 border border-rose-400/10 flex items-center justify-center">
                        <ArrowRightLeft className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm sm:text-base font-semibold text-white mb-2">
                          Сугалаа шилжүүлж болох уу?
                        </h4>
                        <p className="text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
                          <span className="text-zinc-500">Хариулт:</span> Боломжгүй ээ. Сугалаа болгон{' '}
                          <span className="text-rose-400 font-semibold">өөр өөр дансаар</span> явагддаг.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Shield className="w-[15px] h-[15px]" />
                    <span className="text-xs font-medium">Нууцлал, аюулгүй байдлыг хамгаална</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

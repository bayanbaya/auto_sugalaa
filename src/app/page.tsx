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

      <section className="container mx-auto mt-8 sm:mt-12 lg:mt-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

          {/* Lottery Information Card */}
          <div className="group relative">
            {/* Animated border gradient */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-40 blur-sm transition-all duration-500 animate-gradient bg-[length:200%_auto]" />

            <div className="relative bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-yellow-400/5 rounded-full blur-3xl" />

              <div className="relative space-y-5 sm:space-y-6">
                {/* Header with icon */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      Сугалааны Мэдээлэл
                    </h3>
                    <p className="text-xs sm:text-sm text-yellow-400/60 mt-0.5">
                      Танд мэдэхэд зайлшгүй
                    </p>
                  </div>
                </div>

                {/* Information items */}
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      icon: <CheckCircle2 className="w-5 h-5 text-yellow-400" />,
                      text: "Таныг азын бурхан тэнгэр ивээх болтугай"
                    },
                    {
                      icon: <CheckCircle2 className="w-5 h-5 text-yellow-400" />,
                      text: "Сугалаа болгон өөр өөр данстай"
                    },
                    {
                      icon: <CheckCircle2 className="w-5 h-5 text-yellow-400" />,
                      text: "Гүйлгээний утга: утасны дугаар бичнэ үү"
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 hover:border-yellow-400/30 hover:bg-white/10 transition-all duration-300 group/item"
                    >
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover/item:bg-yellow-400/20 transition-colors">
                        {item.icon}
                      </div>
                      <p className="text-sm sm:text-base text-gray-100 leading-relaxed pt-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom accent */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-yellow-400/60">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-xs font-medium">Ил тод, найдвартай үйлчилгээ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Card */}
          <div className="group relative">
            {/* Animated border gradient */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 via-orange-500 to-red-400 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-40 blur-sm transition-all duration-500 animate-gradient bg-[length:200%_auto]" />

            <div className="relative bg-gradient-to-br from-[#1a1a1c] to-[#121214] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-red-400/5 rounded-full blur-3xl" />

              <div className="relative space-y-5 sm:space-y-6">
                {/* Header with icon */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Info className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      Түгээмэл Асуулт
                    </h3>
                    <p className="text-xs sm:text-sm text-red-400/60 mt-0.5">
                      Анхаарна уу
                    </p>
                  </div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Question 1 */}
                  <div className="p-4 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 hover:border-red-400/30 hover:bg-white/10 transition-all duration-300 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-400/10 flex items-center justify-center">
                        <Ban className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">
                          Сугалаа буцааж болох уу?
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                          <span className="text-white/60">Хариулт:</span> Боломжгүй. Таны авсан сугалаа google шийтэд шивэгдэж дэс дарааллаар орсон тул{' '}
                          <span className="text-red-400 font-bold">БУЦААХ БОЛОМЖГҮЙ.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="p-4 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 hover:border-red-400/30 hover:bg-white/10 transition-all duration-300 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-400/10 flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">
                          Сугалаа шилжүүлж болох уу?
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                          <span className="text-white/60">Хариулт:</span> Боломжгүй ээ. Сугалаа болгон{' '}
                          <span className="text-red-400 font-bold">өөр өөр дансаар</span> явагддаг.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom warning */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-red-400/60">
                    <Shield className="w-4 h-4" />
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

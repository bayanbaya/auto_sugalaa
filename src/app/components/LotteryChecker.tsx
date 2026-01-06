'use client';

import React, { useState } from 'react';
import {
  Search,
  XCircle,
  Loader2,
  Ticket,
  DollarSign,
  Phone,
  CreditCard,
  User,
  Copy,
  Info,
  Sparkles,
  Clock
} from 'lucide-react';

interface LotteryResult {
  success: boolean;
  found: boolean;
  phoneNumber?: string;
  totalLotteries?: number;
  message?: string;
  latestCheck?: string | null;
  data?: Array<{
    carName: string;
    carImage: string;
    ticketPrice: number;
    lotteries: Array<{
      lotteryNumber: string;
      createdAt: string;
      transactionAmount: number;
    }>;
  }>;
}

const App = () => {
  const [activeTab, setActiveTab] = useState('check');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Утасны дугаараа оруулна уу');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/lottery/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Алдаа гарлаа. Дахин оролдоно уу.');
        return;
      }

      setResult(data);
    } catch (error) {
      setError('Холболтын алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className=" text-white font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      {/* Enhanced Background Effects - Mobile Optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[80%] sm:w-[60%] lg:w-[40%] h-[60%] sm:h-[50%] lg:h-[40%] bg-yellow-500/10 blur-[100px] sm:blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-30%] right-[-20%] w-[80%] sm:w-[60%] lg:w-[40%] h-[60%] sm:h-[50%] lg:h-[40%] bg-amber-600/10 blur-[100px] sm:blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] sm:w-[40%] h-[40%] bg-yellow-400/5 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30 sm:opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 xl:py-20">
        {/* Header Section - Mobile First Typography */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-2 sm:space-y-3 lg:space-y-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-yellow-400 text-[10px] sm:text-xs font-medium tracking-wider uppercase mb-1 sm:mb-2 backdrop-blur-xl shadow-lg hover:bg-white/10 transition-all duration-300">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
            <span>Exclusive Lottery</span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] px-2 sm:px-4">
            <span className="block bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent pb-1">
              Мөрөөдлийнхөө
            </span>
            <span className="block bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Хүлгийг Жолоод.
            </span>
          </h1>

          <p className="text-white/50 max-w-2xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg px-4 sm:px-6 leading-relaxed mt-3 sm:mt-4">
            Монголын хамгийн том автомашины сугалаа. Ил тод, найдвартай бөгөөд хурдан.
          </p>
        </div>

        {/* Navigation Tabs - Fully Responsive */}
        <div className="flex justify-center mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
          <div className="inline-flex w-full max-w-md sm:w-auto p-1 sm:p-1.5 bg-white/5 backdrop-blur-3xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl">
            <button
              onClick={() => { setActiveTab('check'); setResult(null); setError(''); }}
              className={`flex-1 sm:flex-none min-w-0 px-3 xs:px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'check'
                  ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-[1.02]'
                  : 'hover:bg-white/5 text-white/60 active:scale-95'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Сугалаа шалгах</span>
            </button>
            <button
              onClick={() => { setActiveTab('buy'); setResult(null); setError(''); }}
              className={`flex-1 sm:flex-none min-w-0 px-3 xs:px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'buy'
                  ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-[1.02]'
                  : 'hover:bg-white/5 text-white/60 active:scale-95'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Сугалаа авах</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'check' ? (
            <div className="max-w-2xl mx-auto px-2 sm:px-0">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
                <form onSubmit={handleCheck} className="space-y-5 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-xs sm:text-sm font-medium text-white/60 ml-1 block">
                      Бүртгэлтэй утасны дугаар
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-yellow-400/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl" />
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-focus-within:text-yellow-400 transition-colors duration-300 pointer-events-none" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="88991234"
                          className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all text-base sm:text-lg tracking-widest placeholder:text-white/10 placeholder:tracking-normal"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-white to-gray-100 text-black hover:from-yellow-400 hover:to-yellow-500 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 sm:gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-yellow-400/20"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Шалгах</span>
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{error}</span>
                  </div>
                )}
              </div>

              {/* No Lottery Found Message */}
              {result && !result.found && (
                <div className="mt-6 sm:mt-8 lg:mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        Сугалаа илэрсэнгүй
                      </h3>
                      <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-md mx-auto">
                        Таны гүйлгээ хүлээгдэж байна. Манайх өдөрт{' '}
                        <span className="font-bold text-blue-400">3-5 удаа</span>{' '}
                        шивэлт хийдэг тул хэсэг хугацааны дараа дахин шалгана уу.
                      </p>
                      {result.latestCheck && (
                        <div className="pt-4 border-t border-white/10 mt-4">
                          <p className="text-xs sm:text-sm text-white/40">
                            Сүүлийн шивэлт:{' '}
                            <span className="text-blue-400 font-mono font-medium">
                              {new Date(result.latestCheck).toLocaleString('mn-MN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results Display - Mobile Optimized */}
              {result && result.found && result.data && (
                <div className="mt-6 sm:mt-8 lg:mt-10 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between px-1 sm:px-2">
                    <h3 className="text-lg sm:text-xl font-bold">Таны сугалаанууд</h3>
                    <span className="px-2.5 sm:px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-[10px] sm:text-xs font-bold border border-yellow-400/20">
                      Нийт {result.totalLotteries} ширхэг
                    </span>
                  </div>

                  {result.data.map((car, idx: number) => (
                    <div key={idx} className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl sm:rounded-[2rem] opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-sm" />
                      <div className="relative bg-[#121214] rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/5">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                          <img
                            src={car.carImage}
                            className="w-full sm:w-36 md:w-40 h-40 sm:h-28 md:h-32 object-cover rounded-xl sm:rounded-2xl shadow-2xl"
                            alt={car.carName}
                          />
                          <div className="flex-1 space-y-2">
                            <h4 className="text-lg sm:text-xl font-bold">{car.carName}</h4>
                            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-white/40">
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {car.lotteries.length} сугалаа
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {car.ticketPrice.toLocaleString()}₮
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 bg-white/[0.02] border-t border-white/5 space-y-2">
                          {car.lotteries.map((l, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 hover:border-yellow-400/30 hover:bg-white/10 transition-all duration-300"
                            >
                              <span className="font-mono font-bold text-yellow-400 tracking-wider text-sm sm:text-base">
                                {l.lotteryNumber}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-widest">
                                {new Date(l.createdAt).toLocaleDateString('mn-MN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Purchase Flow Section - Mobile First */
            <div className="max-w-2xl mx-auto px-2 sm:px-0 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10">
                  <CreditCard className="w-20 h-20 sm:w-32 sm:h-32" />
                </div>

                <div className="relative space-y-6 sm:space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold">Сугалаа авах заавар</h2>
                    <p className="text-white/50 text-sm sm:text-base leading-relaxed">
                      Доорх дансанд гүйлгээ хийснээр таны сугалаа 1-3 минутын дотор идэвхжих болно.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:gap-4">
                    {/* Bank Account Info Card */}
                    <div className="group relative bg-[#121214] border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:border-yellow-400/50 transition-all duration-300">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                            <CreditCard className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-white/40 font-medium">
                              Хүлээн авах банк
                            </p>
                            <p className="font-bold text-sm sm:text-base">ХААН БАНК</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-bold mb-1 tracking-tight sm:tracking-tighter">
                              Дансны дугаар
                            </p>
                            <p className="font-mono font-bold text-white tracking-wider text-lg xs:text-xl sm:text-2xl break-all">
                              58643210545
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('58643210545')}
                            className="p-2.5 sm:p-3 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 flex-shrink-0"
                            aria-label="Copy account number"
                          >
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                          <div>
                            <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-bold mb-1 tracking-tight sm:tracking-tighter">
                              Хүлээн авагч
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-white">
                              БАЯНБАЯР
                            </p>
                          </div>
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                        </div>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="font-bold text-yellow-400 text-sm sm:text-base">
                          Гүйлгээний утга дээр!
                        </p>
                        <p className="text-xs sm:text-sm text-yellow-100/70 leading-relaxed">
                          Гүйлгээний утга дээр зөвхөн{' '}
                          <span className="font-bold text-yellow-400">УТАСНЫ ДУГААРАА</span>{' '}
                          бичнэ үү. Алдаатай бичсэн тохиолдолд сугалаа үүсэхгүй болохыг анхаарна уу.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof & Draw Date */}
                  <div className="flex flex-col xs:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <div className="flex -space-x-2 sm:-space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#0a0a0b] bg-white/10 overflow-hidden ring-1 ring-white/5"
                        >
                          <img
                            src={`https://i.pravatar.cc/100?img=${i + 20}`}
                            alt="participant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="h-8 sm:h-10 px-3 sm:px-4 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold">
                        +1.2K
                      </div>
                    </div>
                    <div className="text-center xs:text-right">
                      <p className="text-[10px] sm:text-xs text-white/30 font-medium">
                        Дараагийн сугалаа
                      </p>
                      <p className="font-bold text-yellow-400 text-sm sm:text-base">
                        12 сарын 31-нд
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Success Toast - Mobile Optimized */}
      {copySuccess && (
        <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 text-sm sm:text-base z-50">
          Амжилттай хууллаа!
        </div>
      )}
    </div>
  );
};

export default App;

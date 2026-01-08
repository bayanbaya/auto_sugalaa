'use client';

import React, { useState, useEffect } from 'react';
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
  Clock,
  X,
  CheckCircle2,
  Calendar
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
  const [showModal, setShowModal] = useState(false);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

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
      setShowModal(true); // Open modal when results arrive
    } catch {
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
              <span>Холбоо барих</span>
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

            </div>
          ) : (
            /* Purchase Flow Section - Mobile First */
            <div className="max-w-2xl mx-auto px-2 sm:px-0 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10">
                  <CreditCard className="w-20 h-20 sm:w-32 sm:h-32" />
                </div>

                <div className="relative space-y-6 sm:space-y-8">
                 

                  <div className="grid gap-3 sm:gap-4">
                    {/* Bank Account Info Card */}
                    <div className="group relative bg-[#121214] border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:border-yellow-400/50 transition-all duration-300">
                  

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-bold mb-1 tracking-tight sm:tracking-tighter">
                              Утасны дугаар
                            </p>
                            <p className="font-mono font-bold text-white tracking-wider text-lg xs:text-xl sm:text-2xl break-all">
                              99431042
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('99431042')}
                            className="p-2.5 sm:p-3 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 flex-shrink-0"
                            aria-label="Copy account number"
                          >
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-bold mb-1 tracking-tight sm:tracking-tighter">
                              Facebook Чат
                            </p>
                            <a
                              href="https://www.facebook.com/messages/t/100002299766815"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-blue-400 hover:text-blue-300 text-xs xs:text-sm sm:text-base break-all underline underline-offset-4"
                            >
                              facebook.com/messages/t/100002299766815
                            </a>
                          </div>
                          <button
                            onClick={() => copyToClipboard('https://www.facebook.com/messages/t/100002299766815')}
                            className="p-2.5 sm:p-3 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 flex-shrink-0"
                            aria-label="Copy Facebook chat link"
                          >
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-bold mb-1 tracking-tight sm:tracking-tighter">
                              Facebook Хуудас
                            </p>
                            <a
                              href="https://www.facebook.com/MBautohudaldaa"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-blue-400 hover:text-blue-300 text-xs xs:text-sm sm:text-base break-all underline underline-offset-4"
                            >
                              facebook.com/MBautohudaldaa
                            </a>
                          </div>
                          <button
                            onClick={() => copyToClipboard('https://www.facebook.com/MBautohudaldaa')}
                            className="p-2.5 sm:p-3 bg-white/10 hover:bg-yellow-400 hover:text-black rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 flex-shrink-0"
                            aria-label="Copy Facebook page link"
                          >
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>                        
                      </div>
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

      {/* Modal for Results */}
      {showModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowModal(false)}
        >
          {/* Modal Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a1a1d] to-[#0f0f10] border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 p-2 sm:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 lg:p-10">
              {!result.found ? (
                /* No Lottery Found Modal */
                <div className="text-center space-y-6 sm:space-y-8">
                  {/* Icon */}
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                      <Clock className="w-10 h-10 sm:w-14 sm:h-14 text-blue-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                      Сугалаа илэрсэнгүй
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-white/60 leading-relaxed max-w-lg mx-auto px-4">
                      Таны гүйлгээ хүлээгдэж байна. Манайх өдөрт{' '}
                      <span className="font-bold text-blue-400">3-5 удаа</span>{' '}
                      шивэлт хийдэг тул хэсэг хугацааны дараа дахин шалгана уу.
                    </p>
                  </div>

                  {/* Latest Check Info */}
                  {result.latestCheck && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-2 text-white/40 text-xs sm:text-sm mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Сүүлийн шивэлт</span>
                      </div>
                      <p className="text-blue-400 font-mono font-bold text-base sm:text-lg">
                        {(() => {
                          const d = new Date(result.latestCheck);
                          return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} - ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                  >
                    Ойлголоо
                  </button>
                </div>
              ) : (
                /* Lottery Found Modal */
                <div className="space-y-6 sm:space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b border-white/10">
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-yellow-400/20 blur-2xl" />
                      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                          Таны сугалаанууд
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="px-4 sm:px-6 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                        <span className="text-yellow-400 font-bold text-sm sm:text-base">
                          Нийт {result.totalLotteries} ширхэг
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lottery Cards */}
                  <div className="space-y-4 sm:space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {result.data?.map((car, idx) => (
                      <div key={idx} className="group relative">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-sm" />

                        {/* Card */}
                        <div className="relative bg-[#0a0a0b] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden">
                          {/* Car Info */}
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-white/5 to-transparent">
                            <img
                              src={car.carImage}
                              className="w-full sm:w-40 lg:w-48 h-48 sm:h-32 lg:h-36 object-cover rounded-xl sm:rounded-2xl shadow-2xl border border-white/10"
                              alt={car.carName}
                            />
                            <div className="flex-1 space-y-3 sm:space-y-4">
                              <h4 className="text-xl sm:text-2xl font-bold text-white">
                                {car.carName}
                              </h4>
                              <div className="flex flex-wrap gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                  <Ticket className="w-4 h-4 text-yellow-400" />
                                  <span className="text-sm text-white/70">
                                    {car.lotteries.length} сугалаа
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-green-400" />
                                  <span className="text-sm text-white/70">
                                    {car.ticketPrice.toLocaleString()}₮
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lottery Numbers */}
                          <div className="p-4 sm:p-6 bg-black/20 border-t border-white/5">
                            <div className="grid gap-2 sm:gap-3">
                              {car.lotteries.map((lottery, i) => (
                                <div
                                  key={i}
                                  className="group/lottery flex items-center justify-between p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-yellow-400/30 rounded-xl transition-all duration-300"
                                >
                                  <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                                      <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                                    </div>
                                    <span className="font-mono font-bold text-yellow-400 tracking-wider text-base sm:text-lg lg:text-xl">
                                      {lottery.lotteryNumber}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
                                      Огноо
                                    </div>
                                    <div className="text-xs sm:text-sm text-white/60 font-medium">
                                      {new Date(lottery.createdAt).toLocaleDateString('mn-MN', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-yellow-400/50 hover:scale-[1.02] active:scale-95"
                    >
                      Хаах
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

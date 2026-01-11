'use client';

import React, { useState, useEffect } from 'react';
import { ReportHeader } from '@/app/components/ReportHeader';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { Ticket, Phone, DollarSign, Calendar, Car, Loader2, AlertCircle, Search } from 'lucide-react';

interface CarData {
  id: string;
  carName: string;
  img: string;
}

interface LotteryData {
  id: number;
  lotteryNumber: string;
  createdAt: string;
  bankTransactionId: number;
  carId: string;
  transactionAmount: number;
  phoneNumber: string;
  is_manual: number;
  carName: string;
  carImage: string;
}

export default function AllLotteryPage() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [lotteries, setLotteries] = useState<LotteryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (selectedCar) {
      fetchLotteries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar]);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars/all');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setCars(data.data);
        // Хамгийн сүүлийн машиныг автоматаар сонгох
        setSelectedCar(data.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  const fetchLotteries = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/reports/all-lottery?carId=${selectedCar}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setLotteries(data.data);
      } else {
        setError(data.error || 'Алдаа гарлаа');
      }
    } catch (err) {
      setError('Өгөгдөл татахад алдаа гарлаа');
      console.error('Error fetching lotteries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLotteries = lotteries.filter(lottery => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lottery.lotteryNumber.toLowerCase().includes(search) ||
      lottery.phoneNumber?.toLowerCase().includes(search) ||
      lottery.carName?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredLotteries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLotteries = filteredLotteries.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCar, searchTerm]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ReportHeader
        title="Нийт Сугалаа"
        description="Бүх сугалааны дэлгэрэнгүй мэдээлэл"
        icon={<Ticket className="w-6 h-6 text-white" />}
      />
      <AdminSidebar />

      <main className="lg:ml-64 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Машин сонгох
                </label>
                <select
                  value={selectedCar}
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-700"
                >
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>{car.carName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Хайлт
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Сугалааны дугаар, утас, машин..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500">Өгөгдөл татаж байна...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">
                      Нийт: <span className="text-indigo-600 font-bold">{filteredLotteries.length}</span> сугалаа
                    </p>
                    {totalPages > 1 && (
                      <p className="text-xs text-slate-500">
                        Хуудас {currentPage} / {totalPages}
                      </p>
                    )}
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Сугалааны дугаар
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Машин
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Утас
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Дүн
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Огноо
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Төрөл
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedLotteries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                            Сугалаа олдсонгүй
                          </td>
                        </tr>
                      ) : (
                        paginatedLotteries.map((lottery) => (
                        <tr key={lottery.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-indigo-600" />
                              <span className="font-mono font-semibold text-indigo-600">
                                {lottery.lotteryNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{lottery.carName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700 font-mono">
                                {lottery.phoneNumber || 'Байхгүй'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {lottery.transactionAmount?.toLocaleString()}₮
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {formatDate(lottery.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              lottery.is_manual
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {lottery.is_manual ? 'Гараар' : 'Автомат'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {paginatedLotteries.length === 0 ? (
                  <div className="px-4 py-12 text-center text-slate-500">
                    Сугалаа олдсонгүй
                  </div>
                ) : (
                  paginatedLotteries.map((lottery) => (
                    <div key={lottery.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-indigo-600" />
                          <span className="font-mono font-bold text-indigo-600">
                            {lottery.lotteryNumber}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          lottery.is_manual
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lottery.is_manual ? 'Гараар' : 'Автомат'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span>{lottery.carName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="font-mono">{lottery.phoneNumber || 'Байхгүй'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {lottery.transactionAmount?.toLocaleString()}₮
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(lottery.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Харуулж байгаа: {startIndex + 1}-{Math.min(endIndex, filteredLotteries.length)} / {filteredLotteries.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Өмнөх
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Дараах
                  </button>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ReportHeader } from '@/app/components/ReportHeader';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { FileText, DollarSign, Calendar, Car, Loader2, AlertCircle, Search, Ticket, CheckCircle2, XCircle } from 'lucide-react';

interface CarData {
  id: string;
  carName: string;
  img: string;
}

interface TransactionData {
  id: number;
  carId: number;
  guildgeeniiOgnoo: string;
  salbar: string;
  credit: number;
  guildgeeniiUtga: string;
  haritsanDans: string;
  ehniilUldegdel: number;
  etsiin_Uldegdel: number;
  importDate: string;
  rowNumber: number;
  employeeName: string;
  fileName: string;
  createdAt: string;
  islottery: number;
  carName: string;
  carImage: string;
  ticketPrice: string;
  lotteryCount: number;
}

export default function AllTransactionsPage() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
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
      fetchTransactions();
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

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/reports/all-tran?carId=${selectedCar}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      } else {
        setError(data.error || 'Алдаа гарлаа');
      }
    } catch (err) {
      setError('Өгөгдөл татахад алдаа гарлаа');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tran => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tran.guildgeeniiUtga?.toLowerCase().includes(search) ||
      tran.haritsanDans?.toLowerCase().includes(search) ||
      tran.carName?.toLowerCase().includes(search) ||
      tran.employeeName?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

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

  const stats = {
    total: filteredTransactions.length,
    withLottery: filteredTransactions.filter(t => t.lotteryCount > 0).length,
    withoutLottery: filteredTransactions.filter(t => t.lotteryCount === 0).length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + t.credit, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ReportHeader
        title="Нийт Гүйлгээ"
        description="Бүх гүйлгээний дэлгэрэнгүй мэдээлэл"
        icon={<FileText className="w-6 h-6 text-white" />}
      />
      <AdminSidebar />

      <main className="lg:ml-64 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Нийт гүйлгээ</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <FileText className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </div>

           

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Нийт дүн</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalAmount.toLocaleString()}₮</p>
                </div>
                <DollarSign className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </div>
          </div>

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
                    placeholder="Тайлбар, данс, машин, ажилтан..."
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
                      Нийт: <span className="text-indigo-600 font-bold">{filteredTransactions.length}</span> гүйлгээ
                    </p>
                    {totalPages > 1 && (
                      <p className="text-xs text-slate-500">
                        Хуудас {currentPage} / {totalPages}
                      </p>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Машин
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Дүн
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Тайлбар
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Данс
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Огноо
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Сугалаа
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Ажилтан
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                            Гүйлгээ олдсонгүй
                          </td>
                        </tr>
                      ) : (
                        paginatedTransactions.map((tran) => (
                        <tr key={tran.id} className={`hover:bg-slate-50 transition-colors ${
                          tran.lotteryCount === 0 ? 'bg-red-50/50' : ''
                        }`}>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-slate-600">#{tran.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{tran.carName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {tran.credit?.toLocaleString()}₮
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-700 max-w-xs truncate block">
                              {tran.guildgeeniiUtga || 'Байхгүй'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600 font-mono">
                              {tran.haritsanDans || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {formatDate(tran.guildgeeniiOgnoo)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {tran.lotteryCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-green-600" />
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  {tran.lotteryCount} сугалаа
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Байхгүй
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-700">
                              {tran.employeeName || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Харуулж байгаа: {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} / {filteredTransactions.length}
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

'use client';

import React, { useState, useEffect } from 'react';
import { ReportHeader } from '@/app/components/ReportHeader';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { AlertCircle, DollarSign, Calendar, Car, Loader2, Search, FileText } from 'lucide-react';

interface CarData {
  id: string;
  carName: string;
  img: string;
}

interface ErrorTransactionData {
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
}

export default function ErrorTransactionsPage() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [transactions, setTransactions] = useState<ErrorTransactionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (selectedCar) {
      fetchErrorTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar]);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      if (data.success) {
        setCars(data.data);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  const fetchErrorTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/reports/error-tran?carId=${selectedCar}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      } else {
        setError(data.error || 'Алдаа гарлаа');
      }
    } catch (err) {
      setError('Өгөгдөл татахад алдаа гарлаа');
      console.error('Error fetching error transactions:', err);
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
        title="Алдаатай Гүйлгээ"
        description="Сугалаа үүсээгүй гүйлгээнүүд"
        icon={<AlertCircle className="w-6 h-6 text-white" />}
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">Бүгд</option>
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
                    placeholder="Тайлбар, данс, машин..."
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-red-50">
                <p className="text-sm font-medium text-slate-700">
                  Нийт: <span className="text-red-600 font-bold">{filteredTransactions.length}</span> алдаатай гүйлгээ
                </p>
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
                        Ажилтан
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                          Алдаатай гүйлгээ олдсонгүй
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tran) => (
                        <tr key={tran.id} className="hover:bg-red-50 transition-colors">
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
                              <DollarSign className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-600">
                                {tran.credit?.toLocaleString()}₮
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700 max-w-xs truncate">
                                {tran.guildgeeniiUtga || 'Байхгүй'}
                              </span>
                            </div>
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
          )}
        </div>
      </main>
    </div>
  );
}

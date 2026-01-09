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
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [lotteries, setLotteries] = useState<LotteryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      const response = await fetch('/api/cars');
      const data = await response.json();
      if (data.success) {
        setCars(data.data);
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-sm font-medium text-slate-700">
                  Нийт: <span className="text-indigo-600 font-bold">{filteredLotteries.length}</span> сугалаа
                </p>
              </div>

              <div className="overflow-x-auto">
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
                    {filteredLotteries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          Сугалаа олдсонгүй
                        </td>
                      </tr>
                    ) : (
                      filteredLotteries.map((lottery) => (
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

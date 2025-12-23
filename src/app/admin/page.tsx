'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, ArrowRight, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface CarData {
  id: string;
  img: string;
  iban: string;
  ibanName: string;
  price: string;
  fbLink: string;
  carName: string;
  total: number;
  sold: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Машинуудыг database-аас татах
  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/cars');
      if (!response.ok) throw new Error('Машинуудыг татахад алдаа гарлаа');
      const data = await response.json();
      setCars(data);
    } catch (err) {
      setError((err instanceof Error ? err.message : String(err)) || 'Алдаа гарлаа');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Хайлтын логик
  const filteredCars = cars.filter(car => 
    car.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.ibanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.iban.includes(searchTerm)
  );

  // Машин сонгох - зөвхөн ID дамжуулах
  const handleSelectCar = (carId: string) => {
    router.push(`/add?carId=${carId}`);
  };

  // Прогресс тооцох
  const calculateProgress = (sold: number, total: number) => {
    return total > 0 ? Math.round((sold / total) * 100) : 0;
  };

  // Үнэ форматлах
  const formatPrice = (price: string | number) => {
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-white font-semibold">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Гарчиг */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-6 mb-6 border border-yellow-400">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white">
                  Машины жагсаалт
                </h1>
                <p className="text-white/90 text-sm mt-1">
                  Сугалаанд оролцож буй машинууд ({filteredCars.length})
                </p>
              </div>
            </div>
            <button
              onClick={fetchCars}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Шинэчлэх
            </button>
          </div>
        </div>

        {/* Алдаа */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-red-200 text-lg mb-1">Алдаа гарлаа</h3>
                <p className="text-red-300">{error}</p>
                <button
                  onClick={fetchCars}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Дахин оролдох
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Хайлт */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Машин, эзэмшигч, данс хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Машины жагсаалт */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => {
            const progress = calculateProgress(car.sold, car.total);
            const remaining = car.total - car.sold;
            
            // Прогресс өнгө
            const progressColor = progress < 30 
              ? '#da9b27ff' 
              : progress < 50 
              ? '#ffd54f' 
              : '#4caf50';

            return (
              <div 
                key={car.id}
                className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 group"
              >
                {/* Зураг */}
                <div className="relative h-56 bg-gradient-to-br from-gray-700 to-gray-800">
                  {car.img ? (
                    <img 
                      src={car.img}
                      alt={car.carName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <Car className="w-16 h-16 text-gray-600" />
                  </div>
                  
                  {/* Badge - Зарагдсан хувь */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full shadow-lg">
                    <span className="text-xs font-bold text-gray-900">{progress}%</span>
                  </div>
                </div>

                {/* Мэдээлэл */}
                <div className="p-5 bg-white/5 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-yellow-300 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {car.carName}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Эзэмшигч:</span>
                      <span className="font-semibold text-white">{car.ibanName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Данс:</span>
                      <span className="font-mono text-xs font-semibold text-white">{car.iban}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Үнэ:</span>
                      <span className="font-bold text-green-400">{formatPrice(car.price)}₮</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Зарагдсан: {car.sold}</span>
                      <span>Үлдсэн: {remaining}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: progressColor
                        }}
                      />
                    </div>
                  </div>

                  {/* Товчлуур */}
                  <button
                    onClick={() => handleSelectCar(car.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-yellow-500/50 font-bold"
                  >
                    Excel импорт хийх
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Хоосон үр дүн */}
        {filteredCars.length === 0 && !loading && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center border border-white/20">
            <Car className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Машин олдсонгүй
            </h3>
            <p className="text-gray-400">
              {searchTerm ? `"${searchTerm}" гэсэн хайлтаар илэрц олдсонгүй` : 'Одоогоор машин байхгүй байна'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
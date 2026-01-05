'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  ArrowRight, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Users,
  Trash2 // Хогийн савны icon нэмсэн
} from 'lucide-react';
import { AdminHeader } from '../components/AdminHeader';
import { AddCarModal } from '../components/AddCarModal';
import { AdminSidebar } from '../components/AdminSidebar';

// --- Types ---
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
  status?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);

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

  // Хайлтын логик + Inactive машиныг нуух
  const filteredCars = cars.filter(car => {
    // 1. Статус нь 'inactive' биш байх ёстой (active эсвэл хоосон байж болно)
    const isActive = car.status !== 'inactive';
    
    // 2. Хайлтын үг таарч байх
    const matchesSearch = 
      car.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.ibanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.iban.includes(searchTerm);

    return isActive && matchesSearch;
  });

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

  // Төлөв өөрчлөх (Устгах/Идэвхгүй болгох)
  const handleDeleteClick = async (carId: string) => {
    // Санамсаргүй дарахаас сэргийлж баталгаажуулалт авах
    if (!window.confirm('Та энэ сугалааг устгахдаа итгэлтэй байна уу? Жагсаалтаас харагдахгүй болно.')) {
      return;
    }

    try {
      const response = await fetch('/api/cars/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: carId, status: 'inactive' }),
      });

      if (!response.ok) {
        throw new Error('Төлөв өөрчлөхөд алдаа гарлаа');
      }

      // Local state шинэчлэх (Жагсаалтаас шууд алга болно)
      setCars((prevCars) =>
        prevCars.map((car) =>
          car.id === carId ? { ...car, status: 'inactive' } : car
        )
      );
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Устгахад алдаа гарлаа');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-slate-600 font-medium animate-pulse">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 flex">
      {/* Sidebar нэмэгдсэн */}
      <AdminSidebar />

      {/* Main Content - Sidebar-ийн өргөнөөр margin авсан (lg:pl-64) */}
      <div className="flex-1 lg:pl-64">
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={fetchCars}
          totalCars={filteredCars.length}
          onAddClick={() => setIsAddCarModalOpen(true)}
        />

      <AddCarModal
        isOpen={isAddCarModalOpen}
        onClose={() => setIsAddCarModalOpen(false)}
        onSuccess={() => {
          fetchCars();
          setIsAddCarModalOpen(false);
        }}
      />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-rose-900 text-lg mb-1">Алдаа гарлаа</h3>
                <p className="text-rose-700/80 mb-4">{error}</p>
                <button
                  onClick={fetchCars}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-100 transition-all text-sm font-semibold shadow-sm"
                >
                  Дахин оролдох
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => {
            const progress = calculateProgress(car.sold, car.total);
            const remaining = car.total - car.sold;
            
            const progressColorClass = progress < 30 
              ? 'bg-amber-500' 
              : progress < 70 
              ? 'bg-indigo-500' 
              : 'bg-emerald-500';

            return (
              <div 
                key={car.id}
                className="group bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  {car.img && car.img.trim() !== '' ? (
                    <img
                      src={car.img}
                      alt={car.carName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Image */}
                  <div className={`${car.img && car.img.trim() !== '' ? 'hidden' : 'flex'} w-full h-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300`}>
                    <Car className="w-12 h-12 mb-2" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Зураггүй</span>
                  </div>

                  {/* Top Right Action Buttons (Trash Icon added here) */}
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(car.id);
                      }}
                      title="Устгах"
                      className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/50 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Progress Badge */}
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-800">{progress}%</span>
                    </div>
                  </div>
                  
                  {/* Bottom Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={car.carName}>
                      {car.carName}
                    </h3>
                  </div>

                  {/* Info Grid */}
                <div className="grid grid-cols-3 gap-x-4 mb-5 items-end">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                      Эзэмшигч
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Users className="h-3.5 text-slate-400" />
                      <span className="truncate">
                        {car.ibanName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                      Данс
                    </p>
                    <p className="text-slate-700 font-mono text-sm font-semibold truncate bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {car.iban}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                      Үнэ
                    </p>
                    <p className="text-lg font-bold text-emerald-600 whitespace-nowrap">
                      {formatPrice(car.price)}₮
                    </p>
                  </div>
                </div>


                  {/* Progress Bar */}
                  <div className="mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex justify-between text-xs font-medium mb-2">
                      <span className="text-slate-500">Зарагдсан: <span className="text-slate-900">{car.sold}</span></span>
                      <span className="text-slate-500">Үлдсэн: <span className="text-slate-900">{remaining}</span></span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColorClass}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center pt-2 border-t border-slate-100">
                    {/* Import Button (Now Full Width) */}
                    <button
                      onClick={() => handleSelectCar(car.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 font-semibold text-sm group-hover:scale-[1.01]"
                    >
                      <span>Импорт хийх</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCars.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Машин олдсонгүй
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchTerm ? `"${searchTerm}" хайлтаар илэрц олдсонгүй.` : 'Одоогоор идэвхтэй машин байхгүй байна.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Хайлт цэвэрлэх
              </button>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
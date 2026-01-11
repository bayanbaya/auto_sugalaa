'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Download, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CarData {
  id: number;
  carName: string;
  img: string;
  price: number;
  total: number;
  sold: number;
}

interface LotteryData {
  lotteryNumber: string;
  phoneNumber: string;
}

export default function PrintPage() {
  const router = useRouter();
  const [cars, setCars] = useState<CarData[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lotteryData, setLotteryData] = useState<LotteryData[]>([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars/all');
      if (!response.ok) throw new Error('Failed to fetch cars');
      const result = await response.json();
      const data = result.data || result;
      setCars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      alert('Машины жагсаалт татахад алдаа гарлаа');
      setCars([]);
    }
  };

  const handleCarSelect = async (carId: string) => {
    setSelectedCarId(carId);
    if (!carId) {
      setLotteryData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/lottery/print?carId=${carId}`);
      if (!response.ok) throw new Error('Failed to fetch lottery data');
      const data = await response.json();
      setLotteryData(data);
    } catch (error) {
      console.error('Error fetching lottery data:', error);
      alert('Сугалааны мэдээлэл татахад алдаа гарлаа');
      setLotteryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!selectedCarId || lotteryData.length === 0) {
      alert('Эхлээд машин сонгоно уу');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch('/api/lottery/download-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: selectedCarId,
          lotteries: lotteryData,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate Word document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;



      const selectedCar = cars.find(car => car.id.toString() === selectedCarId);
      const fileName = `Sugalaa_${selectedCar?.carName || 'Unknown'}_${new Date().toISOString().split('T')[0]}.docx`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Word document:', error);
      alert('Word файл татахад алдаа гарлаа');
    } finally {
      setDownloading(false);
    }
  };

  const selectedCar = cars.find(car => car.id.toString() === selectedCarId);
         
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Буцах</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Сугалаа хэвлэх
            </h1>
          </div>
          <p className="text-slate-600 ml-13">
            Машин сонгоод сугалааны мэдээллийг Word файл болгон татаж аваарай
          </p>
        </div>

        {/* Car Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Машин сонгох
          </label>
          <select
            value={selectedCarId}
            onChange={(e) => handleCarSelect(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
          >
            <option value="">-- Машин сонгоно уу -- </option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.carName} (Нийт: {car.total}, Зарагдсан: {car.sold})
              </option>
            ))}
          </select>
        </div>
        

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600">Сугалааны мэдээллийг уншиж байна...</p>
          </div>
        )}

        {/* Lottery Data Display */}
        {!loading && selectedCarId && lotteryData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCar?.carName}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Нийт {lotteryData.length} сугалаа
                </p>
              </div>
              <button
                onClick={handleDownloadWord}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Татаж байна...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Word татах
                  </>
                )}
              </button>
            </div>

            {/* Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div className="grid grid-cols-2 gap-4 font-semibold text-sm text-slate-700">
                  <div>Сугалааны дугаар</div>
                  <div>Утасны дугаар</div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {lotteryData.slice(0, 50).map((lottery, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-mono text-slate-900">{lottery.lotteryNumber}</div>
                    <div className="font-mono text-slate-700">{lottery.phoneNumber || '-'}</div>
                  </div>
                ))}
                {lotteryData.length > 50 && (
                  <div className="px-4 py-3 text-center text-sm text-slate-500 bg-slate-50">
                    ... болон бусад {lotteryData.length - 50} сугалаа (Word файлд бүгд багтсан)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && selectedCarId && lotteryData.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Printer className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-center">
              Энэ машинд сугалаа олдсонгүй
            </p>
          </div>
        )}

        {/* No Selection State */}
        {!loading && !selectedCarId && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-4">
              <Printer className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-slate-600 text-center">
              Эхлүүлэхийн тулд дээрээс машин сонгоно уу
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

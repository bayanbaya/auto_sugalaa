import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, AlertCircle } from 'lucide-react';
import { CarData } from '../types';

interface CarInfoProps {
  carData: CarData | null;
  loadingCar: boolean;
}

export function CarInfo({ carData, loadingCar }: CarInfoProps) {
  const router = useRouter();

  if (loadingCar) {
    return null;
  }

  if (!carData) {
    return (
      <div className="bg-[#ff3b30]/10 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-[#ff3b30]/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#ff3b30] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#1d1d1f] mb-1">Машин сонгогдоогүй</p>
            <button
              onClick={() => router.push('/admin')}
              className="text-[#007aff] text-[13px] font-medium"
            >
              Машин сонгох →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-[#007aff]/10 flex items-center justify-center">
          <Car className="w-4 h-4 text-[#007aff]" />
        </div>
        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wide">Машин</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-semibold text-[#1d1d1f]">{carData.carName}</span>
          <span className="text-[13px] text-[#86868b]">·</span>
          <span className="text-[13px] text-[#86868b]">{carData.ibanName}</span>
        </div>
        <div className="text-[12px] font-mono text-[#86868b]">{carData.iban}</div>
      </div>
    </div>
  );
}

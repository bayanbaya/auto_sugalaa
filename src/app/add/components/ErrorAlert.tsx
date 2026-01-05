import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="bg-[#ff3b30]/10 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-[#ff3b30]/20">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-4 h-4 text-[#ff3b30]" />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-[13px] font-semibold text-[#1d1d1f] mb-1">Алдаа</p>
          <p className="text-[12px] text-[#86868b] leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

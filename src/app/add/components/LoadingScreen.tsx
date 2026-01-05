import React from 'react';
import { RefreshCw } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
        <p className="text-xl text-white font-semibold">Уншиж байна...</p>
      </div>
    </div>
  );
}

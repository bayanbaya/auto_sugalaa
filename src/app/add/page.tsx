'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { CarData, ImportStats } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorAlert } from './components/ErrorAlert';
import { CarInfo } from './components/CarInfo';
import { ExcelUpload } from './components/ExcelUpload';
import { ImportResults } from './components/ImportResults';


function LotteryImportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const carId = searchParams.get('carId');
  const [carData, setCarData] = useState<CarData | null>(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [loadingSession, setLoadingSession] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  // sessionStorage-с admin_username татах
  useEffect(() => {
    const adminUsername = sessionStorage.getItem('admin_username');
    if (adminUsername) {
      setEmployeeName(adminUsername);
    }
    setLoadingSession(false);
  }, []);

  // Машины мэдээлэл татах
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId) {
        setLoadingCar(false);
        return;
      }

      try {
        const response = await fetch('/api/cars');
        if (!response.ok) throw new Error('Машины мэдээлэл татахад алдаа гарлаа');
        const cars: CarData[] = await response.json();
        const selectedCar = cars.find(car => car.id === carId);

        if (!selectedCar) {
          setError('Машин олдсонгүй');
        } else {
          setCarData(selectedCar);
        }
      } catch (err) {
        setError('Машины мэдээлэл татахад алдаа гарлаа');
        console.error(err);
      } finally {
        setLoadingCar(false);
      }
    };

    fetchCarData();
  }, [carId]);

  // Бүх зүйлийг цэвэрлэх
  const resetAll = useCallback(() => {
    setFile(null);
    setError('');
    setLastSavedDate(null);
    setImportStats(null);
  }, []);

  const handleProgressUpdate = useCallback((progress: number, message: string) => {
    setUploadProgress(progress);
    setProgressMessage(message);
  }, []);

  if (loadingCar || loadingSession) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-3 sm:p-4">
      <div className="max-w-5xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-xl text-[#1d1d1f] rounded-full hover:bg-white transition-all shadow-sm text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Буцах</span>
          </button>

          <div className="flex items-center gap-2">
            {employeeName && (
              <div className="px-3 py-1.5 bg-white/80 backdrop-blur-xl rounded-full shadow-sm text-sm">
                <span className="text-[#1d1d1f] font-medium">{employeeName}</span>
              </div>
            )}
            {file && (
              <button
                onClick={resetAll}
                className="p-1.5 bg-white/80 backdrop-blur-xl rounded-full hover:bg-white transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-[#ff3b30]" />
              </button>
            )}
          </div>
        </div>

        {/* Car Info */}
        <CarInfo carData={carData} loadingCar={loadingCar} />

        {/* Upload Section - Hide when results shown */}
        {!importStats && (
          <ExcelUpload
            carData={carData}
            employeeName={employeeName}
            carId={carId}
            lastSavedDate={lastSavedDate}
            file={file}
            isProcessing={isProcessing}
            uploadProgress={uploadProgress}
            progressMessage={progressMessage}
            onFileSet={setFile}
            onDataParsed={() => {}}
            onError={setError}
            onImportComplete={setImportStats}
            onLastSavedDateUpdate={setLastSavedDate}
            onProcessingChange={setIsProcessing}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {/* Error */}
        {error && <ErrorAlert message={error} />}

        {/* Results */}
        {importStats && (
          <ImportResults
            stats={importStats}
          />
        )}       
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function LotteryImportSystem() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LotteryImportContent />
    </Suspense>
  );
}

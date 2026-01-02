'use client';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, XCircle, Trash2, RefreshCw, Save, ArrowLeft, Car, AlertCircle, Sparkles } from 'lucide-react';

interface LotteryEntry {
  guildgeeniiOgnoo: string;
  salbar: string;
  credit: number;
  guildgeeniiUtga: string;
  haritsanDans: string;
  ehniilUldegdel: number;
  etsiin_Uldegdel: number;
  importDate: string;
  rowNumber: number;
}

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

interface ExcelRow extends Array<string | number | null | undefined> {
  [index: number]: string | number | null | undefined;
}

interface ValidationResult {
  guildgeeniiOgnoo: string;
  salbar: string;
  credit: number;
  guildgeeniiUtga: string;
  haritsanDans: string;
  ehniilUldegdel: number;
  etsiin_Uldegdel: number;
  importDate: string;
  rowNumber: number;
  isValid: boolean;
}

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
        <p className="text-xl text-white font-semibold">Уншиж байна...</p>
      </div>
    </div>
  );
}

// Main content component
function LotteryImportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const carId = searchParams.get('carId');
  const [carData, setCarData] = useState<CarData | null>(null);
  const [loadingCar, setLoadingCar] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<LotteryEntry[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [isGeneratingLottery, setIsGeneratingLottery] = useState(false);
  const [lotteryStats, setLotteryStats] = useState<{
    totalLotteries: number;
    unprocessed: number;
  } | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(20000);
  const [lotteryPreview, setLotteryPreview] = useState<{
    totalLotteries: number;
    validTransactions: number;
    skippedTransactions: number;
  } | null>(null);
  const [saveResult, setSaveResult] = useState<{
    totalTransactions: number;
    totalLotteries: number;
    skippedNoPhone: number;
  } | null>(null);

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

  // Сугалааны статистик татах
  useEffect(() => {
    const fetchLotteryStats = async () => {
      if (!carId) return;

      try {
        const response = await fetch(`/api/lottery/generate?carId=${carId}`);
        if (!response.ok) return;

        const data = await response.json();
        setLotteryStats({
          totalLotteries: data.statistics.totalLotteries,
          unprocessed: data.statistics.unprocessedTransactions,
        });
      } catch (err) {
        console.error('Failed to fetch lottery stats:', err);
      }
    };

    fetchLotteryStats();
  }, [carId]);

  // Статистик
  const stats = useMemo(() => {
    if (!parsedData.length) return null;
    const totalAmount = parsedData.reduce((sum, entry) => sum + entry.credit, 0);
    return { totalEntries: parsedData.length, totalAmount };
  }, [parsedData]);

  // Файл валидаци
  const validateFile = useCallback((file: File) => {
    const maxSize = 10 * 1024 * 1024;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (file.size > maxSize) {
      throw new Error('Файлын хэмжээ 10MB-аас бага байх ёстой');
    }

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      throw new Error('Зөвхөн Excel файл (.xlsx, .xls) дэмжигдэнэ');
    }

    return true;
  }, []);

  // Өгөгдөл цэвэрлэх
  const validateAndCleanEntry = useCallback((row: ExcelRow, index: number): ValidationResult | null => {
    const date = row[0];
    const branch = row[1];
    const startBalance = row[2];
    const credit = row[4];
    const endBalance = row[5];
    const description = row[6];
    const counterAccount = row[7];

    const creditAmount = parseFloat(String(credit || 0));
    if (!creditAmount || creditAmount <= 0) {
      return null;
    }

    const dateStr = String(date || '').trim();
    if (!dateStr || dateStr === 'undefined' || dateStr === '') {
      return null;
    }

    try {
      const testDate = new Date(dateStr);
      if (isNaN(testDate.getTime())) {
        return null;
      }
    } catch {
      return null;
    }

    return {
      guildgeeniiOgnoo: dateStr,
      salbar: String(branch || '').trim(),
      credit: creditAmount,
      guildgeeniiUtga: String(description || '').trim(),
      haritsanDans: String(counterAccount || '').trim(),
      ehniilUldegdel: parseFloat(String(startBalance)) || 0,
      etsiin_Uldegdel: parseFloat(String(endBalance)) || 0,
      importDate: new Date().toISOString(),
      rowNumber: index + 9,
      isValid: true
    };
  }, []);

  // Excel боловсруулах
  const processLotteryData = useCallback(async (rawData: ExcelRow[]) => {
    if (rawData.length < 9) {
      throw new Error('Excel файл хоосон эсвэл буруу форматтай байна. 9-р мөрнөөс өгөгдөл эхлэх ёстой.');
    }

    const dataRows = rawData.slice(8).filter(row => {
      if (!row || row.length === 0) return false;

      const firstCell = String(row[0] || '').trim().toLowerCase();
      if (firstCell.includes('нийт') || firstCell === '' || firstCell === 'undefined') {
        return false;
      }

      return true;
    });

    const lotteryEntries: LotteryEntry[] = [];

    dataRows.forEach((row, index) => {
      const result = validateAndCleanEntry(row, index);
      if (result && result.isValid) {
        const { isValid: _isValid, ...entryData } = result;
        lotteryEntries.push(entryData as LotteryEntry);
      }
    });

    if (lotteryEntries.length === 0) {
      throw new Error('Сугалааны гүйлгээ олдсонгүй. Credit гүйлгээтэй мөр байхгүй байна.');
    }

    setParsedData(lotteryEntries);

    // Preview: Хэдэн сугалаа үүсэх вэ гэдгийг тооцоолох
    try {
      const previewResponse = await fetch('/api/lottery/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: lotteryEntries.map(entry => ({
            credit: entry.credit,
            guildgeeniiUtga: entry.guildgeeniiUtga,
          })),
          ticketPrice,
        }),
      });

      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        setLotteryPreview({
          totalLotteries: previewData.summary.totalLotteries,
          validTransactions: previewData.summary.validTransactions,
          skippedTransactions: previewData.summary.skippedTransactions,
        });
      }
    } catch (err) {
      console.error('Preview failed:', err);
    }
  }, [validateAndCleanEntry, ticketPrice]);

  // Файл upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.currentTarget.files?.[0];
    if (!uploadedFile) return;

    if (!employeeName.trim()) {
      setError('Ажилтны нэрээ оруулна уу');
      e.currentTarget.value = '';
      return;
    }

    setIsProcessing(true);
    setError('');
    setParsedData([]);

    try {
      validateFile(uploadedFile);
      setFile(uploadedFile);

      const buffer = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      if (!wb.SheetNames.length) {
        throw new Error('Excel файл хоосон байна');
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { 
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd hh:mm:ss'
      }) as ExcelRow[];

      processLotteryData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Excel файл боловсруулахад алдаа гарлаа';
      setError(errorMessage);
      setFile(null);
    } finally {
      setIsProcessing(false);
      e.currentTarget.value = '';
    }
  }, [validateFile, processLotteryData, employeeName]);

  // Датабазд хадгалах
  const saveToDatabase = useCallback(async () => {
    if (!parsedData.length) {
      alert('Хадгалах өгөгдөл байхгүй байна');
      return;
    }

    if (!employeeName.trim()) {
      alert('Ажилтны нэрээ оруулна уу');
      return;
    }

    if (!carId) {
      alert('Машин сонгогдоогүй байна');
      return;
    }

    setIsSaving(true);

    try {
      let filteredData = parsedData;
      
      if (lastSavedDate) {
        filteredData = parsedData.filter(entry => {
          const entryDate = new Date(entry.guildgeeniiOgnoo);
          const savedDate = new Date(lastSavedDate);
          return entryDate > savedDate;
        });

        if (filteredData.length === 0) {
          alert(`Шинэ өгөгдөл олдсонгүй. Сүүлд хадгалсан огноо: ${lastSavedDate}`);
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        metadata: {
          importDate: new Date().toISOString(),
          totalRecords: filteredData.length,
          fileName: file?.name,
          lastSavedDate: lastSavedDate,
          employeeName: employeeName.trim(),
          carId: carId
        },
        data: filteredData
      };

      const response = await fetch('/api/lottery/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Серверийн алдаа гарлаа');
      }

      const result = await response.json();

      const latestDate = filteredData.reduce((latest, entry) => {
        const entryDate = new Date(entry.guildgeeniiOgnoo);
        return entryDate > new Date(latest) ? entry.guildgeeniiOgnoo : latest;
      }, filteredData[0].guildgeeniiOgnoo);

      setLastSavedDate(latestDate);

      // Save result for display
      if (result.data) {
        setSaveResult({
          totalTransactions: result.data.totalTransactions,
          totalLotteries: result.data.totalLotteries,
          skippedNoPhone: result.data.skippedNoPhone || 0,
        });
      }

      // Show beautiful success message
      const message = `✅ Амжилттай хадгаллаа!\n\n` +
        `📊 Нийт гүйлгээ: ${result.data?.totalTransactions || filteredData.length}\n` +
        `🎫 Үүссэн сугалаа: ${result.data?.totalLotteries || 0}\n` +
        (result.data?.skippedNoPhone > 0 ? `⚠️ Утасны дугаар байхгүй: ${result.data.skippedNoPhone}` : '');

      alert(message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Хадгалахад алдаа гарлаа';
      alert('Хадгалахад алдаа гарлаа: ' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [parsedData, file, lastSavedDate, employeeName, carId]);

  // Бүх зүйлийг цэвэрлэх
  const resetAll = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setError('');
    setLastSavedDate(null);
    setLotteryPreview(null);
  }, []);

  if (loadingCar) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Буцах товч */}
        <button
          onClick={() => router.push('/admin')}
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all shadow-lg border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>

        {/* Гарчиг */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-6 mb-6 border border-yellow-400">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white">
                  Excel импорт
                </h1>
                <p className="text-white/90 text-sm mt-1">Сугалааны гүйлгээ импортлох</p>
              </div>
            </div>
            {file && (
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Цэвэрлэх
              </button>
            )}
          </div>
        </div>

        {/* Сонгосон машины мэдээлэл */}
        {carData && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 mb-6 text-white border border-indigo-500">
            <div className="flex items-center gap-3 mb-3">
              <Car className="w-6 h-6" />
              <h2 className="text-xl font-bold">Сонгосон машин</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Машины нэр:</p>
                <p className="font-bold text-lg">{carData.carName}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">Эзэмшигч:</p>
                <p className="font-bold text-lg">{carData.ibanName}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm opacity-90 mb-1">Дансны дугаар:</p>
                <p className="font-bold text-lg font-mono">{carData.iban}</p>
              </div>
            </div>
          </div>
        )}

        {/* Алдаа хэрэв машин олдоогүй бол */}
        {!carData && !loadingCar && (
          <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-red-200 text-lg mb-1">Машин сонгогдоогүй</h3>
                <p className="text-red-300 mb-3">Машин сонгоогүй эсвэл машин олдсонгүй байна.</p>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Машин сонгох хуудас руу буцах
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload хэсэг */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-6 border border-white/20">
          {/* Ажилтны нэр */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Ажилтны нэр *
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Жишээ: Бат, Болд"
              className="w-full px-4 py-3 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-900"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-400 mt-1">
              Файл оруулахын өмнө ажилтны нэрээ заавал оруулна уу
            </p>
          </div>

          <label className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isProcessing 
              ? 'border-gray-500 bg-gray-700/50 cursor-wait' 
              : !employeeName.trim()
              ? 'border-gray-500 bg-gray-700/50 cursor-not-allowed'
              : 'border-yellow-400 hover:border-yellow-300 hover:bg-white/5'
          }`}>
            <div className="flex flex-col items-center justify-center py-6">
              {isProcessing ? (
                <>
                  <RefreshCw className="w-16 h-16 text-yellow-400 mb-4 animate-spin" />
                  <p className="text-xl font-semibold text-white">Боловсруулж байна...</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mb-4">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <p className="mb-2 text-xl font-bold text-white">
                    Excel файл оруулах
                  </p>
                  <p className="text-sm text-gray-300 mb-2">
                    {file ? `📄 ${file.name}` : employeeName.trim() ? 'Дарж эсвэл чирж файл оруулна уу' : 'Эхлээд ажилтны нэрээ оруулна уу'}
                  </p>
                  <p className="text-xs text-gray-400">
                    9-р мөрнөөс өгөгдөл эхлэнэ (.xlsx, .xls - Max: 10MB)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isProcessing || !employeeName.trim()}
            />
          </label>
        </div>

        {/* Алдаа */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-red-200 text-lg mb-1">Алдаа гарлаа</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Сугалааны preview */}
        {lotteryPreview && stats && (
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-2xl p-6 mb-6 border border-emerald-500">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-yellow-300" />
                <h2 className="text-2xl font-bold text-white">Сугалааны урьдчилсан мэдээлэл</h2>
              </div>
              {employeeName && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                  <span className="text-sm font-semibold text-emerald-100">Ажилтан:</span>
                  <span className="text-sm font-bold text-white">{employeeName}</span>
                </div>
              )}
            </div>

            {/* Ticket Price Input */}
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Нэг сугалааны үнэ (₮)
              </label>
              <input
                type="number"
                value={ticketPrice}
                onChange={async (e) => {
                  const newPrice = parseInt(e.target.value) || 20000;
                  setTicketPrice(newPrice);

                  // Re-calculate preview with new price
                  if (parsedData.length > 0) {
                    try {
                      const previewResponse = await fetch('/api/lottery/preview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          transactions: parsedData.map(entry => ({
                            credit: entry.credit,
                            guildgeeniiUtga: entry.guildgeeniiUtga,
                          })),
                          ticketPrice: newPrice,
                        }),
                      });

                      if (previewResponse.ok) {
                        const previewData = await previewResponse.json();
                        setLotteryPreview({
                          totalLotteries: previewData.summary.totalLotteries,
                          validTransactions: previewData.summary.validTransactions,
                          skippedTransactions: previewData.summary.skippedTransactions,
                        });
                      }
                    } catch (err) {
                      console.error('Re-preview failed:', err);
                    }
                  }
                }}
                min="1"
                className="w-full px-4 py-3 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-900 font-bold text-lg"
              />
              <p className="text-xs text-emerald-100 mt-1">
                💡 Үнийг өөрчлөхөд сугалааны тоо автоматаар шинэчлэгдэнэ
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-emerald-100 mb-2">📊 Нийт гүйлгээ</p>
                <p className="text-4xl font-bold text-white">{stats.totalEntries}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-emerald-100 mb-2">✅ Үүсэх сугалаа</p>
                <p className="text-4xl font-bold text-yellow-300">{lotteryPreview.totalLotteries}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-emerald-100 mb-2">⚠️ Алгасагдах гүйлгээ</p>
                <p className="text-4xl font-bold text-red-300">{lotteryPreview.skippedTransactions}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
              <p className="text-sm text-yellow-100">
                💡 <strong>{lotteryPreview.validTransactions}</strong> гүйлгээнээс <strong>{lotteryPreview.totalLotteries}</strong> сугалаа үүснэ.
                {lotteryPreview.skippedTransactions > 0 && ` ${lotteryPreview.skippedTransactions} гүйлгээ хэтэрхий бага дүнтэй тул алгасагдана.`}
              </p>
            </div>
          </div>
        )}


        {/* Хадгалах товч */}
        {parsedData.length > 0 && !saveResult && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 space-y-4">
            <button
              onClick={saveToDatabase}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-yellow-500/50 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Датабазд хадгалах ({parsedData.length} гүйлгээ)
                </>
              )}
            </button>
          </div>
        )}

        {/* Success Result - Хадгалсны дараах үр дүн */}
        {saveResult && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 border border-green-400 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Save className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">✅ Амжилттай хадгаллаа!</h2>
                <p className="text-green-100 text-sm mt-1">Гүйлгээний мэдээлэл database-д хадгалагдлаа</p>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-green-100 mb-2">📊 Нийт гүйлгээ</p>
                <p className="text-4xl font-bold text-white">{saveResult.totalTransactions}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-green-100 mb-2">🎫 Үүссэн сугалаа</p>
                <p className="text-4xl font-bold text-yellow-300">{saveResult.totalLotteries}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-green-100 mb-2">⚠️ Алгасагдсан</p>
                <p className="text-4xl font-bold text-red-300">{saveResult.skippedNoPhone}</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 mb-6">
              <p className="text-sm text-yellow-100">
                💡 <strong>{saveResult.skippedNoPhone}</strong> гүйлгээ утасны дугаар байхгүйгээс алгасагдсан.
                {saveResult.skippedNoPhone > 0 && ' Эдгээр гүйлгээнд сугалаа үүсээгүй.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSaveResult(null);
                  setParsedData([]);
                  setLotteryPreview(null);
                  setFile(null);
                }}
                className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-semibold"
              >
                Дахин импортлох
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="flex-1 px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold"
              >
                Буцах
              </button>
            </div>
          </div>
        )}

        {/* Сугалаа үүсгэх хэсэг */}
        {carData && lotteryStats && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-6 border border-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">Сугалаа үүсгэх</h2>
            </div>

            {/* Статистик */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-purple-200 mb-1">Үүссэн сугалаа</p>
                <p className="text-3xl font-bold text-white">{lotteryStats.totalLotteries}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-purple-200 mb-1">Боловсруулаагүй гүйлгээ</p>
                <p className="text-3xl font-bold text-yellow-300">{lotteryStats.unprocessed}</p>
              </div>
            </div>

            {/* Үүсгэх товч */}
            <button
              onClick={async () => {
                if (!carData) return;

                const ticketPrice = prompt('Нэг сугалааны үнийг оруулна уу (₮):', '20000');
                if (!ticketPrice || isNaN(Number(ticketPrice))) {
                  alert('Буруу үнэ оруулсан байна');
                  return;
                }

                setIsGeneratingLottery(true);

                try {
                  const response = await fetch('/api/lottery/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      carId: parseInt(carId!),
                      ticketPrice: parseInt(ticketPrice),
                      processAll: false,
                    }),
                  });

                  const result = await response.json();

                  if (result.success) {
                    alert(`✅ ${result.statistics.generatedLotteries} сугалаа үүслээ!\n\n` +
                          `• Боловсруулсан гүйлгээ: ${result.statistics.processedTransactions}\n` +
                          `• Алгасагдсан: ${result.statistics.skippedTransactions}`);

                    // Refresh stats
                    const statsResponse = await fetch(`/api/lottery/generate?carId=${carId}`);
                    const statsData = await statsResponse.json();
                    setLotteryStats({
                      totalLotteries: statsData.statistics.totalLotteries,
                      unprocessed: statsData.statistics.unprocessedTransactions,
                    });
                  } else {
                    alert(`❌ Алдаа гарлаа: ${result.error}`);
                  }
                } catch (err) {
                  alert('Серверийн алдаа гарлаа');
                  console.error(err);
                } finally {
                  setIsGeneratingLottery(false);
                }
              }}
              disabled={isGeneratingLottery || lotteryStats.unprocessed === 0}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg hover:shadow-green-500/50 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingLottery ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Үүсгэж байна...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Сугалаа үүсгэх ({lotteryStats.unprocessed} гүйлгээ)
                </>
              )}
            </button>

            <p className="text-xs text-purple-200 mt-3 text-center">
              💡 Зөвхөн шинэ (боловсруулаагүй) гүйлгээнүүдээс сугалаа үүснэ
            </p>
          </div>
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
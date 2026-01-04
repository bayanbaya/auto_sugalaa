'use client';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, XCircle, Trash2, RefreshCw, Save, ArrowLeft, Car, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

interface ImportStats {
  totalTransactions: number;
  totalLotteries: number;
  skippedTransactions: number;
  reasons: string[];
  transactions?: any[];
  lotteries?: any[];
  skippedDetails?: any[];
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
  const [loadingSession, setLoadingSession] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<LotteryEntry[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [expandedSection, setExpandedSection] = useState<'transactions' | 'lotteries' | 'skipped' | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [editedDescription, setEditedDescription] = useState('');

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

    return lotteryEntries;
  }, [validateAndCleanEntry]);

  // Файл upload + автоматаар хадгалах
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.currentTarget.files?.[0];
    if (!uploadedFile) return;

    if (!employeeName.trim()) {
      setError('Системд нэвтрээгүй байна');
      e.currentTarget.value = '';
      return;
    }

    if (!carId || !carData) {
      setError('Машин сонгогдоогүй байна');
      e.currentTarget.value = '';
      return;
    }

    setIsProcessing(true);
    setError('');
    setParsedData([]);
    setImportStats(null);
    setUploadProgress(0);
    setProgressMessage('Файл уншиж байна...');

    try {
      validateFile(uploadedFile);
      setFile(uploadedFile);
      setUploadProgress(10);

      const buffer = await uploadedFile.arrayBuffer();
      setUploadProgress(25);
      setProgressMessage('Excel файл боловсруулж байна...');

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
      setUploadProgress(40);

      const data = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd hh:mm:ss'
      }) as ExcelRow[];

      setUploadProgress(55);
      setProgressMessage('Дансны дугаар шалгаж байна...');

      // ============================================
      // ХАМГИЙН ЭХЭНД ДАНС ШАЛГАХ - 6, 7-р мөр, D-E-F багана
      // ============================================
      if (!carData) {
        throw new Error('Машин сонгогдоогүй байна!');
      }

      // 6-р мөр (index 5) эсвэл 7-р мөр (index 6) -ээс данс шалгах
      let accountNumber = '';

      // 6-р мөрнөөс эхлээд шалгах
      if (data.length > 5) {
        const row6 = data[5];
        accountNumber = String(row6[3] || row6[4] || row6[5] || '').trim(); // D, E, F багана
      }

      // Хэрэв 6-р мөрөнд байхгүй бол 7-р мөрнөөс шалгах
      if (!accountNumber && data.length > 6) {
        const row7 = data[6];
        accountNumber = String(row7[3] || row7[4] || row7[5] || '').trim(); // D, E, F багана
      }

      console.log('═══════════════════════════════════');
      console.log('📋 ХУУЛГЫН ДАНС:');
      console.log('   ', accountNumber);
      console.log('');
      console.log('🎰 СУГАЛААНЫ ДАНС:');
      console.log('   ', carData.iban);
      console.log('═══════════════════════════════════');

      // Дансны дугаар олдоогүй бол алдаа
      if (!accountNumber) {
        throw new Error(
          `Excel файлаас дансны дугаар олдсонгүй!\n\n` +
          `6-р болон 7-р мөр, D-E-F баганаас дансны дугаар хайсан боловч олдсонгүй.\n\n` +
          `Зөв форматтай Excel файл оруулна уу!`
        );
      }

      // Зай арилгах
      const cleanExcelAccount = accountNumber.replace(/\s+/g, '');
      const cleanCarAccount = carData.iban.replace(/\s+/g, '');

      // ДАНС ТААРУУЛАХ ШАЛГАЛТ - Энэ нь хамгийн чухал!
      if (cleanExcelAccount !== cleanCarAccount) {
        throw new Error(
          `❌ ДАНС ЗӨРҮҮТЭЙ!\n\n` +
          `Таны сонгосон машин: ${carData.carName}\n` +
          `Машины данс: ${carData.iban}\n\n` +
          `Excel файлын данс: ${accountNumber}\n\n` +
          `⚠️ Зөв дансны statement-ийг оруулна уу!`
        );
      }

      // Данс зөв бол үргэлжлүүлэх
      console.log('✅ Данс зөв байна! Үргэлжлүүлж байна...');
      setProgressMessage('Өгөгдөл боловсруулж байна...');

      const lotteryEntries = await processLotteryData(data);
      setParsedData(lotteryEntries);
      setUploadProgress(70);

      // Автоматаар хадгалах
      let filteredData = lotteryEntries;
      
      if (lastSavedDate) {
        filteredData = lotteryEntries.filter(entry => {
          const entryDate = new Date(entry.guildgeeniiOgnoo);
          const savedDate = new Date(lastSavedDate);
          return entryDate > savedDate;
        });

        if (filteredData.length === 0) {
          setError(`Шинэ өгөгдөл олдсонгүй. Сүүлд хадгалсан огноо: ${lastSavedDate}`);
          setIsProcessing(false);
          e.currentTarget.value = '';
          return;
        }
      }

      setProgressMessage('Серверт хадгалж байна...');
      setUploadProgress(80);

      const payload = {
        metadata: {
          importDate: new Date().toISOString(),
          totalRecords: filteredData.length,
          fileName: uploadedFile.name,
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

      setUploadProgress(90);
      const result = await response.json();
      setUploadProgress(95);

      const latestDate = filteredData.reduce((latest, entry) => {
        const entryDate = new Date(entry.guildgeeniiOgnoo);
        return entryDate > new Date(latest) ? entry.guildgeeniiOgnoo : latest;
      }, filteredData[0].guildgeeniiOgnoo);

      setLastSavedDate(latestDate);

      // Үр дүн хадгалах
      setImportStats({
        totalTransactions: result.data?.totalTransactions || filteredData.length,
        totalLotteries: result.data?.totalLotteries || 0,
        skippedTransactions: result.data?.skippedTransactions || 0,
        reasons: result.data?.skippedReasons || [],
        transactions: result.data?.transactions || [],
        lotteries: result.data?.lotteries || [],
        skippedDetails: result.data?.skippedDetails || []
      });

      setUploadProgress(100);
      setProgressMessage('Амжилттай хадгаллаа!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Excel файл боловсруулахад алдаа гарлаа';
      setError(errorMessage);
      setFile(null);
      setUploadProgress(0);
      setProgressMessage('');
    } finally {
      setIsProcessing(false);
      e.currentTarget.value = '';
    }
  }, [validateFile, processLotteryData, employeeName, carId, carData, lastSavedDate]);



  // Бүх зүйлийг цэвэрлэх
  const resetAll = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setError('');
    setLastSavedDate(null);
    setImportStats(null);
  }, []);

  // Алгасагдсан гүйлгээг засварлах
  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditedDescription(transaction.guildgeeniiUtga || '');
  };

  // Засварласан гүйлгээг сугалаа болгох
  const handleSaveEditedTransaction = async () => {
    if (!editingTransaction || !carId) return;

    try {
      // Утсны дугаар ялгаж авах (зайгүй 8 оронтой дугаар)
      const phoneMatch = editedDescription.match(/\b\d{8}\b/);

      if (!phoneMatch) {
        setError('Гүйлгээний утгаас утасны дугаар олдсонгүй (8 оронтой дугаар шаардлагатай)');
        return;
      }

      const phoneNumber = phoneMatch[0];

      // Lottery object үүсгэх
      const lotteryData = {
        phone: phoneNumber,
        lotteryName: carId,
        transactionId: editingTransaction.transactionId || `edited-${Date.now()}`,
        amount: editingTransaction.credit,
        date: editingTransaction.guildgeeniiOgnoo,
        description: editedDescription
      };

      // Backend руу хадгалах
      const response = await fetch('/api/lottery/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotteryData)
      });

      if (!response.ok) {
        throw new Error('Сугалаа үүсгэхэд алдаа гарлаа');
      }

      // Stats шинэчлэх - skipped-ийг хасаж, lottery нэмэх
      if (importStats) {
        const updatedStats = {
          ...importStats,
          skippedTransactions: importStats.skippedTransactions - 1,
          totalLotteries: importStats.totalLotteries + 1,
          skippedDetails: importStats.skippedDetails?.filter((item: any) => item !== editingTransaction),
          lotteries: [...(importStats.lotteries || []), lotteryData]
        };
        setImportStats(updatedStats);
      }

      // Modal хаах
      setEditingTransaction(null);
      setEditedDescription('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
    }
  };

  if (loadingCar || loadingSession) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-3 sm:p-4">
      <div className="max-w-5xl mx-auto space-y-3">
        {/* Header - iOS 26 Compact */}
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

        {/* Car Info - iOS 26 Floating Card */}
        {carData && (
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
              <div className="text-[12px] font-mono text-[#86868b]">{carData.iban }</div>
            </div>
          </div>
        )}

        {!carData && !loadingCar && (
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
        )}

        {/* Upload Card - Hide when results shown */}
        {!importStats && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#007aff]/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-[#007aff]" />
                </div>
                <div>
                  <h1 className="text-[15px] font-semibold text-[#1d1d1f]">Excel импорт</h1>
                  <p className="text-[11px] text-[#86868b]">Сугалааны гүйлгээ</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isProcessing
                  ? 'border-[#007aff]/30 bg-[#007aff]/5 cursor-wait'
                  : 'border-[#d1d1d6] hover:border-[#007aff]/50 hover:bg-[#007aff]/5'
              }`}>
                {isProcessing ? (
                  <div className="text-center px-6 w-full">
                    <RefreshCw className="w-7 h-7 text-[#007aff] mx-auto mb-2 animate-spin" />
                    <p className="text-[13px] font-medium text-[#1d1d1f] mb-2">{progressMessage}</p>
                    <div className="w-full bg-[#d1d1d6]/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#007aff] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#86868b] mt-1.5">{uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-2xl bg-[#007aff]/10 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5 text-[#007aff]" />
                    </div>
                    <p className="text-[13px] font-medium text-[#1d1d1f]">
                      {file ? `${file.name}` : 'Файл сонгох'}
                    </p>
                    <p className="text-[11px] text-[#86868b] mt-0.5">.xlsx, .xls · 10MB</p>
                  </div>
                )}
                <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={isProcessing} />
              </label>
            </div>
          </div>
        )}

        {/* Error - iOS 26 Alert */}
        {error && (
          <div className="bg-[#ff3b30]/10 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-[#ff3b30]/20">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-[#ff3b30]" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[13px] font-semibold text-[#1d1d1f] mb-1">Алдаа</p>
                <p className="text-[12px] text-[#86868b] leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results - iOS 26 Compact Stats */}
        {importStats && (
          <div className="space-y-3">
            <div className="px-1">
              <h2 className="text-[13px] font-semibold text-[#1d1d1f]">Үр дүн</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Transactions */}
              <button
                onClick={() => setExpandedSection(expandedSection === 'transactions' ? null : 'transactions')}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                    <span className="text-[14px]">💳</span>
                  </div>
                  {expandedSection === 'transactions' ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#34c759]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
                  )}
                </div>
                <p className="text-[10px] text-[#86868b] mb-1">Гүйлгээ</p>
                <p className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">{importStats.totalTransactions}</p>
              </button>

              {/* Lotteries */}
              <button
                onClick={() => setExpandedSection(expandedSection === 'lotteries' ? null : 'lotteries')}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#007aff]/10 flex items-center justify-center">
                    <span className="text-[14px]">🎫</span>
                  </div>
                  {expandedSection === 'lotteries' ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#007aff]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
                  )}
                </div>
                <p className="text-[10px] text-[#86868b] mb-1">Сугалаа</p>
                <p className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">{importStats.totalLotteries}</p>
              </button>

              {/* Skipped */}
              <button
                onClick={() => setExpandedSection(expandedSection === 'skipped' ? null : 'skipped')}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#ff3b30]/10 flex items-center justify-center">
                    <span className="text-[14px]">⚠️</span>
                  </div>
                  {expandedSection === 'skipped' ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#ff3b30]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
                  )}
                </div>
                <p className="text-[10px] text-[#86868b] mb-1">Алдаатай гүйлгээ</p>
                <p className="text-[20px] font-bold text-[#1d1d1f] tabular-nums">{importStats.skippedTransactions}</p>
              </button>
            </div>

            {/* Transaction Details */}
            {expandedSection === 'transactions' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Гүйлгээний дэлгэрэнгүй</h3>
                  <span className="text-[11px] text-[#86868b]">{importStats.totalTransactions} гүйлгээ</span>
                </div>
                {importStats.transactions && importStats.transactions.length > 0 ? (
                  <div className="space-y-2  overflow-y-auto">
                    {importStats.transactions.map((tx: any, i: number) => (
                      <div key={i} className="bg-[#f5f5f7] rounded-2xl p-3 hover:bg-[#e5e5ea] transition-all active:scale-[0.98]">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-[15px] font-semibold text-[#34c759] tabular-nums">{tx.credit?.toLocaleString()}₮</p>
                            <p className="text-[11px] text-[#86868b] mt-0.5">{new Date(tx.guildgeeniiOgnoo).toLocaleDateString('mn-MN')}</p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                            tx.islottery
                              ? 'bg-[#34c759]/10 text-[#34c759]'
                              : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                          }`}>
                            {tx.islottery ? '✓ Сугалаа' : '✗'}
                          </div>
                        </div>
                        {tx.guildgeeniiUtga && (
                          <p className="text-[11px] text-[#86868b] line-clamp-1">{tx.guildgeeniiUtga}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#86868b] text-center py-8 text-[12px]">Мэдээлэл байхгүй</p>
                )}
              </div>
            )}

            {/* Lottery Details */}
            {expandedSection === 'lotteries' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Сугалааны дэлгэрэнгүй</h3>
                  <span className="text-[11px] text-[#86868b]">{importStats.totalLotteries} сугалаа</span>
                </div>

                {importStats.lotteries && importStats.lotteries.length > 0 ? (
                  <div className="space-y-2  overflow-y-auto">
                    {(() => {
                      const phoneGroups = importStats.lotteries.reduce((acc: any, lottery: any) => {
                        const phone = lottery.phoneNumber || 'Тодорхойгүй';
                        if (!acc[phone]) acc[phone] = [];
                        acc[phone].push(lottery);
                        return acc;
                      }, {});

                      return Object.entries(phoneGroups).map(([phone, lotteries]: [string, any]) => (
                        <div key={phone} className="bg-[#f5f5f7] rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setSelectedPhone(selectedPhone === phone ? null : phone)}
                            className="w-full p-3 hover:bg-[#e5e5ea] transition-all text-left active:scale-[0.98]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#007aff]/10 flex items-center justify-center">
                                  <span className="text-[16px]">📱</span>
                                </div>
                                <span className="text-[13px] font-semibold text-[#1d1d1f]">{phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="text-[17px] font-bold text-[#1d1d1f] tabular-nums">{lotteries.length}</p>
                                  <p className="text-[10px] text-[#86868b]">сугалаа</p>
                                </div>
                                {selectedPhone === phone ? (
                                  <ChevronUp className="w-4 h-4 text-[#86868b]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#86868b]" />
                                )}
                              </div>
                            </div>
                          </button>

                          {selectedPhone === phone && (
                            <div className="px-3 pb-3 space-y-2">
                              {lotteries.map((lottery: any, i: number) => (
                                <div key={i} className="bg-white rounded-xl p-2.5">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[12px] font-mono font-semibold text-[#007aff]">{lottery.lotteryNumber}</p>
                                    <p className="text-[12px] font-semibold text-[#34c759] tabular-nums">{lottery.transactionAmount?.toLocaleString()}₮</p>
                                  </div>
                                  <p className="text-[10px] text-[#86868b] mt-1">{new Date(lottery.createdAt).toLocaleDateString('mn-MN')}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-[#86868b] text-center py-8 text-[12px]">Мэдээлэл байхгүй</p>
                )}
              </div>
            )}

            {/* Skipped Details */}
            {expandedSection === 'skipped' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/5">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Алгасагдсан гүйлгээ</h3>
                  <span className="text-[11px] text-[#86868b]">{importStats.skippedTransactions} гүйлгээ</span>
                </div>
                {importStats.skippedDetails && importStats.skippedDetails.length > 0 ? (
                  <div className="space-y-2  overflow-y-auto">
                    {importStats.skippedDetails.map((item: any, i: number) => (
                      <div key={i} className="bg-[#f5f5f7] rounded-2xl p-3 hover:bg-[#e5e5ea] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[15px] font-semibold text-[#ff3b30] tabular-nums">{item.credit?.toLocaleString()}₮</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-[#86868b]">{new Date(item.guildgeeniiOgnoo).toLocaleDateString('mn-MN')}</p>
                            <button
                              onClick={() => handleEditTransaction(item)}
                              className="px-2 py-1 rounded-lg bg-[#007aff] text-white text-[10px] font-medium hover:bg-[#0051d5] active:scale-95 transition-all"
                            >
                              Засах
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#ff3b30]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px]">⚠️</span>
                          </div>
                          <p className="text-[12px] text-[#86868b]">{item.skipReason || 'Тодорхойгүй'}</p>
                        </div>
                        {item.guildgeeniiUtga && (
                          <p className="text-[11px] text-[#86868b] line-clamp-1 pl-7">{item.guildgeeniiUtga}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : importStats.reasons && importStats.reasons.length > 0 ? (
                  <div className="bg-[#f5f5f7] rounded-2xl p-3">
                    <ul className="space-y-1.5">
                      {importStats.reasons.map((reason, i) => (
                        <li key={i} className="text-[12px] text-[#86868b] flex items-center gap-2">
                          <span className="text-[#ff3b30]">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[#86868b] text-center py-8 text-[12px]">Мэдээлэл байхгүй</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit Transaction Modal - iOS 26 Style */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-black/5">
                <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Гүйлгээ засах</h2>
                <p className="text-[13px] text-[#86868b] mt-1">
                  Утасны дугаар оруулж сугалаанд оруулах
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                {/* Transaction Info */}
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[17px] font-semibold text-[#34c759] tabular-nums">
                      {editingTransaction.credit?.toLocaleString()}₮
                    </p>
                    <p className="text-[12px] text-[#86868b]">
                      {new Date(editingTransaction.guildgeeniiOgnoo).toLocaleDateString('mn-MN')}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#86868b]">
                    {editingTransaction.skipReason}
                  </p>
                </div>

                {/* Edit Field */}
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    Гүйлгээний утга
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Утасны дугаар агуулсан текст оруулна уу (жишээ: 99112233)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#d2d2d7]
                      text-[15px] text-[#1d1d1f] placeholder-[#86868b]
                      focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent
                      transition-all duration-200 resize-none"
                  />
                  <p className="text-[11px] text-[#86868b] mt-2">
                    💡 8 оронтой утасны дугаар автоматаар таних болно
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl px-4 py-3">
                    <p className="text-[13px] text-[#ff3b30]">{error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setEditedDescription('');
                    setError('');
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] text-[15px] font-medium
                    hover:bg-[#e5e5ea] active:scale-[0.98] transition-all"
                >
                  Болих
                </button>
                <button
                  onClick={handleSaveEditedTransaction}
                  className="flex-1 py-3 rounded-xl bg-[#007aff] text-white text-[15px] font-medium
                    hover:bg-[#0051d5] active:scale-[0.98] transition-all"
                >
                  Хадгалах
                </button>
              </div>
            </div>
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
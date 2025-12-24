'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Trash2, RefreshCw, Save, Edit2, Check, X, ArrowLeft, Car, AlertCircle } from 'lucide-react';

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

export default function LotteryImportSystem() {
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [employeeName, setEmployeeName] = useState('');

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
  const validateAndCleanEntry = useCallback((row: any[], index: number) => {
    const date = row[0];
    const branch = row[1];
    const startBalance = row[2];
    const debit = row[3];
    const credit = row[4];
    const endBalance = row[5];
    const description = row[6];
    const counterAccount = row[7];

    const creditAmount = parseFloat(credit);
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
      ehniilUldegdel: parseFloat(startBalance) || 0,
      etsiin_Uldegdel: parseFloat(endBalance) || 0,
      importDate: new Date().toISOString(),
      rowNumber: index + 9,
      isValid: true
    };
  }, []);

  // Excel боловсруулах
  const processLotteryData = useCallback((rawData: any[]) => {
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
        lotteryEntries.push(result as LotteryEntry);
      }
    });

    if (lotteryEntries.length === 0) {
      throw new Error('Сугалааны гүйлгээ олдсонгүй. Credit гүйлгээтэй мөр байхгүй байна.');
    }

    setParsedData(lotteryEntries);
  }, [validateAndCleanEntry]);

  // Файл upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!employeeName.trim()) {
      setError('Ажилтны нэрээ оруулна уу');
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    setError('');
    setParsedData([]);
    setEditingIndex(null);
    setEditValue('');

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
      });

      processLotteryData(data);
    } catch (err: any) {
      setError(err.message || 'Excel файл боловсруулахад алдаа гарлаа');
      setFile(null);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  }, [validateFile, processLotteryData, employeeName]);

  // Засах
  const startEdit = useCallback((index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditValue(currentValue);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingIndex !== null) {
      const updated = [...parsedData];
      updated[editingIndex].guildgeeniiUtga = editValue;
      setParsedData(updated);
      setEditingIndex(null);
      setEditValue('');
    }
  }, [editingIndex, editValue, parsedData]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditValue('');
  }, []);

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
      
      alert(`Амжилттай хадгаллаа! ${filteredData.length} гүйлгээ нэмэгдлээ.`);
    } catch (err: any) {
      alert('Хадгалахад алдаа гарлаа: ' + err.message);
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
    setEditingIndex(null);
    setEditValue('');
  }, []);

  // Форматласан валют
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + '₮';
  }, []);

  // Огноо форматлах
  const formatDate = useCallback((dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('mn-MN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }, []);

  if (loadingCar) {
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

        {/* Статистик */}
        {stats && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Нийт мэдээлэл</h2>
              </div>
              {employeeName && (
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400">
                  <span className="text-sm font-semibold text-yellow-300">Ажилтан:</span>
                  <span className="text-sm font-bold text-yellow-200">{employeeName}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-2">Нийт гүйлгээ</p>
                <p className="text-4xl font-bold">{stats.totalEntries}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-2">Нийт орлого</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Хүснэгт */}
        {parsedData.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <FileSpreadsheet className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Гүйлгээний жагсаалт</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">№</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Огноо</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Салбар</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Дүн</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Гүйлгээний утга</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Данс</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((entry, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{formatDate(entry.guildgeeniiOgnoo)}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{entry.salbar}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-400">
                        {formatCurrency(entry.credit)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {editingIndex === index ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-2 py-1 bg-white/90 border border-yellow-400 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
                              autoFocus
                            />
                            <button
                              onClick={saveEdit}
                              className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              title="Хадгалах"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              title="Цуцлах"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="max-w-xs truncate block" title={entry.guildgeeniiUtga}>
                            {entry.guildgeeniiUtga}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{entry.haritsanDans}</td>
                      <td className="px-4 py-3 text-center">
                        {editingIndex !== index && (
                          <button
                            onClick={() => startEdit(index, entry.guildgeeniiUtga)}
                            className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                            title="Засах"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Хадгалах товч */}
        {parsedData.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
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
      </div>
    </div>
  );
}

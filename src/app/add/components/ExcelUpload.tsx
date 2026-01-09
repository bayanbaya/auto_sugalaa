import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { CarData, LotteryEntry, ExcelRow, ValidationResult, ImportStats } from '../types';

interface ExcelUploadProps {
  carData: CarData | null;
  employeeName: string;
  carId: string | null;
  lastSavedDate: string | null;
  file: File | null;
  isProcessing: boolean;
  uploadProgress: number;
  progressMessage: string;
  onFileSet: (file: File | null) => void;
  onDataParsed: (data: LotteryEntry[]) => void;
  onError: (error: string) => void;
  onImportComplete: (stats: ImportStats | null) => void;
  onLastSavedDateUpdate: (date: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  onProgressUpdate: (progress: number, message: string) => void;
}

export function ExcelUpload({
  carData,
  employeeName,
  carId,
  lastSavedDate,
  file,
  isProcessing,
  uploadProgress,
  progressMessage,
  onFileSet,
  onDataParsed,
  onError,
  onImportComplete,
  onLastSavedDateUpdate,
  onProcessingChange,
  onProgressUpdate,
}: ExcelUploadProps) {

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

  const validateAndCleanEntry = useCallback((row: ExcelRow, index: number): ValidationResult | null => {
    const date = row[0];
    const branch = row[1];
    const startBalance = row[2];
    const credit = row[4];
    const endBalance = row[5];
    const description = row[6];
    const counterAccount = row[7];

    const creditAmount = parseFloat(String(credit || 0));

    // ✅ Зөвхөн Credit = 0 байвал алгасна
    if (!creditAmount || creditAmount <= 0) {
      return null;
    }

    const dateStr = String(date || '').trim();

    return {
      guildgeeniiOgnoo: dateStr || new Date().toISOString(),
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

  const processLotteryData = useCallback(async (rawData: ExcelRow[]) => {
    if (rawData.length < 9) {
      throw new Error('Excel файл хоосон эсвэл буруу форматтай байна. 9-р мөрнөөс өгөгдөл эхлэх ёстой.');
    }

    const dataRows = rawData.slice(8).filter(row => {
      // ✅ Зөвхөн хоосон мөрүүдийг л алгасна
      if (!row || row.length === 0) return false;

      const firstCell = String(row[0] || '').trim().toLowerCase();
      // "Нийт" гэсэн мөрийг л алгасна, бусад бүгдийг авна
      if (firstCell.includes('нийт')) {
        return false;
      }

      return true;
    });

    const lotteryEntries: LotteryEntry[] = [];

    dataRows.forEach((row, index) => {
      const result = validateAndCleanEntry(row, index);
      // ✅ БҮХ мөрийг авна - validation шалгалтгүй
      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isValid, ...entryData } = result;
        lotteryEntries.push(entryData as LotteryEntry);
      }
    });

    if (lotteryEntries.length === 0) {
      throw new Error('Excel файл хоосон эсвэл мөр байхгүй байна.');
    }

    return lotteryEntries;
  }, [validateAndCleanEntry]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.currentTarget.files?.[0];
    if (!uploadedFile) return;

    if (!employeeName.trim()) {
      onError('Системд нэвтрээгүй байна');
      e.currentTarget.value = '';
      return;
    }

    if (!carId || !carData) {
      onError('Машин сонгогдоогүй байна');
      e.currentTarget.value = '';
      return;
    }

    onProcessingChange(true);
    onError('');
    onDataParsed([]);
    onImportComplete(null);
    onProgressUpdate(0, 'Файл уншиж байна...');

    try {
      validateFile(uploadedFile);
      onFileSet(uploadedFile);
      onProgressUpdate(10, 'Файл уншиж байна...');

      const buffer = await uploadedFile.arrayBuffer();
      onProgressUpdate(25, 'Excel файл боловсруулж байна...');

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
      onProgressUpdate(40, 'Excel файл боловсруулж байна...');

      const data = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd hh:mm:ss'
      }) as ExcelRow[];

      onProgressUpdate(55, 'Дансны дугаар шалгаж байна...');

      // Данс шалгах - 6, 7-р мөр, D-E-F багана
      if (!carData) {
        throw new Error('Машин сонгогдоогүй байна!');
      }

      let accountNumber = '';

      if (data.length > 5) {
        const row6 = data[5];
        accountNumber = String(row6[3] || row6[4] || row6[5] || '').trim();
      }

      if (!accountNumber && data.length > 6) {
        const row7 = data[6];
        accountNumber = String(row7[3] || row7[4] || row7[5] || '').trim();
      }

      console.log('═══════════════════════════════════');
      console.log('📋 ХУУЛГЫН ДАНС:', accountNumber);
      console.log('🎰 СУГАЛААНЫ ДАНС:', carData.iban);
      console.log('═══════════════════════════════════');

      if (!accountNumber) {
        throw new Error(
          `Excel файлаас дансны дугаар олдсонгүй!\n\n` +
          `6-р болон 7-р мөр, D-E-F баганаас дансны дугаар хайсан боловч олдсонгүй.\n\n` +
          `Зөв форматтай Excel файл оруулна уу!`
        );
      }

      const cleanExcelAccount = accountNumber.replace(/\s+/g, '');
      const cleanCarAccount = carData.iban.replace(/\s+/g, '');

      if (cleanExcelAccount !== cleanCarAccount) {
        throw new Error(
          `❌ ДАНС ЗӨРҮҮТЭЙ!\n\n` +
          `Таны сонгосон машин: ${carData.carName}\n` +
          `Машины данс: ${carData.iban}\n\n` +
          `Excel файлын данс: ${accountNumber}\n\n` +
          `⚠️ Зөв дансны statement-ийг оруулна уу!`
        );
      }

      console.log('✅ Данс зөв байна! Үргэлжлүүлж байна...');
      onProgressUpdate(70, 'Өгөгдөл боловсруулж байна...');

      const lotteryEntries = await processLotteryData(data);
      onDataParsed(lotteryEntries);

      // ✅ DB-аас хамгийн сүүлийн гүйлгээний огноог автоматаар татах
      onProgressUpdate(75, 'Сүүлийн гүйлгээний огноо шалгаж байна...');
      let dbLastDate: string | null = null;

      try {
        const lastTxResponse = await fetch(`/api/cars/last-transaction?carId=${carId}`);
        if (lastTxResponse.ok) {
          const lastTxData = await lastTxResponse.json();
          dbLastDate = lastTxData.lastTransactionDate;
          console.log('🔍 DB-ийн сүүлийн огноо:', dbLastDate);
        }
      } catch (err) {
        console.warn('Сүүлийн огноо татахад алдаа:', err);
        // Алдаа гарсан ч үргэлжлүүлнэ
      }

      // Автоматаар хадгалах - DB эсвэл lastSavedDate ашиглана
      let filteredData = lotteryEntries;
      const filterDate = dbLastDate || lastSavedDate;

      if (filterDate) {
        filteredData = lotteryEntries.filter(entry => {
          const entryDate = new Date(entry.guildgeeniiOgnoo);
          const savedDate = new Date(filterDate);
          return entryDate > savedDate;
        });

        if (filteredData.length === 0) {
          onError(`Шинэ өгөгдөл олдсонгүй. Сүүлд хадгалсан огноо: ${filterDate}`);
          onProcessingChange(false);
          e.currentTarget.value = '';
          return;
        }

        console.log(`✅ ${lotteryEntries.length} мөрөөс ${filteredData.length} шинэ мөр олдлоо`);
      }

      onProgressUpdate(80, 'Серверт хадгалж байна...');

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

      onProgressUpdate(90, 'Серверт хадгалж байна...');
      const result = await response.json();
      onProgressUpdate(95, 'Серверт хадгалж байна...');

      const latestDate = filteredData.reduce((latest, entry) => {
        const entryDate = new Date(entry.guildgeeniiOgnoo);
        return entryDate > new Date(latest) ? entry.guildgeeniiOgnoo : latest;
      }, filteredData[0].guildgeeniiOgnoo);

      onLastSavedDateUpdate(latestDate);

      onImportComplete({
        totalTransactions: result.data?.transactions?.length || 0, // ✅ Зөвхөн хадгалагдсан гүйлгээ
        totalLotteries: result.data?.totalLotteries || 0,
        skippedTransactions: result.data?.skippedTransactions || 0,
        reasons: result.data?.skippedReasons || [],
        transactions: result.data?.transactions || [],
        lotteries: result.data?.lotteries || [],
        skippedDetails: result.data?.skippedDetails || []
      });

      onProgressUpdate(100, 'Амжилттай хадгаллаа!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Excel файл боловсруулахад алдаа гарлаа';
      onError(errorMessage);
      onFileSet(null);
      onProgressUpdate(0, '');
    } finally {
      onProcessingChange(false);
      e.currentTarget.value = '';
    }
  }, [validateFile, processLotteryData, employeeName, carId, carData, lastSavedDate, onFileSet, onDataParsed, onError, onImportComplete, onLastSavedDateUpdate, onProcessingChange, onProgressUpdate]);

  return (
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
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>
      </div>
    </div>
  );
}

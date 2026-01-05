export interface LotteryEntry {
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

export interface CarData {
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

export interface ExcelRow extends Array<string | number | null | undefined> {
  [index: number]: string | number | null | undefined;
}

export interface ValidationResult {
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

export interface ImportStats {
  totalTransactions: number;
  totalLotteries: number;
  skippedTransactions: number;
  reasons: string[];
  transactions?: any[];
  lotteries?: any[];
  skippedDetails?: any[];
}

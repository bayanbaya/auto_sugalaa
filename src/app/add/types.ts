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

interface Transaction {
  id?: number;
  credit: number;
  guildgeeniiOgnoo: string;
  guildgeeniiUtga?: string;
  islottery?: number;
}

interface Lottery {
  lotteryNumber: string;
  createdAt: string;
  transactionAmount: number;
  phoneNumber?: string;
}

interface SkippedDetail {
  credit: number;
  guildgeeniiOgnoo: string;
  guildgeeniiUtga: string;
  skipReason?: string;
}

export interface ImportStats {
  totalTransactions: number;
  totalLotteries: number;
  skippedTransactions: number;
  reasons: string[];
  transactions?: Transaction[];
  lotteries?: Lottery[];
  skippedDetails?: SkippedDetail[];
}

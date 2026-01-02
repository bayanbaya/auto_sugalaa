/**
 * Сугалааны тоо тооцоолох utility функц
 * Google-style code with proper error handling and validation
 */

interface LotteryCalculationResult {
  ticketCount: number;
  grossAmount: number;
  netAmount: number;
  ticketPrice: number;
}

/**
 * QPAY-ийн шимтгэл болон tolerance тооцож сугалааны тоог тооцоолох
 *
 * @param netAmount - Цэвэр дүн (QPAY шимтгэлийн дараах дүн)
 * @param ticketPrice - Нэг сугалааны үнэ (жишээ: 20000₮)
 * @param maxTickets - Хамгийн их сугалааны тоо (default: 5000)
 * @returns Тооцоолсон сугалааны тоо болон нэмэлт мэдээлэл
 */
export function calculateTicketCount(
  netAmount: number,
  ticketPrice: number,
  maxTickets: number = 5000
): LotteryCalculationResult {
  // Input validation
  if (!Number.isFinite(netAmount) || netAmount < 0) {
    throw new Error('Invalid net amount. Must be a positive number.');
  }

  if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
    throw new Error('Invalid ticket price. Must be a positive number.');
  }

  if (!Number.isInteger(maxTickets) || maxTickets <= 0) {
    throw new Error('Invalid max tickets. Must be a positive integer.');
  }

  // Normalize: QPAY 1% шимтгэл + 2% tolerance тооцох
  // 0.98 = 1 - 0.01 (QPAY) - 0.01 (tolerance буюу нэмэлт хөнгөлөлт)
  const grossAmount = Math.floor(netAmount / 0.98);

  // Хамгийн бага үнээс доош бол 0 сугалаа
  if (grossAmount < ticketPrice) {
    return {
      ticketCount: 0,
      grossAmount,
      netAmount,
      ticketPrice,
    };
  }

  // Сугалааны тоог тооцоолох (бутархай хэсгийг хаях)
  let ticketCount = Math.floor(grossAmount / ticketPrice);

  // Maximum cap хязгаарлах
  if (ticketCount > maxTickets) {
    ticketCount = maxTickets;
  }

  return {
    ticketCount,
    grossAmount,
    netAmount,
    ticketPrice,
  };
}

/**
 * Сугалааны дугаар үүсгэх
 * Формат: {carId}-{timestamp}-{random}
 * Жишээ: 2-1704123456789-A1B2C
 *
 * @param carId - Машины ID
 * @param index - Сугалааны индекс (давхардахгүй байхын тулд)
 * @returns Unique lottery number
 */
export function generateLotteryNumber(carId: number | string, index: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${carId}-${timestamp}-${index}-${random}`;
}

/**
 * Утасны дугаар задлах (Ruby regex шиг)
 *
 * Жишээнүүд:
 * - "99189602 95518283" → "99189602"
 * - "MM:99189602 95518283 ..." → "99189602"
 * - "+976 99189602" → "99189602"
 * - "0 99 18 96 02" → "99189602"
 * - "ХААН БАНК" → null
 *
 * @param description - Гүйлгээний утга
 * @returns Parsed phone number (8 digits) or null
 */
export function extractPhoneNumber(description: string): string | null {
  if (!description || typeof description !== 'string') {
    return null;
  }

  // Ruby regex: /\b(?:\+976\s?|0)?([1-9]\d(?:\s?\d){6})\b/
  // Match Mongolian phone numbers with optional spaces
  const phonePattern = /\b(?:\+976\s?|0\s?)?([1-9]\d(?:\s?\d){6})\b/;
  const match = description.match(phonePattern);

  if (match && match[1]) {
    // Remove all spaces from the matched number
    return match[1].replace(/\s/g, '');
  }

  return null;
}

/**
 * Batch processing: олон гүйлгээнд сугалаа үүсгэх
 *
 * @param transactions - Bank transactions
 * @param ticketPrice - Нэг сугалааны үнэ
 * @returns Array of lottery entries
 */
export interface BankTransaction {
  id: number;
  carId: number;
  credit: number;
  guildgeeniUtga: string;
  guildgeeniOgnoo: string;
}

export interface LotteryEntry {
  lotteryNumber: string;
  bankTransactionId: number;
  carId: number;
  transactionAmount: number;
  phoneNumber: string | null;
  createdAt: string;
}

export function generateLotteriesFromTransactions(
  transactions: BankTransaction[],
  ticketPrice: number
): LotteryEntry[] {
  const lotteries: LotteryEntry[] = [];

  transactions.forEach((transaction) => {
    const { ticketCount } = calculateTicketCount(transaction.credit, ticketPrice);

    if (ticketCount > 0) {
      const phoneNumber = extractPhoneNumber(transaction.guildgeeniUtga);

      // Олон сугалаа үүсгэх (жишээ: 50,000₮ = 2 сугалаа)
      for (let i = 0; i < ticketCount; i++) {
        lotteries.push({
          lotteryNumber: generateLotteryNumber(transaction.carId, i),
          bankTransactionId: transaction.id,
          carId: transaction.carId,
          transactionAmount: transaction.credit,
          phoneNumber,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  return lotteries;
}

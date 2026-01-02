import { NextRequest, NextResponse } from 'next/server';
import { calculateTicketCount } from '@/lib/lotteryCalculator';

interface PreviewRequest {
  transactions: Array<{
    credit: number;
    guildgeeniiUtga: string;
  }>;
  ticketPrice: number;
}

/**
 * POST /api/lottery/preview
 *
 * Excel import хийхээс өмнө хэдэн сугалаа үүсэх вэ гэдгийг preview хийх
 */
export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { transactions, ticketPrice } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Гүйлгээний өгөгдөл байхгүй' },
        { status: 400 }
      );
    }

    if (!ticketPrice || ticketPrice <= 0) {
      return NextResponse.json(
        { error: 'Буруу ticket price' },
        { status: 400 }
      );
    }

    let totalLotteries = 0;
    let validTransactions = 0;
    let skippedTransactions = 0;

    const preview = transactions.map((tx, index) => {
      const { ticketCount, grossAmount } = calculateTicketCount(tx.credit, ticketPrice);

      if (ticketCount > 0) {
        totalLotteries += ticketCount;
        validTransactions++;
      } else {
        skippedTransactions++;
      }

      return {
        index,
        credit: tx.credit,
        grossAmount,
        ticketCount,
        description: tx.guildgeeniiUtga,
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalTransactions: transactions.length,
        validTransactions,
        skippedTransactions,
        totalLotteries,
        ticketPrice,
      },
      preview: preview.slice(0, 10), // First 10 for preview
    });
  } catch (error) {
    console.error('Preview error:', error);

    return NextResponse.json(
      {
        error: 'Preview хийхэд алдаа гарлаа',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

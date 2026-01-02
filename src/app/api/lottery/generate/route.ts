import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import {
  calculateTicketCount,
  generateLotteryNumber,
  extractPhoneNumber,
} from '@/lib/lotteryCalculator';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface GenerateRequest {
  carId: number;
  ticketPrice: number;
  processAll?: boolean; // true бол бүх bankTransactions, false бол зөвхөн шинэ
}

/**
 * POST /api/lottery/generate
 *
 * bankTransactions-аас mblottery руу сугалаа үүсгэх
 * Давхардсан гүйлгээг автоматаар алгасна
 */
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body: GenerateRequest = await request.json();
    const { carId, ticketPrice, processAll = false } = body;

    // Validation
    if (!carId || !Number.isInteger(carId) || carId <= 0) {
      return NextResponse.json(
        { error: 'Буруу carId. Эерэг тоо байх ёстой.' },
        { status: 400 }
      );
    }

    if (!ticketPrice || ticketPrice <= 0) {
      return NextResponse.json(
        { error: 'Буруу ticket price. Эерэг тоо байх ёстой.' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Step 1: bankTransactions-аас өгөгдөл татах
    let query = `
      SELECT
        bt.id,
        bt.carId,
        bt.credit,
        bt.guildgeeniUtga,
        bt.guildgeeniOgnoo
      FROM bankTransactions bt
      WHERE bt.carId = ?
    `;

    // Зөвхөн шинэ гүйлгээ боловсруулах (давхардаагүй)
    if (!processAll) {
      query += `
        AND NOT EXISTS (
          SELECT 1
          FROM mblottery ml
          WHERE ml.bankTransactionId = bt.id
        )
      `;
    }

    query += ' ORDER BY bt.guildgeeniOgnoo ASC';

    const [transactions] = await connection.execute<mysql.RowDataPacket[]>(query, [carId]);

    if (transactions.length === 0) {
      await connection.commit();
      return NextResponse.json({
        success: true,
        message: 'Боловсруулах шинэ гүйлгээ олдсонгүй',
        statistics: {
          processedTransactions: 0,
          generatedLotteries: 0,
          skippedTransactions: 0,
        },
      });
    }

    // Step 2: Сугалаа үүсгэх
    let generatedCount = 0;
    let skippedCount = 0;
    const processedTransactionIds: number[] = [];

    for (const transaction of transactions) {
      const { id: transactionId, carId: txCarId, credit, guildgeeniUtga } = transaction;

      // Calculate lottery count
      const { ticketCount } = calculateTicketCount(credit, ticketPrice);

      if (ticketCount === 0) {
        skippedCount++;
        continue;
      }

      // Extract phone number
      const phoneNumber = extractPhoneNumber(guildgeeniUtga);

      // Generate multiple lotteries for this transaction
      for (let i = 0; i < ticketCount; i++) {
        const lotteryNumber = generateLotteryNumber(txCarId, Date.now() + i);

        await connection.execute(
          `INSERT INTO mblottery
            (lotteryNumber, bankTransactionId, carId, transactionAmount, phoneNumber, createdAt)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [lotteryNumber, transactionId, txCarId, credit, phoneNumber]
        );

        generatedCount++;
      }

      processedTransactionIds.push(transactionId);
    }

    // Step 3: Update lotteryName table (sold count)
    if (generatedCount > 0) {
      await connection.execute(
        `UPDATE lotteryName
         SET sold = (
           SELECT COUNT(*)
           FROM mblottery
           WHERE carId = ?
         )
         WHERE id = ?`,
        [carId, carId]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `${generatedCount} сугалаа амжилттай үүсгэлээ`,
      statistics: {
        processedTransactions: processedTransactionIds.length,
        generatedLotteries: generatedCount,
        skippedTransactions: skippedCount,
      },
      processedTransactionIds,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Lottery generation error:', error);

    return NextResponse.json(
      {
        error: 'Сугалаа үүсгэхэд алдаа гарлаа',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * GET /api/lottery/generate?carId=1
 *
 * Тухайн машинд хэдэн гүйлгээ боловсруулагдаж, хэдэн сугалаа үүссэнийг харах
 */
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json(
        { error: 'carId шаардлагатай' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Total transactions for this car
    const [totalTxResult] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM bankTransactions WHERE carId = ?',
      [carId]
    );

    // Total lotteries generated
    const [totalLotteryResult] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM mblottery WHERE carId = ?',
      [carId]
    );

    // Unprocessed transactions (давхардаагүй)
    const [unprocessedResult] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count
       FROM bankTransactions bt
       WHERE bt.carId = ?
       AND NOT EXISTS (
         SELECT 1 FROM mblottery ml WHERE ml.bankTransactionId = bt.id
       )`,
      [carId]
    );

    return NextResponse.json({
      success: true,
      carId: parseInt(carId),
      statistics: {
        totalTransactions: totalTxResult[0].count,
        totalLotteries: totalLotteryResult[0].count,
        unprocessedTransactions: unprocessedResult[0].count,
      },
    });
  } catch (error) {
    console.error('Get statistics error:', error);

    return NextResponse.json(
      {
        error: 'Статистик авахад алдаа гарлаа',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

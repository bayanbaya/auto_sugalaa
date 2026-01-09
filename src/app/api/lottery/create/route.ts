import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

interface CountRow extends RowDataPacket {
  cnt: number;
}

function toMySQLDatetime(date: string | Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function generateLotteryNumber(carId: string, seq: number) {
  return `L${carId}-${String(seq).padStart(6, '0')}`;
}

export async function POST(req: NextRequest) {
  let connection: mysql.PoolConnection | null = null;

  try {
    const { phone, lotteryName, amount } = await req.json();

    if (!phone || !lotteryName || !amount) {
      return NextResponse.json(
        { error: 'Phone, lotteryName, болон amount шаардлагатай' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Одоогийн сугалааны sequence авах
    const [seqRows] = await connection.query<CountRow[]>(
      'SELECT COUNT(*) cnt FROM mblottery WHERE carId = ?',
      [lotteryName]
    );
    const currentSeq = seqRows[0].cnt;

    // Lottery дугаар үүсгэх
    const lotteryNumber = generateLotteryNumber(lotteryName, currentSeq + 1);
    const createdAt = toMySQLDatetime(new Date());

    // Database-д хадгалах (manual entry: is_manual=1, bankTransactionId=0)
    await connection.query<ResultSetHeader>(
      `INSERT INTO mblottery
       (lotteryNumber, createdAt, carId, transactionAmount, phoneNumber, bankTransactionId, is_manual)
       VALUES (?, ?, ?, ?, ?, 0, 1)`,
      [lotteryNumber, createdAt, lotteryName, amount, phone]
    );

    // Sold count нэмэх
    await connection.query(
      'UPDATE lotteryName SET sold = sold + 1 WHERE id = ?',
      [lotteryName]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      lotteryNumber,
      message: 'Сугалаа амжилттай үүсгэгдлээ'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lottery create error:', error);
    return NextResponse.json(
      { error: 'Сугалаа үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

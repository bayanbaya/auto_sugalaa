import { NextResponse } from "next/server";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

/* ================= DB POOL ================= */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ================= HELPERS ================= */
const TOLERANCE = 0.001; // 0.1%

function generateLotteryNumber(carId: string, seq: number) {
  return `L-${carId}-${String(seq).padStart(6, "0")}`;
}

function toMySQLDatetime(date: string | Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function parsePrice(price: string | number): number {
  return Number(String(price).replace(/[₮,]/g, ""));
}

function calculateTicketCount(amount: number, ticketPrice: number) {
  if (amount + ticketPrice * TOLERANCE < ticketPrice) return 0;
  return Math.floor((amount + ticketPrice * TOLERANCE) / ticketPrice);
}

interface LotteryImportRequest {
  metadata: {
    carId: string;
    employeeName: string;
    fileName?: string;
    importDate?: string;
    totalRecords?: number;
    lastSavedDate?: string;
  };
  data: Array<{
    guildgeeniiOgnoo: string;
    salbar: string;
    credit: number;
    guildgeeniiUtga: string;
    haritsanDans: string;
    ehniilUldegdel: number;
    etsiin_Uldegdel: number;
    importDate: string;
    rowNumber: number;
  }>;
}

interface CarRow extends RowDataPacket {
  id: string;
  sold: number;
  price: string | number;
}

interface CountRow extends RowDataPacket {
  cnt: number;
}

/* ================= POST ================= */
export async function POST(request: Request) {
  let connection: mysql.PoolConnection | null = null;

  try {
    const body = (await request.json()) as LotteryImportRequest;
    const { metadata, data } = body;

    if (!metadata?.carId || !metadata?.employeeName || !Array.isArray(data)) {
      return NextResponse.json({ error: "Буруу өгөгдөл" }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    /* ==== Машины мэдээлэл + PRICE ==== */
    const [carRows] = await connection.query<CarRow[]>(
      "SELECT id, sold, price FROM lotteryName WHERE id = ?",
      [metadata.carId]
    );

    if (!carRows.length) throw new Error("Машин олдсонгүй");

    const ticketPrice = parsePrice(carRows[0].price);
    if (!ticketPrice) throw new Error("Ticket price буруу байна");

    /* ==== Одоогийн сугалааны sequence ==== */
    const [seqRows] = await connection.query<CountRow[]>(
      "SELECT COUNT(*) cnt FROM mblottery WHERE carId = ?",
      [metadata.carId]
    );
    let currentSeq = seqRows[0].cnt;

    /* ==== Queries ==== */
    const insertTransactionQuery = `
      INSERT INTO bankTransactions
      (carId, guildgeeniiOgnoo, salbar, credit, guildgeeniiUtga,
       haritsanDans, ehniilUldegdel, etsiin_Uldegdel,
       importDate, rowNumber, employeeName, fileName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertLotteryQuery = `
      INSERT INTO mblottery
      (lotteryNumber, createdAt, bankTransactionId, carId, transactionAmount, phoneNumber)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    /* ==== Counters ==== */
    const totalTransactions = data.length;
    let transactionsWithLottery = 0;
    let totalLotteries = 0;

    /* ==== LOOP ==== */
    for (const row of data) {
      const [txResult] = await connection.query<ResultSetHeader>(
        insertTransactionQuery,
        [
          metadata.carId,
          toMySQLDatetime(row.guildgeeniiOgnoo),
          row.salbar,
          row.credit,
          row.guildgeeniiUtga, // утас
          row.haritsanDans,
          row.ehniilUldegdel,
          row.etsiin_Uldegdel,
          toMySQLDatetime(row.importDate),
          row.rowNumber,
          metadata.employeeName,
          metadata.fileName || null,
        ]
      );

      const ticketCount = calculateTicketCount(row.credit, ticketPrice);

      if (ticketCount > 0) {
        transactionsWithLottery++;

        for (let i = 0; i < ticketCount; i++) {
          currentSeq++;
          const lotteryNumber = generateLotteryNumber(metadata.carId, currentSeq);

          await connection.query(insertLotteryQuery, [
            lotteryNumber,
            toMySQLDatetime(new Date()),
            txResult.insertId,
            metadata.carId,
            row.credit,          // ✅ гүйлгээний дүн
            row.guildgeeniiUtga, // утас
          ]);

          totalLotteries++;
        }
      }
    }

    /* ==== SOLD UPDATE ==== */
    if (totalLotteries > 0) {
      await connection.query(
        "UPDATE lotteryName SET sold = sold + ? WHERE id = ?",
        [totalLotteries, metadata.carId]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Амжилттай хадгаллаа",
      data: {
        carId: metadata.carId,
        ticketPrice,                 // тухайн машины сугалааны үнэ
        totalTransactions,           // нийт гүйлгээ
        transactionsWithLottery,     // сугалаа үүссэн гүйлгээ
        totalLotteries,              // нийт сугалаа
      },
    });

  } catch (err) {
    if (connection) await connection.rollback();
    
    const errorMessage = err instanceof Error ? err.message : "Үл мэдэгдэх алдаа гарлаа";
    console.error("Lottery import error:", err);
    
    return NextResponse.json(
      { error: "Алдаа гарлаа", details: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
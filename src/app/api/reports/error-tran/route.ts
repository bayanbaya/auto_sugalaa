import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

interface ErrorTransactionRow extends RowDataPacket {
  id: number;
  carId: number;
  guildgeeniiOgnoo: Date;
  salbar: string;
  credit: number;
  guildgeeniiUtga: string;
  haritsanDans: string;
  ehniilUldegdel: number;
  etsiin_Uldegdel: number;
  importDate: Date;
  rowNumber: number;
  employeeName: string;
  fileName: string;
  createdAt: Date;
  islottery: number;
  carName: string;
  carImage: string;
  ticketPrice: string;
}

export async function GET(request: NextRequest) {
  let connection;

  try {
    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get('carId');

    connection = await pool.getConnection();

    let query = `
      SELECT
        b.*,
        ln.carName,
        ln.img as carImage,
        ln.price as ticketPrice
      FROM bankTransactions b
      LEFT JOIN mblottery mb ON mb.bankTransactionId = b.id
      LEFT JOIN lotteryName ln ON ln.id = b.carId
      WHERE mb.bankTransactionId IS NULL
    `;

    const params: string[] = [];

    if (carId && carId !== 'all') {
      query += ' AND b.carId = ?';
      params.push(carId);
    }

    query += ' ORDER BY b.guildgeeniiOgnoo DESC LIMIT 1000';

    const [rows] = await connection.query<ErrorTransactionRow[]>(query, params);

    return NextResponse.json({
      success: true,
      data: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error fetching error transactions:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

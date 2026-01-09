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

interface LotteryRow extends RowDataPacket {
  id: number;
  lotteryNumber: string;
  createdAt: Date;
  bankTransactionId: number;
  carId: string;
  transactionAmount: number;
  phoneNumber: string;
  is_manual: number;
  carName: string;
  carImage: string;
}

export async function GET(request: NextRequest) {
  let connection;

  try {
    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get('carId');

    connection = await pool.getConnection();

    let query = `
      SELECT
        mb.*,
        ln.carName,
        ln.img as carImage
      FROM mblottery mb
      LEFT JOIN lotteryName ln ON ln.id = mb.carId
    `;

    const params: string[] = [];

    if (carId && carId !== 'all') {
      query += ' WHERE mb.carId = ?';
      params.push(carId);
    }

    query += ' ORDER BY mb.createdAt DESC LIMIT 1000';

    const [rows] = await connection.query<LotteryRow[]>(query, params);

    return NextResponse.json({
      success: true,
      data: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Error fetching lottery data:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

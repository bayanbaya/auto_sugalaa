import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sugalaa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json(
        { error: 'carId шаардлагатай' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Fetch all lottery entries for the selected car
      const [lotteries] = await connection.query(
        `SELECT
          lotteryNumber,
          phoneNumber
        FROM mblottery
        WHERE carId = ?
        ORDER BY createdAt ASC`,
        [carId]
      );

      return NextResponse.json(lotteries);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching lottery data:', error);
    return NextResponse.json(
      { error: 'Сугалааны мэдээлэл татахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

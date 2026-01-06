import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Утасны дугаар шаардлагатай' },
        { status: 400 }
      );
    }

    // Create database connection
    connection = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 10,
    });

    // Query to get lottery information by phone number
    const [rows] = await connection.query(
      `SELECT
        n.carName,
        l.lotteryNumber,
        l.createdAt,
        l.transactionAmount,
        n.price as ticketPrice,
        n.img as carImage
      FROM mblottery l
      LEFT JOIN lotteryName n ON n.id = l.carId
      WHERE l.phoneNumber = ?
      ORDER BY l.createdAt DESC`,
      [phoneNumber]
    );

    const lotteries = rows as any[];

    if (lotteries.length === 0) {
      // Get the latest lottery createdAt to show when the last check was done
      const [latestRows] = await connection.query(
        `SELECT MAX(createdAt) as latestCheck FROM mblottery`
      );

      const latestCheck = (latestRows as any[])[0]?.latestCheck || null;

      return NextResponse.json(
        {
          success: true,
          found: false,
          message: 'Таны утасны дугаараар сугалаа олдсонгүй',
          latestCheck
        },
        { status: 200 }
      );
    }

    // Group lotteries by car
    const groupedByCar = lotteries.reduce((acc: any, lottery: any) => {
      const carName = lottery.carName || 'Тодорхойгүй';
      if (!acc[carName]) {
        acc[carName] = {
          carName,
          carImage: lottery.carImage,
          ticketPrice: lottery.ticketPrice,
          lotteries: [],
        };
      }
      acc[carName].lotteries.push({
        lotteryNumber: lottery.lotteryNumber,
        createdAt: lottery.createdAt,
        transactionAmount: lottery.transactionAmount,
      });
      return acc;
    }, {});

    const result = Object.values(groupedByCar);

    return NextResponse.json(
      {
        success: true,
        found: true,
        phoneNumber,
        totalLotteries: lotteries.length,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lottery check error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа. Дахин оролдоно уу.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

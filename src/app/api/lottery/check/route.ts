import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

interface LotteryRow extends RowDataPacket {
  carName: string;
  lotteryNumber: string;
  createdAt: Date;
  transactionAmount: number;
  ticketPrice: string | number;
  carImage: string;
}

interface LatestCheckRow extends RowDataPacket {
  latestCheck: Date | null;
}

interface GroupedCar {
  carName: string;
  carImage: string;
  ticketPrice: string | number;
  lotteries: Array<{
    lotteryNumber: string;
    createdAt: Date;
    transactionAmount: number;
  }>;
}

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

    const lotteries = rows as LotteryRow[];

    if (lotteries.length === 0) {
      // Get the latest lottery createdAt to show when the last check was done
      const [latestRows] = await connection.query<LatestCheckRow[]>(
        `SELECT MAX(createdAt) as latestCheck FROM mblottery`
      );

      const latestCheck = latestRows[0]?.latestCheck || null;

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
    const groupedByCar = lotteries.reduce((acc: Record<string, GroupedCar>, lottery: LotteryRow) => {
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
    }, {} as Record<string, GroupedCar>);

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

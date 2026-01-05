import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

interface LastTransactionRow extends RowDataPacket {
  lastDate: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json(
        { error: 'carId шаардлагатай' },
        { status: 400 }
      );
    }

    // Тухайн машины хамгийн сүүлийн гүйлгээний огноог татах
    const [rows] = await pool.query<LastTransactionRow[]>(
      `SELECT MAX(guildgeeniiOgnoo) as lastDate
       FROM bankTransactions
       WHERE carId = ?`,
      [carId]
    );

    const lastDate = rows[0]?.lastDate || null;

    return NextResponse.json({
      carId,
      lastTransactionDate: lastDate
    });

  } catch (err) {
    console.error("Last transaction date error:", err);
    return NextResponse.json(
      { error: "Сүүлийн гүйлгээний огноо татахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

export type Car = {
  id: string;
  img: string;
  carName: string;
  iban: string;
  ibanName: string;
  price: string;
  fbLink: string;
  total: number;
  sold: number;
  status: string;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Тайлан хуудсууд дээр ашиглах - бүх машинууд (active болон inactive)
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, img, carName, iban, ibanName, price, fbLink, total, sold, status FROM lotteryName ORDER BY id DESC"
    );

    const cars: Car[] = rows.map((row) => ({
      id: String(row.id),
      img: String(row.img || ""),
      carName: String(row.carName || ""),
      iban: String(row.iban || ""),
      ibanName: String(row.ibanName || ""),
      price: String(row.price || ""),
      fbLink: String(row.fbLink || ""),
      total: Number(row.total ?? 0),
      sold: Number(row.sold ?? 0),
      status: String(row.status || "active"),
    }));

    return NextResponse.json({ success: true, data: cars });
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json(
      { error: "Өгөгдлийн санг уншихад алдаа гарлаа" },
      { status: 500 }
    );
  }
}

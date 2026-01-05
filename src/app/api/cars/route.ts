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
  fill?: number;
};

// MySQL холболтын pool үүсгэх
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET() {
  try {
    // RowDataPacket interface ашиглан type safety хангах
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, img, carName, iban, ibanName, price, fbLink, total, sold FROM lotteryName WHERE STATUS = 'active'"
    );

    // fill хувь тооцоолж, Car төрөлд хөрвүүлэх
    const cars: Car[] = rows.map((row) => {
      const total = Number(row.total ?? 0);
      const sold = Number(row.sold ?? 0);
      const fill = total > 0 ? (sold / total) * 100 : 0;

      return {
        id: String(row.id),
        img: String(row.img || ""),
        carName: String(row.carName || ""),
        iban: String(row.iban || ""),
        ibanName: String(row.ibanName || ""),
        price: String(row.price || ""),
        fbLink: String(row.fbLink || ""),
        total,
        sold,
        fill,
      };
    });

    return NextResponse.json(cars);
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json(
      { error: "Өгөгдлийн санг уншихад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
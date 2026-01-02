import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { saveBase64Image } from '@/lib/uploadImage';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface CarRequestBody {
  img: string;
  iban: string;
  ibanName: string;
  price: string;
  fbLink: string;
  carName: string;
  total: number;
  sold?: number;
  status?: string;
}

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body: CarRequestBody = await request.json();

    // Validate required fields (ID шаардлагагүй болсон)
    const { img, iban, ibanName, price, fbLink, carName, total } = body;

    if (!iban || !ibanName || !price || !carName || !total) {
      return NextResponse.json(
        { error: 'Шаардлагатай талбаруудыг бөглөнө үү' },
        { status: 400 }
      );
    }

    // Validate IBAN (numbers only)
    if (!/^\d+$/.test(iban)) {
      return NextResponse.json(
        { error: 'Дансны дугаар зөвхөн тоо агуулах ёстой' },
        { status: 400 }
      );
    }

    // Validate total (positive integer)
    if (!Number.isInteger(total) || total <= 0) {
      return NextResponse.json(
        { error: 'Нийт тоо эерэг бүхэл тоо байх ёстой' },
        { status: 400 }
      );
    }

    // Validate price format and convert to number
    const priceValue = String(price).replace(/[,₮\s]/g, '');
    if (!/^\d+$/.test(priceValue)) {
      return NextResponse.json(
        { error: 'Үнэ буруу форматтай байна' },
        { status: 400 }
      );
    }

    // Validate Facebook link if provided
    if (fbLink && !fbLink.startsWith('http')) {
      return NextResponse.json(
        { error: 'Facebook холбоос буруу форматтай байна' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Insert new car WITHOUT ID (AUTO_INCREMENT will handle it)
    const sold = body.sold ?? 0;
    const status = body.status ?? 'active';

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `INSERT INTO lotteryName
        (img, iban, ibanName, price, fbLink, carName, total, sold, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['', iban, ibanName, priceValue, fbLink || '', carName, total, sold, status]
    );

    // AUTO_INCREMENT-ээс үүссэн ID авах
    const newCarId = result.insertId;

    // Зураг хадгалах
    let imgPath = '';
    if (img && img.startsWith('data:image')) {
      imgPath = await saveBase64Image(img, newCarId);

      // Database дээр зургийн замыг шинэчлэх
      await connection.execute(
        'UPDATE lotteryName SET img = ? WHERE id = ?',
        [imgPath, newCarId]
      );
    } else if (img) {
      imgPath = img; // URL бол шууд ашиглах
      await connection.execute(
        'UPDATE lotteryName SET img = ? WHERE id = ?',
        [imgPath, newCarId]
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Машин амжилттай нэмэгдлээ',
        car: {
          id: newCarId,
          img: imgPath,
          iban,
          ibanName,
          price: priceValue,
          fbLink: fbLink || '',
          carName,
          total,
          sold,
          status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Car creation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Тодорхойгүй алдаа гарлаа';

    return NextResponse.json(
      {
        error: 'Машин нэмэхэд алдаа гарлаа',
        details: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

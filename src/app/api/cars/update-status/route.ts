import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface UpdateStatusRequest {
  id: string;
  status: 'active' | 'inactive';
}

export async function PATCH(request: NextRequest) {
  let connection;

  try {
    const body: UpdateStatusRequest = await request.json();
    const { id, status } = body;

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID болон статус шаардлагатай' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Статус нь "active" эсвэл "inactive" байх ёстой' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Check if car exists
    const [existing] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT id, carName FROM lotteryName WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Машин олдсонгүй' },
        { status: 404 }
      );
    }

    // Update status
    await connection.execute(
      'UPDATE lotteryName SET status = ? WHERE id = ?',
      [status, id]
    );

    const carName = existing[0].carName;
    const statusText = status === 'active' ? 'идэвхтэй' : 'идэвхгүй';

    return NextResponse.json(
      {
        success: true,
        message: `"${carName}" машины төлөв "${statusText}" болж өөрчлөгдлөө`,
        car: {
          id,
          carName,
          status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Status update error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Тодорхойгүй алдаа гарлаа';

    return NextResponse.json(
      {
        error: 'Төлөв өөрчлөхөд алдаа гарлаа',
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

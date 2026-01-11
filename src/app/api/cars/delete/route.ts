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

interface DeleteCarRequest {
  id: string;
}

export async function DELETE(request: NextRequest) {
  let connection;

  try {
    const body: DeleteCarRequest = await request.json();
    const { id } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'ID шаардлагатай' },
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

    const carName = existing[0].carName;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Эхлээд bankTransactions хүснэгтээс холбогдох бүх гүйлгээг устгах
      await connection.execute(
        'DELETE FROM bankTransactions WHERE carId = ?',
        [id]
      );

      // Дараа нь lottery хүснэгтээс холбогдох бүх сугалааг устгах
      const [lotteryResult] = await connection.execute<mysql.ResultSetHeader>(
        'DELETE FROM mblottery WHERE carid = ?',
        [id]
      );

      // Эцэст нь lotteryName хүснэгтээс машиныг устгах
      await connection.execute(
        'DELETE FROM lotteryName WHERE id = ?',
        [id]
      );

      // Commit transaction
      await connection.commit();

      const deletedLotteryCount = lotteryResult.affectedRows || 0;

      return NextResponse.json(
        {
          success: true,
          message: `"${carName}" машин амжилттай устгагдлаа`,
          deletedLotteryCount,
          car: {
            id,
            carName,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Car delete error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Тодорхойгүй алдаа гарлаа';

    return NextResponse.json(
      {
        error: 'Машин устгахад алдаа гарлаа',
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

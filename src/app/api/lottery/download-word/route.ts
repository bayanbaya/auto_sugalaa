import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
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

interface LotteryData {
  lotteryNumber: string;
  phoneNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, lotteries } = body;

    if (!carId || !lotteries || !Array.isArray(lotteries)) {
      return NextResponse.json(
        { error: 'carId болон lotteries шаардлагатай' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Fetch car details
      const [carRows]: any = await connection.query(
        'SELECT carName, total, sold FROM lotteryName WHERE id = ?',
        [carId]
      );

      if (carRows.length === 0) {
        return NextResponse.json(
          { error: 'Машин олдсонгүй' },
          { status: 404 }
        );
      }

      const car = carRows[0];

      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Сугалааны жагсаалт - ${car.carName}`,
                    bold: true,
                    size: 32,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 400,
                },
              }),

              // Summary
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Нийт: ${car.total} | Зарагдсан: ${car.sold} | Огноо: ${new Date().toLocaleDateString('mn-MN')}`,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 400,
                },
              }),

              // Table
              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                rows: [
                  // Header row
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: '№',
                                bold: true,
                                size: 22,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: {
                          size: 10,
                          type: WidthType.PERCENTAGE,
                        },
                        shading: {
                          fill: 'E0E0E0',
                        },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Сугалааны дугаар',
                                bold: true,
                                size: 22,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: {
                          size: 45,
                          type: WidthType.PERCENTAGE,
                        },
                        shading: {
                          fill: 'E0E0E0',
                        },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: 'Утасны дугаар',
                                bold: true,
                                size: 22,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: {
                          size: 45,
                          type: WidthType.PERCENTAGE,
                        },
                        shading: {
                          fill: 'E0E0E0',
                        },
                      }),
                    ],
                  }),

                  // Data rows
                  ...lotteries.map((lottery: LotteryData, index: number) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: (index + 1).toString(),
                                  size: 20,
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: lottery.lotteryNumber,
                                  size: 20,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: lottery.phoneNumber || '-',
                                  size: 20,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    })
                  ),
                ],
              }),
            ],
          },
        ],
      });

      // Generate buffer
      const buffer = await Packer.toBuffer(doc);

      // Return as downloadable file
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Sugalaa_${car.carName}_${new Date().toISOString().split('T')[0]}.docx"`,
        },
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      { error: 'Word файл үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

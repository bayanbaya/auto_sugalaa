import { NextRequest, NextResponse } from 'next/server';

// Админы мэдээлэл - энд хадгална
const ADMIN_USERS = [
  { username: 'admin1', password: 'pass123' },
  { username: 'superuser', password: 'mb#123' }
];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username болон password шаардлагатай' },
        { status: 400 }
      );
    }

    // Username & password шалгах
    const user = ADMIN_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' },
        { status: 401 }
      );
    }

    // Response буцаах (sessionStorage ашиглана)
    return NextResponse.json({
      success: true,
      user: { username: user.username }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Нэвтрэх явцад алдаа гарлаа' },
      { status: 500 }
    );
  }
}

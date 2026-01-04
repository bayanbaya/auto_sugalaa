import { NextResponse } from 'next/server';

export async function POST() {
  // sessionStorage client-side-д цэвэрлэгдэнэ
  return NextResponse.json({ success: true });
}

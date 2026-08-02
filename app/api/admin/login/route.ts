import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "管理密碼尚未設定，請在 .env 設定 ADMIN_PASSWORD" },
      { status: 500 }
    );
  }
  if (password !== expected) {
    return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true });
}

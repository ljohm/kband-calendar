// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/adminAuth";

// POST /api/admin/auth
// Body: { password: string }
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }

    if (!verifyAdminPassword(password)) {
      // 브루트포스 방지용 딜레이
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json(
        { success: false, error: "비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

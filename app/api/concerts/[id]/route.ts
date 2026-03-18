// app/api/concerts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { ConcertInput, ApiResponse, Concert } from "@/types/concert";

// Next.js 15+: params가 Promise로 변경됨
type Context = { params: Promise<{ id: string }> };

// GET /api/concerts/:id
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "id가 필요합니다." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("concerts_full")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "공연을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<Concert>>({ data });
}

// PATCH /api/concerts/:id
export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body: Partial<ConcertInput> = await req.json();

    // concert_title → title 변환 (DB 컬럼명은 title)
    const { concert_title, ...rest } = body;
    const updatePayload = {
      ...rest,
      ...(concert_title !== undefined ? { title: concert_title } : {}),
    };

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("concerts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: "공연을 찾을 수 없습니다." },
          { status: 404 },
        );
      }
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<typeof data>>({ data });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }
}

// DELETE /api/concerts/:id
export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  const admin = supabaseAdmin();
  const { error } = await admin.from("concerts").delete().eq("id", id);

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json<ApiResponse<{ success: boolean }>>(
    { data: { success: true } },
    { status: 200 },
  );
}

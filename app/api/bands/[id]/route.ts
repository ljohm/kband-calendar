// app/api/bands/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Band, BandInput, ApiResponse, Genre } from "@/types/concert";

const VALID_GENRES: Genre[] = [
  "rock",
  "indie",
  "metal",
  "pop",
  "jazz",
  "emo",
  "hiphop",
];

// Next.js 15+: params가 Promise로 변경됨
type Context = { params: Promise<{ id: string }> };

// GET /api/bands/:id
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "id가 필요합니다." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("bands")
    .select("id, name, genre, description, image_url, sns_url, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "밴드를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<Band>>({ data });
}

// PATCH /api/bands/:id
export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body: Partial<BandInput> = await req.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "수정할 필드가 없습니다." },
        { status: 400 },
      );
    }

    if (body.genre && !VALID_GENRES.includes(body.genre)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: `유효하지 않은 장르입니다: ${body.genre}` },
        { status: 400 },
      );
    }

    const updatePayload: Partial<BandInput> = {
      ...body,
      ...(body.name ? { name: body.name.trim() } : {}),
    };

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("bands")
      .update(updatePayload)
      .eq("id", id)
      .select("id, name, genre, description, image_url, sns_url, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `이미 사용 중인 밴드명입니다: ${body.name}` },
          { status: 409 },
        );
      }
      if (error.code === "PGRST116") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: "밴드를 찾을 수 없습니다." },
          { status: 404 },
        );
      }
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<Band>>({ data });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }
}

// DELETE /api/bands/:id
export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "id가 필요합니다." },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  const { error } = await admin.from("bands").delete().eq("id", id);

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

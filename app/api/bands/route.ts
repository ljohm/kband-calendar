// app/api/bands/route.ts
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

// ──────────────────────────────────────────
// GET /api/bands
// 쿼리: genre, name (부분 검색)
// 예시: /api/bands
//       /api/bands?genre=indie
//       /api/bands?name=혁오
// ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const genre = searchParams.get("genre");
  const name = searchParams.get("name");

  // 장르 유효성 검사
  if (genre && !VALID_GENRES.includes(genre as Genre)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: `유효하지 않은 장르입니다: ${genre}` },
      { status: 400 },
    );
  }

  let query = supabase
    .from("bands")
    .select("id, name, genre, description, image_url, sns_url, created_at")
    .order("name", { ascending: true });

  if (genre) {
    query = query.eq("genre", genre);
  }

  // 밴드명 부분 검색 — FilterBar 자동완성, 관리자 검색에서 사용
  if (name) {
    query = query.ilike("name", `%${name}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json<ApiResponse<Band[]>>({ data: data ?? [] });
}

// ──────────────────────────────────────────
// POST /api/bands
// 관리자 전용: 밴드 신규 등록
// Body: BandInput { name, genre, description?, image_url?, sns_url? }
// ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: BandInput = await req.json();

    // 필수 필드 검증
    const required: (keyof BandInput)[] = ["name", "genre"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `${field} 필드가 필요합니다.` },
          { status: 400 },
        );
      }
    }

    // 장르 유효성 검사
    if (!VALID_GENRES.includes(body.genre)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: `유효하지 않은 장르입니다: ${body.genre}` },
        { status: 400 },
      );
    }

    // 밴드명 공백 정리
    const insertPayload: BandInput = {
      ...body,
      name: body.name.trim(),
    };

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("bands")
      .insert(insertPayload)
      .select("id, name, genre, description, image_url, sns_url, created_at")
      .single();

    if (error) {
      // unique constraint: 밴드명 중복
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `이미 등록된 밴드입니다: ${body.name}` },
          { status: 409 },
        );
      }
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<Band>>({ data }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }
}

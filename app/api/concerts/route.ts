// app/api/concerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type {
  ConcertInput,
  ApiResponse,
  Concert,
  Genre,
} from "@/types/concert";

// Genre 유효성 검사용 상수
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
// GET /api/concerts
// 쿼리: year, month, genre, city, band_id
// 예시: /api/concerts?year=2026&month=3&genre=indie
// ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const genre = searchParams.get("genre");
  const city = searchParams.get("city");
  const band_id = searchParams.get("band_id");

  // 장르 유효성 검사
  if (genre && genre !== "all" && !VALID_GENRES.includes(genre as Genre)) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: `유효하지 않은 장르입니다: ${genre}` },
      { status: 400 },
    );
  }

  // year 없이 month만 오는 경우 방지
  if (month && !year) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "month를 사용하려면 year도 함께 전달해야 합니다." },
      { status: 400 },
    );
  }

  let query = supabase
    .from("concerts_full")
    .select("*")
    .order("date", { ascending: true });

  // 월 필터
  if (year && month) {
    const y = parseInt(year);
    const m = parseInt(month);

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "year/month 값이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("date", from).lte("date", to);
  }

  if (genre && genre !== "all") {
    query = query.eq("genre", genre);
  }

  if (city) {
    query = query.eq("city", city);
  }

  if (band_id) {
    query = query.eq("band_id", band_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json<ApiResponse<Concert[]>>({ data: data ?? [] });
}

// ──────────────────────────────────────────
// POST /api/concerts
// 관리자 전용: 공연 수동 등록
// Body: ConcertInput
// ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: ConcertInput = await req.json();

    // 필수 필드 검증 — concert_title (구 title 아님)
    const required: (keyof ConcertInput)[] = [
      "band_id",
      "venue_id",
      "concert_title",
      "date",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `${field} 필드가 필요합니다.` },
          { status: 400 },
        );
      }
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "date는 YYYY-MM-DD 형식이어야 합니다." },
        { status: 400 },
      );
    }

    // DB 컬럼명은 title이므로 concert_title → title 변환 후 insert
    const { concert_title, ...rest } = body;
    const insertPayload = { ...rest, title: concert_title, source: "manual" };

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("concerts")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // 중복 공연 (unique constraint: source + source_id)
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: "이미 등록된 공연입니다." },
          { status: 409 },
        );
      }
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<typeof data>>(
      { data },
      { status: 201 },
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }
}

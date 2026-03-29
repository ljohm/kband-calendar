// app/api/venues/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { ApiResponse } from "@/types/concert";

interface VenueInput {
  name: string;
  city: string;
  address?: string | null;
  capacity?: number | null;
}

interface Venue extends VenueInput {
  id: string;
  created_at: string;
}

// ──────────────────────────────────────────
// GET /api/venues
// 쿼리: city
// ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");

  let query = supabase
    .from("venues")
    .select("id, name, city, address, capacity, created_at")
    .order("city")
    .order("name");

  if (city) {
    query = query.eq("city", city);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json<ApiResponse<Venue[]>>({ data: data ?? [] });
}

// ──────────────────────────────────────────
// POST /api/venues
// 관리자 전용: 공연장 신규 등록
// Body: VenueInput { name, city, address?, capacity? }
// ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: VenueInput = await req.json();

    // 필수 필드 검증
    const required: (keyof VenueInput)[] = ["name", "city"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `${field} 필드가 필요합니다.` },
          { status: 400 },
        );
      }
    }

    // 공연장명 공백 정리
    const insertPayload: VenueInput = {
      ...body,
      name: body.name.trim(),
    };

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("venues")
      .insert(insertPayload)
      .select("id, name, city, address, capacity, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `이미 등록된 공연장명입니다: ${body.name}` },
          { status: 409 },
        );
      }
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<Venue>>({ data }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }
}

// app/api/festivals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type {
  ApiResponse,
  Concert,
  FestivalArtist,
  FestivalDetail,
  FestivalArtistInput,
} from "@/types/concert";

type Context = { params: Promise<{ id: string }> };

// ──────────────────────────────────────────
// GET /api/festivals/:id
// 페스티벌 상세 + 출연진 목록 반환
// ──────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  // 페스티벌 기본 정보
  const { data: concert, error: concertError } = await supabase
    .from("concerts_full")
    .select("*")
    .eq("id", id)
    .eq("type", "festival")
    .single();

  if (concertError || !concert) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "페스티벌을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  // 출연진 목록 (perform_date, perform_time 순 정렬)
  const { data: artists, error: artistsError } = await supabase
    .from("festival_artists_full")
    .select("*")
    .eq("concert_id", id)
    .order("perform_date", { ascending: true })
    .order("perform_time", { ascending: true });

  if (artistsError) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: artistsError.message },
      { status: 500 },
    );
  }

  const festivalDetail: FestivalDetail = {
    ...(concert as Concert),
    type: "festival",
    artists: (artists ?? []) as FestivalArtist[],
  };

  return NextResponse.json<ApiResponse<FestivalDetail>>({
    data: festivalDetail,
  });
}

// ──────────────────────────────────────────
// POST /api/festivals/:id/artists
// 출연진 추가 (관리자 전용)
// Body: FestivalArtistInput
// ──────────────────────────────────────────
export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body: Omit<FestivalArtistInput, "concert_id"> = await req.json();

    if (!body.band_id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "band_id 필드가 필요합니다." },
        { status: 400 },
      );
    }

    // 해당 concerts가 festival 타입인지 확인
    const { data: concert } = await supabase
      .from("concerts")
      .select("id, type")
      .eq("id", id)
      .eq("type", "festival")
      .single();

    if (!concert) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "페스티벌을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("festival_artists")
      .insert({ ...body, concert_id: id })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: "이미 등록된 아티스트입니다." },
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

// ──────────────────────────────────────────
// DELETE /api/festivals/:id
// 페스티벌 삭제 (출연진 cascade 삭제)
// ──────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("concerts")
    .delete()
    .eq("id", id)
    .eq("type", "festival");

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

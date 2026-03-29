// app/api/venues/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { ApiResponse } from "@/types/concert";

interface VenueInput {
  name?: string;
  city?: string;
  address?: string | null;
  capacity?: number | null;
}

interface Venue extends VenueInput {
  id: string;
  created_at: string;
}

// Next.js 15+: params가 Promise로 변경됨
type Context = { params: Promise<{ id: string }> };

// GET /api/venues/:id
export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "id가 필요합니다." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("venues")
    .select("id, name, city, address, capacity, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "공연장을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<Venue>>({ data });
}

// PATCH /api/venues/:id
export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body: Partial<VenueInput> = await req.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "수정할 필드가 없습니다." },
        { status: 400 },
      );
    }

    const updatePayload: Partial<VenueInput> = {
      ...body,
      ...(body.name ? { name: body.name.trim() } : {}),
    };

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("venues")
      .update(updatePayload)
      .eq("id", id)
      .select("id, name, city, address, capacity, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `이미 사용 중인 공연장명입니다: ${body.name}` },
          { status: 409 },
        );
      }
      if (error.code === "PGRST116") {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: "공연장을 찾을 수 없습니다." },
          { status: 404 },
        );
      }
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<Venue>>({ data });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }
}

// DELETE /api/venues/:id
export async function DELETE(_req: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "id가 필요합니다." },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  const { error } = await admin.from("venues").delete().eq("id", id);

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

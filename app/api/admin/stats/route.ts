// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { ApiResponse } from "@/types/concert";

interface AdminStats {
  concerts: number;
  festivals: number;
  bands: number;
  venues: number;
}

// ──────────────────────────────────────────
// GET /api/admin/stats
// 관리자 대시보드용 통계 정보
// ──────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const admin = supabaseAdmin();

    // 병렬로 모든 데이터 조회
    const [concertsResult, bandsResult, venuesResult] = await Promise.all([
      admin.from("concerts").select("id, type", { count: "exact" }),
      admin.from("bands").select("id", { count: "exact" }),
      admin.from("venues").select("id", { count: "exact" }),
    ]);

    const allConcerts = concertsResult.data ?? [];
    const stats: AdminStats = {
      concerts: allConcerts.filter((c) => c.type !== "festival").length,
      festivals: allConcerts.filter((c) => c.type === "festival").length,
      bands: bandsResult.count ?? 0,
      venues: venuesResult.count ?? 0,
    };

    return NextResponse.json<ApiResponse<AdminStats>>({ data: stats });
  } catch (err) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "통계 조회 실패" },
      { status: 500 },
    );
  }
}

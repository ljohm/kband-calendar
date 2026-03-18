// hooks/useConcerts.ts
"use client";
import { useEffect, useState, useCallback } from "react";
import type { Concert, Genre } from "@/types/concert";

interface UseConcertsParams {
  year: number;
  month: number; // 1-indexed (1 = 1월) — page.tsx에서 month + 1 로 전달
  genre?: Genre | "all";
  city?: string;
  band_id?: string;
}

interface UseConcertsReturn {
  concerts: Concert[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useConcerts({
  year,
  month,
  genre,
  city,
  band_id,
}: UseConcertsParams): UseConcertsReturn {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 객체 대신 primitive를 deps로 사용해 무한 루프 방지
  const fetchConcerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("year", String(year));
      params.set("month", String(month));
      if (genre && genre !== "all") params.set("genre", genre);
      if (city) params.set("city", city);
      if (band_id) params.set("band_id", band_id);

      const res = await fetch(`/api/concerts?${params.toString()}`);
      if (!res.ok) throw new Error(`서버 오류 (HTTP ${res.status})`);

      const json: { data: Concert[]; error?: string } = await res.json();
      if (json.error) throw new Error(json.error);

      setConcerts(json.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      );
      setConcerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [year, month, genre, city, band_id]); // ✅ primitive만 deps에 포함

  useEffect(() => {
    fetchConcerts();
  }, [fetchConcerts]);

  return { concerts, isLoading, error, refetch: fetchConcerts };
}

// ── 헬퍼 함수들 ──────────────────────────────────────

// CalendarGrid에서 날짜별 공연 필터링 시 사용
export function getConcertsByDate(
  concerts: Concert[],
  date: string,
): Concert[] {
  return concerts.filter((c) => c.date === date);
}

// 장르별 그룹핑 (통계 페이지 등에서 사용)
export function groupByGenre(
  concerts: Concert[],
): Partial<Record<Genre, Concert[]>> {
  return concerts.reduce(
    (acc, concert) => {
      const g = concert.genre;
      if (!acc[g]) acc[g] = [];
      acc[g]!.push(concert);
      return acc;
    },
    {} as Partial<Record<Genre, Concert[]>>,
  );
}

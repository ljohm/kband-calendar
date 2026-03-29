// hooks/useFestival.ts
"use client";
import { useEffect, useState } from "react";
import type { FestivalDetail } from "@/types/concert";

interface UseFestivalReturn {
  festival: FestivalDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function useFestival(id: string): UseFestivalReturn {
  const [festival, setFestival] = useState<FestivalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch_ = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/festivals/${id}`);

        if (res.status === 404) {
          setError("페스티벌을 찾을 수 없습니다.");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { data: FestivalDetail; error?: string } = await res.json();
        if (json.error) throw new Error(json.error);

        setFestival(json.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetch_();
  }, [id]);

  return { festival, isLoading, error };
}

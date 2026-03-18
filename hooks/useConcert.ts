// hooks/useConcert.ts
"use client";
import { useEffect, useState } from "react";
import type { Concert } from "@/types/concert";

interface UseConcertReturn {
  concert: Concert | null;
  isLoading: boolean;
  error: string | null;
}

export function useConcert(id: string): UseConcertReturn {
  const [concert, setConcert] = useState<Concert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch_ = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/concerts/${id}`);

        if (res.status === 404) {
          setError("공연을 찾을 수 없습니다.");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { data: Concert; error?: string } = await res.json();
        if (json.error) throw new Error(json.error);

        setConcert(json.data);
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

  return { concert, isLoading, error };
}

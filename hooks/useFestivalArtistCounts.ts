// hooks/useFestivalArtistCounts.ts
"use client";
import { useEffect, useState } from "react";
import type { Concert, FestivalArtist } from "@/types/concert";

// 페스티벌 ID별 출연 밴드 수를 반환
// { 'festival-id-1': 5, 'festival-id-2': 3 }
type ArtistCountMap = Record<string, number>;

interface UseFestivalArtistCountsReturn {
  totalFestivalBands: number; // 이번 달 페스티벌 전체 출연 밴드 수 (중복 제거)
  countMap: ArtistCountMap; // 페스티벌별 출연 밴드 수
  isLoading: boolean;
}

export function useFestivalArtistCounts(
  concerts: Concert[],
): UseFestivalArtistCountsReturn {
  const [countMap, setCountMap] = useState<ArtistCountMap>({});
  const [totalFestivalBands, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const festivals = concerts.filter((c) => c.type === "festival");

  useEffect(() => {
    // 페스티벌이 없으면 초기화 후 종료
    if (festivals.length === 0) {
      setCountMap({});
      setTotal(0);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        // 페스티벌별로 병렬 fetch
        const results = await Promise.all(
          festivals.map((f) =>
            fetch(`/api/festivals/${f.id}`)
              .then((r) => r.json())
              .then((json) => ({
                id: f.id,
                artists: (json.data?.artists ?? []) as FestivalArtist[],
              }))
              .catch(() => ({ id: f.id, artists: [] })),
          ),
        );

        // 페스티벌별 밴드 수 집계
        const map: ArtistCountMap = {};
        const allBandIds = new Set<string>();

        results.forEach(({ id, artists }) => {
          map[id] = artists.length;
          artists.forEach((a) => allBandIds.add(a.band_id));
        });

        setCountMap(map);
        setTotal(allBandIds.size);
      } catch {
        setCountMap({});
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
    // festivals 배열의 id 목록이 바뀔 때만 재실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festivals.map((f) => f.id).join(",")]);

  return { totalFestivalBands, countMap, isLoading };
}

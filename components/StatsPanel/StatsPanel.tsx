// components/StatsPanel/StatsPanel.tsx
import type { Concert } from "@/types/concert";
import styles from "./StatsPanel.module.css";

interface Props {
  concerts: Concert[];
  festivalBandCount?: number; // page.tsx에서 계산해서 전달 (페스티벌 출연 밴드 수)
}

export default function StatsPanel({ concerts, festivalBandCount }: Props) {
  const concertOnly = concerts.filter((c) => c.type !== "festival");
  const festivalOnly = concerts.filter((c) => c.type === "festival");
  const hasFestival = festivalOnly.length > 0;

  // 단독 공연 기준 밴드 수
  const concertBands = new Set(concertOnly.map((c) => c.band_id)).size;
  const venues = new Set(concerts.map((c) => c.venue_id)).size;

  // 참여 밴드:
  // 페스티벌 있으면 → 페스티벌 출연 밴드 수 (festivalBandCount)
  // 페스티벌 없으면 → 단독 공연 밴드 수
  const bandCount =
    hasFestival && festivalBandCount != null ? festivalBandCount : concertBands;

  const bandLabel =
    hasFestival && festivalBandCount != null ? "페스티벌 출연" : "참여 밴드";

  const stats = [
    {
      label: "단독 공연",
      value: concertOnly.length,
      sub: "개 예정",
      accent: false,
    },
    {
      label: "페스티벌",
      value: festivalOnly.length,
      sub: "개 예정",
      accent: true,
    },
    {
      label: bandLabel,
      value: bandCount,
      sub: "팀",
      accent: hasFestival, // 페스티벌 있으면 보라색 포인트
    },
    {
      label: "공연장",
      value: venues,
      sub: "곳",
      accent: false,
    },
  ];

  return (
    <div className={styles.panel}>
      {stats.map(({ label, value, sub, accent }) => (
        <div
          key={label}
          className={`${styles.card} ${accent ? styles.festivalCard : ""}`}
        >
          <p className={styles.label}>{label}</p>
          <p
            className={`${styles.value} ${accent ? styles.festivalValue : ""}`}
          >
            {value}
          </p>
          <p className={styles.sub}>{sub}</p>
        </div>
      ))}
    </div>
  );
}

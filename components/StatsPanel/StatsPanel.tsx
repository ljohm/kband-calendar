// components/StatsPanel/StatsPanel.tsx
import type { Concert } from "@/types/concert";
import styles from "./StatsPanel.module.css";

interface Props {
  concerts: Concert[];
}

export default function StatsPanel({ concerts }: Props) {
  const bands = new Set(concerts.map((c) => c.band_id)).size;
  const venues = new Set(concerts.map((c) => c.venue_id)).size;

  const stats = [
    { label: "이번 달 공연", value: concerts.length, sub: "개 예정" },
    { label: "참여 밴드", value: bands, sub: "팀" },
    { label: "공연장", value: venues, sub: "곳" },
  ];

  return (
    <div className={styles.panel}>
      {stats.map(({ label, value, sub }) => (
        <div key={label} className={styles.card}>
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>{value}</p>
          <p className={styles.sub}>{sub}</p>
        </div>
      ))}
    </div>
  );
}

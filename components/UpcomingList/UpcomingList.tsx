// components/UpcomingList/UpcomingList.tsx
import type { Concert } from "@/types/concert";
import GenreTag from "@/components/GenreTag/GenreTag";
import styles from "./UpcomingList.module.css";

interface Props {
  concerts: Concert[];
  onSelect: (concert: Concert) => void;
  limit?: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function UpcomingList({ concerts, onSelect, limit = 8 }: Props) {
  const sorted = [...concerts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  return (
    <div className={styles.container}>
      <p className={styles.header}>이번 달 공연</p>

      {sorted.length === 0 ? (
        <p className={styles.empty}>공연이 없습니다</p>
      ) : (
        sorted.map((concert) => {
          const [, m, d] = concert.date.split("-");
          return (
            <button
              key={concert.id}
              className={styles.item}
              onClick={() => onSelect(concert)}
            >
              <div className={styles.dateBadge}>
                <span className={styles.month}>
                  {MONTH_NAMES[parseInt(m) - 1]}
                </span>
                <span className={styles.day}>{parseInt(d)}</span>
              </div>
              <div className={styles.info}>
                <p className={styles.band}>{concert.band_name}</p>
                <p className={styles.venue}>{concert.venue}</p>
                <GenreTag genre={concert.genre} />
              </div>
              {concert.is_sold_out && (
                <span className={styles.soldOut}>매진</span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}

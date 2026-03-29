// components/UpcomingList/UpcomingList.tsx
import type { Concert } from "@/types/concert";
import GenreTag from "@/components/GenreTag/GenreTag";
import { formatDateBadge, formatDateEndShort } from "@/lib/dateUtils";
import styles from "./UpcomingList.module.css";

interface Props {
  concerts: Concert[];
  onSelect: (concert: Concert) => void;
  limit?: number;
}

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
          const isFestival = concert.type === "festival";
          const { month, day } = formatDateBadge(concert.date);
          const dateEndShort = formatDateEndShort(
            concert.date,
            concert.date_end,
          );

          return (
            <button
              key={concert.id}
              className={styles.item}
              onClick={() => onSelect(concert)}
            >
              {/* 날짜 배지 */}
              <div className={styles.dateBadge}>
                <span className={styles.month}>{month}</span>
                <span className={styles.day}>{day}</span>
                {/* 다일 공연이면 종료일 표시 */}
                {dateEndShort && (
                  <span className={styles.dateEnd}>{dateEndShort}</span>
                )}
              </div>

              {/* 공연 정보 */}
              <div className={styles.info}>
                {isFestival ? (
                  <>
                    <p className={styles.band}>{concert.concert_title}</p>
                    <p className={styles.venue}>
                      {concert.venue} · {concert.city}
                    </p>
                    <span className={styles.festivalBadge}>FESTIVAL</span>
                  </>
                ) : (
                  <>
                    <p className={styles.band}>{concert.band_name}</p>
                    <p className={styles.venue}>{concert.venue}</p>
                    <GenreTag genre={concert.genre} />
                  </>
                )}
              </div>

              {/* 매진 배지 */}
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

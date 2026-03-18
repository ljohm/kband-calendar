// components/CalendarGrid/CalendarGrid.tsx
"use client";
import type { Concert } from "@/types/concert";
import { GENRE_COLORS } from "@/constants/genre";
import styles from "./CalendarGrid.module.css";

export interface Props {
  year: number;
  month: number; // 0-indexed (0 = 1월)
  concerts: Concert[];
  onSelectConcert: (concert: Concert) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarGrid({
  year,
  month,
  concerts,
  onSelectConcert,
}: Props) {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;

  // 날짜별 공연 그룹핑
  const byDay: Record<number, Concert[]> = {};
  concerts.forEach((c) => {
    const d = parseInt(c.date.split("-")[2]);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(c);
  });

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDow + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= lastDay.getDate();
    const isToday =
      isCurrentMonth &&
      year === today.getFullYear() &&
      month === today.getMonth() &&
      dayNum === today.getDate();
    const isSunday = i % 7 === 0;

    return { dayNum, isCurrentMonth, isToday, isSunday };
  });

  return (
    <div className={styles.grid}>
      {/* 요일 헤더 */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={`${styles.weekday} ${d === "일" ? styles.sunday : ""}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className={styles.days}>
        {cells.map(({ dayNum, isCurrentMonth, isToday, isSunday }, i) => {
          const events = isCurrentMonth ? (byDay[dayNum] ?? []) : [];
          const visible = events.slice(0, 2);
          const overflow = events.length - 2;

          return (
            <div
              key={i}
              className={`${styles.cell} ${!isCurrentMonth ? styles.otherMonth : ""} ${isSunday ? styles.sundayCell : ""}`}
            >
              {/* 날짜 번호 */}
              <div
                className={`${styles.dayNum} ${isToday ? styles.today : ""}`}
              >
                {isCurrentMonth ? dayNum : ""}
              </div>

              {/* 공연 pill */}
              {visible.map((ev) => {
                const { bg, text } = GENRE_COLORS[ev.genre] ?? {
                  bg: "#eee",
                  text: "#333",
                };
                return (
                  <button
                    key={ev.id}
                    className={styles.pill}
                    style={{ background: bg, color: text }}
                    onClick={() => onSelectConcert(ev)}
                    title={`${ev.band_name} - ${ev.venue}`}
                  >
                    {ev.band_name}
                  </button>
                );
              })}

              {/* +N 더보기 */}
              {overflow > 0 && (
                <button
                  className={styles.more}
                  onClick={() => onSelectConcert(events[2])}
                >
                  +{overflow}개 더
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

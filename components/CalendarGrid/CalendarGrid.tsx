// components/CalendarGrid/CalendarGrid.tsx
"use client";
import type { Concert } from "@/types/concert";
import { GENRE_COLORS } from "@/constants/genre";
import { isDateInRange } from "@/lib/dateUtils";
import styles from "./CalendarGrid.module.css";

interface Props {
  year: number;
  month: number;
  concerts: Concert[];
  onSelectConcert: (concert: Concert) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const FESTIVAL_STYLE = { bg: "#EEEDFE", text: "#3C3489" };

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

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDow + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= lastDay.getDate();
    const isToday =
      isCurrentMonth &&
      year === today.getFullYear() &&
      month === today.getMonth() &&
      dayNum === today.getDate();
    const isSunday = i % 7 === 0;

    const mm = String(month + 1).padStart(2, "0");
    const dd = String(dayNum).padStart(2, "0");
    const dateStr = isCurrentMonth ? `${year}-${mm}-${dd}` : "";

    // 다일 공연 포함: 해당 날짜가 공연 기간(date ~ date_end)에 속하는 모든 공연
    const events = isCurrentMonth
      ? concerts.filter((c) => isDateInRange(dateStr, c.date, c.date_end))
      : [];

    return { dayNum, isCurrentMonth, isToday, isSunday, events };
  });

  return (
    <div className={styles.grid}>
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

      <div className={styles.days}>
        {cells.map(
          ({ dayNum, isCurrentMonth, isToday, isSunday, events }, i) => {
            const visible = events.slice(0, 2);
            const overflow = events.length - 2;

            return (
              <div
                key={i}
                className={`${styles.cell} ${!isCurrentMonth ? styles.otherMonth : ""} ${isSunday ? styles.sundayCell : ""}`}
              >
                <div
                  className={`${styles.dayNum} ${isToday ? styles.today : ""}`}
                >
                  {isCurrentMonth ? dayNum : ""}
                </div>

                {visible.map((ev) => {
                  const isFestival = ev.type === "festival";
                  const isMultiDay = !!ev.date_end && ev.date_end !== ev.date;
                  const isStartDay = ev.date.endsWith(
                    `-${String(dayNum).padStart(2, "0")}`,
                  );
                  const { bg, text } = isFestival
                    ? FESTIVAL_STYLE
                    : (GENRE_COLORS[ev.genre] ?? { bg: "#eee", text: "#333" });

                  // 페스티벌: 모든 날에 동일하게 이름 표시
                  // 단독 공연: 시작일에만 이름 표시, 이후 날은 빈 pill로 연속성 표현
                  const label = isFestival
                    ? `★ ${ev.concert_title}`
                    : isStartDay
                      ? ev.band_name
                      : "";

                  return (
                    <button
                      key={ev.id}
                      className={[
                        styles.pill,
                        isMultiDay ? styles.multiDay : "",
                        isMultiDay && !isStartDay
                          ? styles.multiDayContinue
                          : "",
                      ].join(" ")}
                      style={{ background: bg, color: text }}
                      onClick={() => onSelectConcert(ev)}
                      title={
                        isFestival
                          ? ev.concert_title
                          : `${ev.band_name} - ${ev.venue}`
                      }
                    >
                      {label}
                    </button>
                  );
                })}

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
          },
        )}
      </div>
    </div>
  );
}

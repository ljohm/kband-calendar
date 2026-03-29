// app/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Concert, Genre } from "@/types/concert";
import { useConcerts } from "@/hooks/useConcerts";
import { useFestivalArtistCounts } from "@/hooks/useFestivalArtistCounts";

import FilterBar from "@/components/FilterBar/FilterBar";
import CalendarGrid from "@/components/CalendarGrid/CalendarGrid";
import ConcertModal from "@/components/ConcertModal/ConcertModal";
import UpcomingList from "@/components/UpcomingList/UpcomingList";
import StatsPanel from "@/components/StatsPanel/StatsPanel";

import styles from "./page.module.css";

const MONTH_NAMES = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export default function ConcertCalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();

  // URL 쿼리 파라미터에서 year/month 읽기 (없으면 오늘 날짜)
  const [year, setYear] = useState(() => {
    const y = Number(searchParams.get("year"));
    return y > 0 ? y : today.getFullYear();
  });
  const [month, setMonth] = useState(() => {
    const m = Number(searchParams.get("month"));
    // month는 1-indexed로 URL에 저장, state는 0-indexed
    return m >= 1 && m <= 12 ? m - 1 : today.getMonth();
  });

  const [activeGenre, setActiveGenre] = useState<Genre | "all">("all");
  const [selected, setSelected] = useState<Concert | null>(null);

  // 월 이동 시 state + URL 동시 업데이트
  const updateMonth = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    router.replace("/?year=" + y + "&month=" + (m + 1), { scroll: false });
  };

  const prevMonth = () => {
    if (month === 0) updateMonth(year - 1, 11);
    else updateMonth(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 11) updateMonth(year + 1, 0);
    else updateMonth(year, month + 1);
  };

  const { concerts, isLoading, error } = useConcerts({
    year,
    month: month + 1,
    genre: activeGenre,
  });

  // UpcomingList, StatsPanel용: 시작일이 현재 달인 공연만
  const thisMonthConcerts = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const prefix = year + "-" + pad(month + 1);
    return concerts.filter((c) => c.date.startsWith(prefix));
  }, [concerts, year, month]);

  // 페스티벌 출연 밴드 수
  const { totalFestivalBands } = useFestivalArtistCounts(thisMonthConcerts);

  return (
    <main className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>KBAND</span>
          <span className={styles.subtitle}>공연 캘린더</span>
        </div>
        <div className={styles.navControls}>
          <button className={styles.navBtn} onClick={prevMonth}>
            ←
          </button>
          <span className={styles.monthLabel}>
            {year}년 {MONTH_NAMES[month]}
          </span>
          <button className={styles.navBtn} onClick={nextMonth}>
            →
          </button>
        </div>
      </div>

      {/* 장르 필터 */}
      <FilterBar activeGenre={activeGenre} onChange={setActiveGenre} />

      {/* 로딩 / 에러 */}
      {isLoading && <p className={styles.status}>불러오는 중...</p>}
      {error && <p className={styles.error}>오류: {error}</p>}

      {/* 캘린더 */}
      {!isLoading && !error && (
        <CalendarGrid
          year={year}
          month={month}
          concerts={concerts}
          onSelectConcert={setSelected}
        />
      )}

      {/* 하단 패널 */}
      {!isLoading && !error && (
        <div className={styles.sidePanel}>
          <UpcomingList concerts={thisMonthConcerts} onSelect={setSelected} />
          <StatsPanel
            concerts={thisMonthConcerts}
            festivalBandCount={totalFestivalBands}
          />
        </div>
      )}

      {/* 공연 상세 모달 — year/month를 from 파라미터로 전달 */}
      <ConcertModal
        concert={selected}
        onClose={() => setSelected(null)}
        year={year}
        month={month}
      />
    </main>
  );
}

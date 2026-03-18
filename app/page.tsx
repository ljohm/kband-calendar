// app/page.tsx  (또는 components/ConcertCalendar/ConcertCalendar.tsx)
"use client";
import { useState } from "react";
import type { Concert, Genre } from "@/types/concert";
import { useConcerts } from "@/hooks/useConcerts";

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
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [activeGenre, setActiveGenre] = useState<Genre | "all">("all");
  const [selected, setSelected] = useState<Concert | null>(null);

  const { concerts, isLoading, error } = useConcerts({
    year,
    month: month + 1, // API는 1-indexed
    genre: activeGenre,
  });

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <main className={styles.page}>
      {/* ── 헤더 ── */}
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

      {/* ── 장르 필터 ── */}
      <FilterBar activeGenre={activeGenre} onChange={setActiveGenre} />

      {/* ── 로딩 / 에러 ── */}
      {isLoading && <p className={styles.status}>불러오는 중...</p>}
      {error && <p className={styles.error}>오류: {error}</p>}

      {/* ── 캘린더 ── */}
      {!isLoading && !error && (
        <CalendarGrid
          year={year}
          month={month}
          concerts={concerts}
          onSelectConcert={setSelected}
        />
      )}

      {/* ── 하단 패널 ── */}
      {!isLoading && !error && (
        <div className={styles.sidePanel}>
          <UpcomingList concerts={concerts} onSelect={setSelected} />
          <StatsPanel concerts={concerts} />
        </div>
      )}

      {/* ── 공연 상세 모달 ── */}
      <ConcertModal concert={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

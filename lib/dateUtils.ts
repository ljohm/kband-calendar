// lib/dateUtils.ts

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

const DOW_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// ─────────────────────────────────────────
// 단일 날짜 포매팅
// formatDate('2026-03-14') → '2026년 3월 14일'
// ─────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

// ─────────────────────────────────────────
// 날짜 범위 포매팅 (상세 페이지용)
// formatDateRange('2026-03-14', '2026-03-16')
//   → '2026년 3월 14일 ~ 2026년 3월 16일'
// formatDateRange('2026-03-14')
//   → '2026년 3월 14일'
// ─────────────────────────────────────────
export function formatDateRange(date: string, dateEnd?: string): string {
  if (!dateEnd || dateEnd === date) return formatDate(date);
  return `${formatDate(date)} ~ ${formatDate(dateEnd)}`;
}

// ─────────────────────────────────────────
// 페스티벌 날짜 범위 + 기간 포매팅
// formatFestivalDateRange('2026-05-03', '2026-05-05')
//   → '2026년 5월 3일 ~ 2026년 5월 5일 (3일간)'
// ─────────────────────────────────────────
export function formatFestivalDateRange(
  date: string,
  dateEnd?: string,
): string {
  if (!dateEnd || dateEnd === date) return formatDate(date);

  const dayCount =
    Math.round(
      (new Date(dateEnd).getTime() - new Date(date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  return `${formatDate(date)} ~ ${formatDate(dateEnd)} (${dayCount}일간)`;
}

// ─────────────────────────────────────────
// Modal용 축약 날짜 범위
// formatDateRangeShort('2026-03-14', '2026-03-16') → '3/14 ~ 3/16'
// formatDateRangeShort('2026-03-14')               → '2026년 3월 14일'
// ─────────────────────────────────────────
export function formatDateRangeShort(date: string, dateEnd?: string): string {
  if (!dateEnd || dateEnd === date) return formatDate(date);

  const [, sm, sd] = date.split("-");
  const [, em, ed] = dateEnd.split("-");
  return `${parseInt(sm)}/${parseInt(sd)} ~ ${parseInt(em)}/${parseInt(ed)}`;
}

// ─────────────────────────────────────────
// UpcomingList 날짜 배지용
// formatDateBadge('2026-03-14', '2026-03-16')
//   → { month: 'Mar', day: '14', range: '14~16' }
// formatDateBadge('2026-03-07')
//   → { month: 'Mar', day: '7', range: undefined }
// ─────────────────────────────────────────
export function formatDateBadge(
  date: string,
  dateEnd?: string,
): { month: string; day: string; range?: string } {
  const [, sm, sd] = date.split("-");
  const month = MONTH_NAMES[parseInt(sm) - 1];
  const day = String(parseInt(sd));

  if (!dateEnd || dateEnd === date) return { month, day };

  const [, em, ed] = dateEnd.split("-");
  const range =
    sm === em
      ? `${parseInt(sd)}~${parseInt(ed)}`
      : `${parseInt(sd)} ${MONTH_NAMES[parseInt(sm) - 1]}~${parseInt(ed)} ${MONTH_NAMES[parseInt(em) - 1]}`;

  return { month, day, range };
}

// ─────────────────────────────────────────
// 티켓 오픈일 포매팅
// formatTicketOpen('2026-02-14T10:00:00+09:00')
//   → '2026년 2월 14일 오전 10:00'
// ─────────────────────────────────────────
export function formatTicketOpen(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────
// 다일 공연 여부 확인
// isMultiDay('2026-03-14', '2026-03-16') → true
// isMultiDay('2026-03-14')               → false
// ─────────────────────────────────────────
export function isMultiDay(date: string, dateEnd?: string): boolean {
  return !!dateEnd && dateEnd !== date;
}

// ─────────────────────────────────────────
// FestivalArtistList 날짜 헤더용
// formatDayHeader('2026-05-03') → '2026년 5월 3일 (일)'
// ─────────────────────────────────────────
export function formatDayHeader(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const dow = DOW_NAMES[new Date(dateStr).getDay()];
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 (${dow})`;
}

// ─────────────────────────────────────────
// 특정 날짜가 공연 기간 내에 있는지 확인
// isDateInRange('2026-03-15', '2026-03-14', '2026-03-16') → true
// isDateInRange('2026-03-13', '2026-03-14', '2026-03-16') → false
// isDateInRange('2026-03-14', '2026-03-14')               → true  (당일 공연)
// ─────────────────────────────────────────
export function isDateInRange(
  dateStr: string,
  start: string,
  end?: string,
): boolean {
  if (!end || end === start) return dateStr === start;
  return dateStr >= start && dateStr <= end;
}

// ─────────────────────────────────────────
// UpcomingList 날짜 배지 종료일 표시용
// 시작일과 같은 달이면 일(day)만, 다른 달이면 'M/D' 형식으로 반환
// formatDateEndShort('2026-03-14', '2026-03-16') → '~16'
// formatDateEndShort('2026-03-28', '2026-04-02') → '~4/2'
// formatDateEndShort('2026-03-14')               → undefined (당일 공연)
// ─────────────────────────────────────────
export function formatDateEndShort(
  date: string,
  dateEnd?: string,
): string | undefined {
  if (!dateEnd || dateEnd === date) return undefined;

  const [, sm] = date.split("-");
  const [, em, ed] = dateEnd.split("-");

  return sm === em ? `~${parseInt(ed)}` : `~${parseInt(em)}/${parseInt(ed)}`;
}

// ─────────────────────────────────────────
// 공연 기간(일수) 반환
// formatDuration('2026-03-14', '2026-03-16') → '3일간'
// formatDuration('2026-03-14')               → undefined (당일 공연)
// formatDuration('2026-03-14', '2026-03-14') → undefined (당일 공연)
// ─────────────────────────────────────────
export function formatDuration(
  date: string,
  dateEnd?: string,
): string | undefined {
  if (!dateEnd || dateEnd === date) return undefined;

  const dayCount =
    Math.round(
      (new Date(dateEnd).getTime() - new Date(date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  return `${dayCount}일간`;
}

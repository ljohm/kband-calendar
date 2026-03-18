// app/concerts/[id]/page.tsx
"use client";
import { use } from "react";
import Link from "next/link";
import { useConcert } from "@/hooks/useConcert";
import GenreTag from "@/components/GenreTag/GenreTag";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ConcertDetailPage({ params }: Props) {
  const { id } = use(params);
  const { concert, isLoading, error } = useConcert(id);

  // ── 로딩 ──────────────────────────────────
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton}>
          <div className={`${styles.skeletonBox} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonBox} ${styles.skeletonSub}`} />
          <div className={`${styles.skeletonBox} ${styles.skeletonBody}`} />
        </div>
      </main>
    );
  }

  // ── 에러 / 없는 공연 ──────────────────────
  if (error || !concert) {
    return (
      <main className={styles.page}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>공연을 찾을 수 없어요</p>
          <p className={styles.errorSub}>
            {error ?? "존재하지 않거나 삭제된 공연입니다."}
          </p>
          <Link href="/" className={styles.backBtn}>
            ← 캘린더로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  // ── 날짜/시간 포매팅 ──────────────────────
  const [year, month, day] = concert.date.split("-");
  const dateStr = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  const timeStr = concert.start_time
    ? ` ${concert.start_time.slice(0, 5)}`
    : "";

  const ticketOpenStr = concert.ticket_open
    ? new Date(concert.ticket_open).toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const priceStr =
    concert.price_min && concert.price_max
      ? `${concert.price_min.toLocaleString()}원 ~ ${concert.price_max.toLocaleString()}원`
      : concert.price_min
        ? `${concert.price_min.toLocaleString()}원~`
        : null;

  return (
    <main className={styles.page}>
      {/* 뒤로가기 */}
      <Link href="/" className={styles.backLink}>
        ← 캘린더로 돌아가기
      </Link>

      <div className={styles.layout}>
        {/* 왼쪽: 포스터 */}
        <aside className={styles.poster}>
          {concert.poster_url ? (
            <img
              src={concert.poster_url}
              alt={`${concert.concert_title} 포스터`}
              className={styles.posterImg}
            />
          ) : (
            <div className={styles.posterFallback}>
              <span className={styles.posterFallbackText}>
                {concert.band_name}
              </span>
            </div>
          )}
        </aside>

        {/* 오른쪽: 정보 */}
        <section className={styles.info}>
          {/* 헤더 */}
          <div className={styles.infoHeader}>
            <GenreTag genre={concert.genre} size="md" />
            {concert.is_sold_out && (
              <span className={styles.soldOutBadge}>매진</span>
            )}
          </div>

          <h1 className={styles.concertTitle}>{concert.concert_title}</h1>
          <p className={styles.bandName}>{concert.band_name}</p>

          {/* 상세 정보 */}
          <div className={styles.detailList}>
            <DetailRow label="날짜" value={`${dateStr}${timeStr}`} />
            <DetailRow
              label="장소"
              value={`${concert.venue}`}
              sub={concert.city}
            />
            {concert.venue_address && (
              <DetailRow label="주소" value={concert.venue_address} />
            )}
            {concert.venue_capacity && (
              <DetailRow
                label="수용인원"
                value={`${concert.venue_capacity.toLocaleString()}명`}
              />
            )}
            {priceStr && <DetailRow label="가격" value={priceStr} />}
            {ticketOpenStr && (
              <DetailRow label="티켓 오픈" value={ticketOpenStr} highlight />
            )}
          </div>

          {/* 예매 버튼 */}
          <div className={styles.actions}>
            {concert.ticket_url ? (
              <a
                href={concert.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ticketBtn}
              >
                티켓 예매하기
              </a>
            ) : (
              <button className={styles.ticketBtnDisabled} disabled>
                예매처 미등록
              </button>
            )}
          </div>

          {/* 출처 */}
          <p className={styles.source}>
            출처: {concert.source === "manual" ? "직접 등록" : concert.source}
          </p>
        </section>
      </div>
    </main>
  );
}

// ── 상세 정보 행 컴포넌트 ────────────────────
function DetailRow({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span
        className={`${styles.detailValue} ${highlight ? styles.highlight : ""}`}
      >
        {value}
        {sub && <span className={styles.detailSub}> · {sub}</span>}
      </span>
    </div>
  );
}

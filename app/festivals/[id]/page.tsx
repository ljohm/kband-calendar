// app/festivals/[id]/page.tsx
"use client";
import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFestival } from "@/hooks/useFestival";
import FestivalArtistList from "@/components/FestivalArtistList/FestivalArtistList";
import {
  formatDateRange,
  formatDuration,
  formatTicketOpen,
} from "@/lib/dateUtils";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default function FestivalDetailPage({ params }: Props) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { festival, isLoading, error } = useFestival(id);

  // from 파라미터로 뒤로가기 URL 생성
  const from = searchParams.get("from");
  const backUrl = from
    ? "/?year=" + from.split("-")[0] + "&month=" + from.split("-")[1]
    : "/";

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton}>
          <div className={`${styles.skeletonBox} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonBox} ${styles.skeletonSub}`} />
          <div className={`${styles.skeletonBox} ${styles.skeletonGrid}`} />
        </div>
      </main>
    );
  }

  if (error || !festival) {
    return (
      <main className={styles.page}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>페스티벌을 찾을 수 없어요</p>
          <p className={styles.errorSub}>
            {error ?? "존재하지 않거나 삭제된 페스티벌입니다."}
          </p>
          <Link href={backUrl} className={styles.backBtn}>
            ← 캘린더로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const dateStr = formatDateRange(festival.date, festival.date_end);
  const duration = formatDuration(festival.date, festival.date_end);
  const ticketOpenStr = festival.ticket_open
    ? formatTicketOpen(festival.ticket_open)
    : null;

  const priceStr =
    festival.price_min && festival.price_max
      ? festival.price_min.toLocaleString() +
        "원 ~ " +
        festival.price_max.toLocaleString() +
        "원"
      : festival.price_min
        ? festival.price_min.toLocaleString() + "원~"
        : null;

  const stages = [
    ...new Set(festival.artists.map((a) => a.stage).filter(Boolean)),
  ];

  return (
    <main className={styles.page}>
      <Link href={backUrl} className={styles.backLink}>
        ← 캘린더로 돌아가기
      </Link>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {festival.poster_url ? (
            <img
              src={festival.poster_url}
              alt={festival.concert_title + " 포스터"}
              className={styles.posterImg}
            />
          ) : (
            <div className={styles.posterFallback}>
              <span className={styles.posterIcon}>★</span>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          <div className={styles.badges}>
            <span className={styles.festivalBadge}>FESTIVAL</span>
            {festival.is_sold_out && (
              <span className={styles.soldOutBadge}>매진</span>
            )}
          </div>

          <h1 className={styles.title}>{festival.concert_title}</h1>

          <div className={styles.detailList}>
            <DetailRow
              label="날짜"
              value={dateStr}
              sub={duration ?? undefined}
            />
            <DetailRow
              label="장소"
              value={festival.venue}
              sub={festival.city}
            />
            {festival.venue_address && (
              <DetailRow label="주소" value={festival.venue_address} />
            )}
            {festival.venue_capacity && (
              <DetailRow
                label="수용인원"
                value={festival.venue_capacity.toLocaleString() + "명"}
              />
            )}
            {priceStr && <DetailRow label="가격" value={priceStr} />}
            {stages.length > 0 && (
              <DetailRow label="스테이지" value={stages.join(" · ")} />
            )}
            {ticketOpenStr && (
              <DetailRow label="티켓 오픈" value={ticketOpenStr} highlight />
            )}
          </div>

          {festival.ticket_url ? (
            <a
              href={festival.ticket_url}
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
      </div>

      <section className={styles.artistSection}>
        <h2 className={styles.sectionTitle}>
          출연 아티스트
          <span className={styles.artistCount}>
            {festival.artists.length}팀
          </span>
        </h2>
        <FestivalArtistList artists={festival.artists} />
      </section>
    </main>
  );
}

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

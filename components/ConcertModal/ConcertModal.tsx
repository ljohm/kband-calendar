// components/ConcertModal/ConcertModal.tsx
"use client";
import Link from "next/link";
import type { Concert } from "@/types/concert";
import GenreTag from "@/components/GenreTag/GenreTag";
import styles from "./ConcertModal.module.css";

interface Props {
  concert: Concert | null;
  onClose: () => void;
}

export default function ConcertModal({ concert, onClose }: Props) {
  if (!concert) return null;

  const [year, month, day] = concert.date.split("-");
  const dateStr = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  const timeStr = concert.start_time
    ? ` ${concert.start_time.slice(0, 5)}`
    : "";

  const priceStr =
    concert.price_min && concert.price_max
      ? `${concert.price_min.toLocaleString()}원 ~ ${concert.price_max.toLocaleString()}원`
      : concert.price_min
        ? `${concert.price_min.toLocaleString()}원~`
        : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div>
            <p className={styles.bandName}>{concert.band_name}</p>
            <p className={styles.title}>{concert.concert_title}</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 포스터 */}
        {concert.poster_url && (
          <img
            src={concert.poster_url}
            alt={`${concert.concert_title} 포스터`}
            className={styles.poster}
          />
        )}

        {/* 상세 정보 */}
        <div className={styles.details}>
          <DetailRow icon="📅" label="날짜" value={`${dateStr}${timeStr}`} />
          <DetailRow
            icon="📍"
            label="장소"
            value={`${concert.venue}, ${concert.city}`}
          />
          {priceStr && <DetailRow icon="💰" label="가격" value={priceStr} />}
          <div className={styles.detailRow}>
            <span className={styles.icon}>🎸</span>
            <GenreTag genre={concert.genre} size="md" />
          </div>
          {concert.ticket_open && (
            <DetailRow
              icon="⏰"
              label="티켓 오픈"
              value={new Date(concert.ticket_open).toLocaleString("ko-KR")}
            />
          )}
          {concert.is_sold_out && <p className={styles.soldOut}>매진</p>}
        </div>

        {/* 버튼 영역 */}
        <div className={styles.btnGroup}>
          {/* 상세 페이지 이동 버튼 */}
          <Link
            href={`/concerts/${concert.id}`}
            className={styles.detailBtn}
            onClick={onClose}
          >
            상세 보기
          </Link>

          {/* 예매 버튼 */}
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
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.detailValue}>
        <span className={styles.detailLabel}>{label}</span> {value}
      </span>
    </div>
  );
}

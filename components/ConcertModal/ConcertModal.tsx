// components/ConcertModal/ConcertModal.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Concert, FestivalArtist } from "@/types/concert";
import GenreTag from "@/components/GenreTag/GenreTag";
import { GENRE_COLORS } from "@/constants/genre";
import { formatDateRange } from "@/lib/dateUtils";
import styles from "./ConcertModal.module.css";

interface Props {
  concert: Concert | null;
  onClose: () => void;
  year?: number; // from 파라미터용 — 직전에 보던 캘린더 월
  month?: number; // 0-indexed
}

// 페스티벌 출연진 미리보기 최대 인원
const ARTIST_PREVIEW_LIMIT = 5;

export default function ConcertModal({ concert, onClose, year, month }: Props) {
  const [artists, setArtists] = useState<FestivalArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(false);

  // 페스티벌 클릭 시에만 출연진 fetch
  useEffect(() => {
    if (!concert || concert.type !== "festival") {
      setArtists([]);
      return;
    }

    const fetchArtists = async () => {
      setArtistsLoading(true);
      try {
        const res = await fetch(`/api/festivals/${concert.id}`);
        if (!res.ok) return;
        const json: { data: { artists: FestivalArtist[] } } = await res.json();
        setArtists(json.data.artists ?? []);
      } catch {
        setArtists([]);
      } finally {
        setArtistsLoading(false);
      }
    };

    fetchArtists();
  }, [concert?.id, concert?.type]);

  if (!concert) return null;

  const isFestival = concert.type === "festival";
  const fromParam =
    year != null && month != null ? "?from=" + year + "-" + (month + 1) : "";
  const detailUrl = isFestival
    ? "/festivals/" + concert.id + fromParam
    : "/concerts/" + concert.id + fromParam;

  const dateStr = formatDateRange(concert.date, concert.date_end);
  const timeStr = concert.start_time
    ? ` ${concert.start_time.slice(0, 5)}`
    : "";

  const priceStr =
    concert.price_min && concert.price_max
      ? `${concert.price_min.toLocaleString()}원 ~ ${concert.price_max.toLocaleString()}원`
      : concert.price_min
        ? `${concert.price_min.toLocaleString()}원~`
        : null;

  const previewArtists = artists.slice(0, ARTIST_PREVIEW_LIMIT);
  const overflowCount = artists.length - ARTIST_PREVIEW_LIMIT;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div>
            {isFestival ? (
              <span className={styles.festivalBadge}>FESTIVAL</span>
            ) : (
              <p className={styles.bandName}>{concert.band_name}</p>
            )}
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
            alt={concert.concert_title}
            className={styles.poster}
          />
        )}

        {/* 공연 기본 정보 */}
        <div className={styles.details}>
          <DetailRow icon="📅" label="날짜" value={`${dateStr}${timeStr}`} />
          <DetailRow
            icon="📍"
            label="장소"
            value={`${concert.venue}, ${concert.city}`}
          />
          {priceStr && <DetailRow icon="💰" label="가격" value={priceStr} />}

          {/* 단독 공연만 장르 표시 */}
          {!isFestival && concert.genre && (
            <div className={styles.detailRow}>
              <span className={styles.icon}>🎸</span>
              <GenreTag genre={concert.genre} size="md" />
            </div>
          )}

          {concert.ticket_open && (
            <DetailRow
              icon="⏰"
              label="티켓 오픈"
              value={new Date(concert.ticket_open).toLocaleString("ko-KR")}
            />
          )}
          {concert.is_sold_out && <p className={styles.soldOut}>매진</p>}
        </div>

        {/* 페스티벌 출연진 미리보기 */}
        {isFestival && (
          <div className={styles.artistPreview}>
            <p className={styles.artistPreviewTitle}>
              출연 아티스트
              {!artistsLoading && artists.length > 0 && (
                <span className={styles.artistCount}>{artists.length}팀</span>
              )}
            </p>

            {artistsLoading ? (
              /* 로딩 스켈레톤 */
              <div className={styles.artistSkeletonRow}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.artistSkeleton} />
                ))}
              </div>
            ) : previewArtists.length === 0 ? (
              <p className={styles.artistEmpty}>출연진 정보가 없습니다</p>
            ) : (
              <>
                <div className={styles.artistRow}>
                  {previewArtists.map((artist) => {
                    const { bg, text } = GENRE_COLORS[artist.genre] ?? {
                      bg: "#eee",
                      text: "#333",
                    };
                    return (
                      <div key={artist.id} className={styles.artistChip}>
                        {/* 이니셜 아바타 */}
                        <div
                          className={styles.artistAvatar}
                          style={{ background: bg, color: text }}
                        >
                          {artist.band_image_url ? (
                            <img
                              src={artist.band_image_url}
                              alt={artist.band_name}
                              className={styles.artistAvatarImg}
                            />
                          ) : (
                            artist.band_name[0]
                          )}
                        </div>
                        <span className={styles.artistName}>
                          {artist.band_name}
                        </span>
                        {artist.perform_time && (
                          <span className={styles.artistTime}>
                            {artist.perform_time.slice(0, 5)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* +N명 더 */}
                  {overflowCount > 0 && (
                    <div
                      className={`${styles.artistChip} ${styles.artistOverflow}`}
                    >
                      <div className={styles.artistAvatar}>
                        +{overflowCount}
                      </div>
                      <span className={styles.artistName}>더 보기</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className={styles.btnGroup}>
          <Link href={detailUrl} className={styles.detailBtn} onClick={onClose}>
            {isFestival ? "전체 출연진 보기" : "공연 상세 보기"}
          </Link>

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

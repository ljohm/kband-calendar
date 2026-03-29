// components/FestivalArtistList/FestivalArtistList.tsx
import type { FestivalArtist } from "@/types/concert";
import GenreTag from "@/components/GenreTag/GenreTag";
import styles from "./FestivalArtistList.module.css";

interface Props {
  artists: FestivalArtist[];
}

export default function FestivalArtistList({ artists }: Props) {
  if (artists.length === 0) {
    return (
      <p className={styles.empty}>출연진 정보가 아직 등록되지 않았습니다.</p>
    );
  }

  // perform_date 기준으로 그룹핑 (다일 페스티벌 대응)
  const grouped = artists.reduce<Record<string, FestivalArtist[]>>(
    (acc, artist) => {
      const key = artist.perform_date ?? "미정";
      if (!acc[key]) acc[key] = [];
      acc[key].push(artist);
      return acc;
    },
    {},
  );

  const dates = Object.keys(grouped).sort();
  const isMultiDay = dates.length > 1 || dates[0] !== "미정";

  return (
    <div className={styles.container}>
      {dates.map((date) => (
        <div key={date}>
          {/* 다일 페스티벌이면 날짜 헤더 표시 */}
          {isMultiDay && (
            <p className={styles.dateHeader}>
              {date === "미정" ? "날짜 미정" : formatDate(date)}
            </p>
          )}

          <div className={styles.grid}>
            {grouped[date].map((artist) => (
              <div key={artist.id} className={styles.card}>
                {/* 밴드 이미지 or 이니셜 */}
                <div className={styles.avatar}>
                  {artist.band_image_url ? (
                    <img
                      src={artist.band_image_url}
                      alt={artist.band_name}
                      className={styles.avatarImg}
                    />
                  ) : (
                    <span className={styles.avatarInitial}>
                      {artist.band_name[0]}
                    </span>
                  )}
                </div>

                <div className={styles.info}>
                  <p className={styles.bandName}>{artist.band_name}</p>
                  <GenreTag genre={artist.genre} size="sm" />

                  <div className={styles.meta}>
                    {artist.stage && (
                      <span className={styles.stage}>{artist.stage}</span>
                    )}
                    {artist.perform_time && (
                      <span className={styles.time}>
                        {artist.perform_time.slice(0, 5)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const dow = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date(dateStr);
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 (${dow[d.getDay()]})`;
}

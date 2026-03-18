// types/concert.ts

// 장르 타입 — FilterBar, GenreTag, CalendarGrid 등에서 사용
export type Genre =
  | "rock"
  | "indie"
  | "metal"
  | "pop"
  | "jazz"
  | "emo"
  | "hiphop";

// 크롤링 출처 — API route에서 사용
export type CrawlSource = "manual" | "interpark" | "yes24" | "melon";

// 공연 타입 — 모든 컴포넌트에서 공통으로 사용
export interface Concert {
  id: string;

  // 공연 정보 (ConcertModal, UpcomingList, CalendarGrid)
  concert_title: string; // 공연명
  date: string; // 'YYYY-MM-DD'
  start_time?: string; // 'HH:MM'
  ticket_url?: string; // 예매 링크
  ticket_open?: string; // 티켓 오픈 일시 (ISO 8601)
  price_min?: number; // 최저가 (원)
  price_max?: number; // 최고가 (원)
  poster_url?: string; // 포스터 이미지
  is_sold_out: boolean;
  source: CrawlSource;

  // 밴드 정보 (Supabase bands 테이블 JOIN)
  band_id: string;
  band_name: string; // CalendarGrid pill, UpcomingList, ConcertModal
  genre: Genre; // FilterBar, GenreTag, CalendarGrid pill 색상
  band_image_url?: string;

  // 공연장 정보 (Supabase venues 테이블 JOIN)
  venue_id: string;
  venue: string; // ConcertModal, UpcomingList
  city: string; // ConcertModal
  venue_address?: string;
  venue_capacity?: number;
}

// 공연 생성/수정용 (관리자 페이지)
export interface ConcertInput {
  band_id: string;
  venue_id: string;
  concert_title: string;
  date: string;
  start_time?: string;
  ticket_url?: string;
  ticket_open?: string;
  price_min?: number;
  price_max?: number;
  poster_url?: string;
  is_sold_out?: boolean;
}

// API 쿼리 파라미터 (useConcerts hook)
export interface ConcertQuery {
  year?: number;
  month?: number; // 1–12
  genre?: Genre | "all";
  city?: string;
  band_id?: string;
}

// API 응답 래퍼
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// 밴드 타입 — api/bands/route.ts, 관리자 페이지에서 사용
export interface Band {
  id: string;
  name: string;
  genre: Genre;
  description?: string;
  image_url?: string;
  sns_url?: string;
  created_at?: string;
}

// 밴드 생성/수정용 (관리자 페이지)
export interface BandInput {
  name: string;
  genre: Genre;
  description?: string;
  image_url?: string;
  sns_url?: string;
}

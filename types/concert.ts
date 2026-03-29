// types/concert.ts

// 장르 타입
export type Genre =
  | "rock"
  | "indie"
  | "metal"
  | "pop"
  | "jazz"
  | "emo"
  | "hiphop";

// 크롤링 출처
export type CrawlSource = "manual" | "interpark" | "yes24" | "melon";

// 공연 타입 구분
export type ConcertType = "concert" | "festival";

// 공연 타입 — concerts_full 뷰와 1:1 매핑
export interface Concert {
  id: string;
  type: ConcertType; // 'concert' | 'festival'

  // 공연 정보
  concert_title: string; // 공연명
  date: string; // 'YYYY-MM-DD' 시작일
  date_end?: string; // 'YYYY-MM-DD' 종료일 (null이면 당일 공연)
  start_time?: string; // 'HH:MM'
  ticket_url?: string;
  ticket_open?: string; // ISO 8601
  price_min?: number;
  price_max?: number;
  poster_url?: string;
  is_sold_out: boolean;
  source: CrawlSource;

  // 밴드 정보 (bands 테이블 JOIN)
  band_id: string;
  band_name: string;
  genre: Genre;
  band_image_url?: string;

  // 공연장 정보 (venues 테이블 JOIN)
  venue_id: string;
  venue: string;
  city: string;
  venue_address?: string;
  venue_capacity?: number;
}

// 공연 생성/수정용 (관리자 페이지)
export interface ConcertInput {
  band_id: string;
  venue_id: string;
  concert_title: string;
  date: string;
  date_end?: string; // 종료일 (null이면 당일)
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

// 밴드 타입
export interface Band {
  id: string;
  name: string;
  genre: Genre;
  description?: string;
  image_url?: string;
  sns_url?: string;
  created_at?: string;
}

// 밴드 생성/수정용
export interface BandInput {
  name: string;
  genre: Genre;
  description?: string;
  image_url?: string;
  sns_url?: string;
}

// 페스티벌 출연진 타입 — festival_artists_full 뷰와 1:1 매핑
export interface FestivalArtist {
  id: string;
  concert_id: string;
  stage?: string;
  perform_date?: string; // 'YYYY-MM-DD'
  perform_time?: string; // 'HH:MM'
  band_id: string;
  band_name: string;
  genre: Genre;
  band_image_url?: string;
  band_sns_url?: string;
}

// 페스티벌 상세 (공연 정보 + 출연진 목록)
export interface FestivalDetail extends Concert {
  type: "festival";
  artists: FestivalArtist[];
}

// 페스티벌 출연진 등록용
export interface FestivalArtistInput {
  concert_id: string;
  band_id: string;
  stage?: string;
  perform_date?: string;
  perform_time?: string;
}

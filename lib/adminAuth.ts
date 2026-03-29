// lib/adminAuth.ts
// 관리자 인증 유틸리티
// 환경변수 ADMIN_PASSWORD와 비교해서 인증 처리

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";
const SESSION_KEY = "kband_admin_auth";

// 브라우저 세션스토리지에 인증 상태 저장
export function setAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, "true");
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

// 비밀번호 검증 (API Route에서 사용)
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// app/admin/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminSession } from "@/lib/adminAuth";
import styles from "./admin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();

      if (json.success) {
        setAdminSession();
        router.replace("/admin/dashboard");
      } else {
        setError(json.error ?? "인증 실패");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <p className={styles.loginLogo}>KBAND</p>
        <p className={styles.loginTitle}>관리자 로그인</p>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={styles.loginInput}
            autoFocus
          />
          {error && <p className={styles.loginError}>{error}</p>}
          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading || !pw}
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

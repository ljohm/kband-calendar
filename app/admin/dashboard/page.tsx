// app/admin/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

interface Stats {
  concerts: number;
  festivals: number;
  bands: number;
  venues: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const { data } = await res.json();
        if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error("통계 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickLinks = [
    { href: "/admin/concerts/new", label: "공연 등록", color: "#E24B4A" },
    {
      href: "/admin/concerts/new?type=festival",
      label: "페스티벌 등록",
      color: "#534AB7",
    },
    { href: "/admin/bands/new", label: "밴드 등록", color: "#0F6E56" },
    { href: "/admin/venues/new", label: "공연장 등록", color: "#854F0B" },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>대시보드</h1>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div
                style={{
                  height: 60,
                  background: "var(--color-background-secondary)",
                  borderRadius: 8,
                }}
              />
            </div>
          ))
        ) : (
          <>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>단독 공연</p>
              <p className={styles.statValue}>{stats?.concerts}</p>
              <p className={styles.statSub}>개 등록</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>페스티벌</p>
              <p className={styles.statValue}>{stats?.festivals}</p>
              <p className={styles.statSub}>개 등록</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>밴드</p>
              <p className={styles.statValue}>{stats?.bands}</p>
              <p className={styles.statSub}>팀 등록</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>공연장</p>
              <p className={styles.statValue}>{stats?.venues}</p>
              <p className={styles.statSub}>곳 등록</p>
            </div>
          </>
        )}
      </div>

      {/* 빠른 등록 */}
      <h2
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          marginBottom: "0.75rem",
        }}
      >
        빠른 등록
      </h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {quickLinks.map(({ href, label, color }) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: "9px 18px",
              background: color,
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
          >
            + {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

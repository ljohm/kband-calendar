// app/admin/concerts/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dateUtils";
import styles from "../admin.module.css";

interface ConcertRow {
  id: string;
  type: string;
  title: string;
  date: string;
  date_end?: string;
  is_sold_out: boolean;
  band_name: string | null;
  venue: string;
  city: string;
}

export default function AdminConcertsPage() {
  const [concerts, setConcerts] = useState<ConcertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "concert" | "festival">("all");

  const fetchConcerts = async () => {
    setLoading(true);
    let query = supabase
      .from("concerts_full")
      .select(
        "id, type, concert_title, date, date_end, is_sold_out, band_name, venue, city",
      )
      .order("date", { ascending: false });

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data } = await query;
    setConcerts(
      (data ?? []).map((c: any) => ({
        id: c.id,
        type: c.type,
        title: c.concert_title,
        date: c.date,
        date_end: c.date_end,
        is_sold_out: c.is_sold_out,
        band_name: c.band_name,
        venue: c.venue,
        city: c.city,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchConcerts();
  }, [filter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"을(를) 삭제할까요?`)) return;
    try {
      const res = await fetch(`/api/concerts/${id}`, { method: "DELETE" });
      const { error } = await res.json();
      if (error) throw new Error(error);
      fetchConcerts();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>공연 관리</h1>
        <Link href="/admin/concerts/new" className={styles.addBtn}>
          + 공연 등록
        </Link>
      </div>

      {/* 필터 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {(["all", "concert", "festival"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              border: "0.5px solid",
              borderColor:
                filter === f ? "#E24B4A" : "var(--color-border-secondary)",
              background: filter === f ? "#E24B4A" : "transparent",
              color: filter === f ? "#fff" : "var(--color-text-secondary)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {f === "all" ? "전체" : f === "concert" ? "단독 공연" : "페스티벌"}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>구분</th>
              <th>공연명</th>
              <th>밴드</th>
              <th>날짜</th>
              <th>공연장</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.emptyRow}>
                <td colSpan={7}>불러오는 중...</td>
              </tr>
            ) : concerts.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={7}>등록된 공연이 없습니다</td>
              </tr>
            ) : (
              concerts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span
                      className={`${styles.badge} ${c.type === "festival" ? styles.badgeFestival : styles.badgeConcert}`}
                    >
                      {c.type === "festival" ? "페스티벌" : "공연"}
                    </span>
                  </td>
                  <td style={{ maxWidth: 200 }}>{c.title}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>
                    {c.band_name ?? "-"}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatDate(c.date)}
                    {c.date_end && c.date_end !== c.date && (
                      <span
                        style={{
                          color: "var(--color-text-tertiary)",
                          fontSize: 11,
                        }}
                      >
                        {" ~"}
                      </span>
                    )}
                  </td>
                  <td>
                    {c.venue}{" "}
                    <span
                      style={{
                        color: "var(--color-text-tertiary)",
                        fontSize: 11,
                      }}
                    >
                      ({c.city})
                    </span>
                  </td>
                  <td>
                    {c.is_sold_out && (
                      <span
                        className={`${styles.badge} ${styles.badgeSoldOut}`}
                      >
                        매진
                      </span>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link
                      href={`/admin/concerts/${c.id}`}
                      className={styles.editBtn}
                    >
                      수정
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(c.id, c.title)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

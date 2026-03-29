// app/admin/bands/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GENRE_LABELS } from "@/constants/genre";
import styles from "../admin.module.css";

interface BandRow {
  id: string;
  name: string;
  genre: string;
  description?: string;
}

export default function AdminBandsPage() {
  const [bands, setBands] = useState<BandRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBands = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bands")
      .select("id, name, genre, description")
      .order("name");
    setBands(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBands();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `"${name}" 밴드를 삭제할까요?\n해당 밴드의 공연도 함께 삭제됩니다.`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/bands/${id}`, { method: "DELETE" });
      const { error } = await res.json();
      if (error) throw new Error(error);
      fetchBands();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>밴드 관리</h1>
        <Link href="/admin/bands/new" className={styles.addBtn}>
          + 밴드 등록
        </Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>밴드명</th>
              <th>장르</th>
              <th>설명</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.emptyRow}>
                <td colSpan={4}>불러오는 중...</td>
              </tr>
            ) : bands.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={4}>등록된 밴드가 없습니다</td>
              </tr>
            ) : (
              bands.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.name}</td>
                  <td>
                    {GENRE_LABELS[b.genre as keyof typeof GENRE_LABELS] ??
                      b.genre}
                  </td>
                  <td
                    style={{
                      color: "var(--color-text-secondary)",
                      maxWidth: 280,
                    }}
                  >
                    {b.description ?? "-"}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link
                      href={`/admin/bands/${b.id}`}
                      className={styles.editBtn}
                    >
                      수정
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(b.id, b.name)}
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

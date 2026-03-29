// app/admin/venues/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "../admin.module.css";

interface VenueRow {
  id: string;
  name: string;
  city: string;
  address?: string;
  capacity?: number;
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVenues = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("venues")
      .select("id, name, city, address, capacity")
      .order("city")
      .order("name");
    setVenues(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `"${name}" 공연장을 삭제할까요?\n해당 공연장의 공연도 함께 삭제됩니다.`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/venues/${id}`, { method: "DELETE" });
      const { error } = await res.json();
      if (error) throw new Error(error);
      fetchVenues();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>공연장 관리</h1>
        <Link href="/admin/venues/new" className={styles.addBtn}>
          + 공연장 등록
        </Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>공연장명</th>
              <th>도시</th>
              <th>주소</th>
              <th>수용인원</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.emptyRow}>
                <td colSpan={5}>불러오는 중...</td>
              </tr>
            ) : venues.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={5}>등록된 공연장이 없습니다</td>
              </tr>
            ) : (
              venues.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td>{v.city}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>
                    {v.address ?? "-"}
                  </td>
                  <td>
                    {v.capacity ? v.capacity.toLocaleString() + "명" : "-"}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link
                      href={`/admin/venues/${v.id}`}
                      className={styles.editBtn}
                    >
                      수정
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(v.id, v.name)}
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

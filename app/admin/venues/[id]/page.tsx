// app/admin/venues/[id]/page.tsx
"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "../../admin.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

const CITIES = [
  "서울",
  "부산",
  "대구",
  "광주",
  "대전",
  "인천",
  "제주",
  "수원",
  "울산",
  "기타",
];

export default function AdminVenueFormPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    city: "서울",
    address: "",
    capacity: "",
  });

  useEffect(() => {
    if (isNew) return;
    const fetch_ = async () => {
      const { data } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setForm({
          name: data.name ?? "",
          city: data.city ?? "서울",
          address: data.address ?? "",
          capacity: data.capacity ? String(data.capacity) : "",
        });
      }
      setLoading(false);
    };
    fetch_();
  }, [id, isNew]);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name) {
      setError("공연장명을 입력해주세요.");
      return;
    }
    if (!form.city) {
      setError("도시를 선택해주세요.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city,
        address: form.address || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
      };

      if (isNew) {
        const res = await fetch("/api/venues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setSuccess("등록 완료!");
        setTimeout(() => router.push("/admin/venues"), 1000);
      } else {
        const res = await fetch(`/api/venues/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setSuccess("수정 완료!");
      }
    } catch (err: any) {
      setError(
        err.message?.includes("unique")
          ? "이미 등록된 공연장명입니다."
          : (err.message ?? "저장 중 오류가 발생했습니다."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>
        불러오는 중...
      </div>
    );

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {isNew ? "공연장 등록" : "공연장 수정"}
        </h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>
                공연장명 <span className={styles.formRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="올림픽공원 올림픽홀"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                도시 <span className={styles.formRequired}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>수용인원</label>
              <input
                type="number"
                className={styles.formInput}
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>주소</label>
              <input
                type="text"
                className={styles.formInput}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="서울특별시 송파구 올림픽로 424"
              />
            </div>
          </div>

          {error && <p className={styles.formError}>{error}</p>}
          {success && <p className={styles.formSuccess}>{success}</p>}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving}
            >
              {saving ? "저장 중..." : isNew ? "등록" : "수정"}
            </button>
            <Link href="/admin/venues" className={styles.cancelBtn}>
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

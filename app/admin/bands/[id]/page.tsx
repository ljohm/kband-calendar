// app/admin/bands/[id]/page.tsx
"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "../../admin.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

const GENRE_OPTIONS = [
  { value: "rock", label: "록" },
  { value: "indie", label: "인디" },
  { value: "metal", label: "메탈" },
  { value: "pop", label: "팝/밴드" },
  { value: "jazz", label: "재즈" },
  { value: "emo", label: "이모/얼터" },
  { value: "hiphop", label: "힙합" },
];

export default function AdminBandFormPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    genre: "indie",
    description: "",
    image_url: "",
    sns_url: "",
  });

  useEffect(() => {
    if (isNew) return;
    const fetch_ = async () => {
      const { data } = await supabase
        .from("bands")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setForm({
          name: data.name ?? "",
          genre: data.genre ?? "indie",
          description: data.description ?? "",
          image_url: data.image_url ?? "",
          sns_url: data.sns_url ?? "",
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
      setError("밴드명을 입력해주세요.");
      return;
    }
    if (!form.genre) {
      setError("장르를 선택해주세요.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        genre: form.genre,
        description: form.description || null,
        image_url: form.image_url || null,
        sns_url: form.sns_url || null,
      };

      if (isNew) {
        const res = await fetch("/api/bands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const { error: err } = await res.json();
        if (err) throw new Error(err);
        setSuccess("등록 완료!");
        setTimeout(() => router.push("/admin/bands"), 1000);
      } else {
        const res = await fetch(`/api/bands/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const { error: err } = await res.json();
        if (err) throw new Error(err);
        setSuccess("수정 완료!");
      }
    } catch (err: any) {
      setError(
        err.message?.includes("unique")
          ? "이미 등록된 밴드명입니다."
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
          {isNew ? "밴드 등록" : "밴드 수정"}
        </h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                밴드명 <span className={styles.formRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="혁오"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                장르 <span className={styles.formRequired}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={form.genre}
                onChange={(e) => set("genre", e.target.value)}
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>설명</label>
              <textarea
                className={styles.formTextarea}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="밴드 소개글을 입력하세요"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>이미지 URL</label>
              <input
                type="url"
                className={styles.formInput}
                value={form.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>SNS URL</label>
              <input
                type="url"
                className={styles.formInput}
                value={form.sns_url}
                onChange={(e) => set("sns_url", e.target.value)}
                placeholder="https://instagram.com/..."
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
            <Link href="/admin/bands" className={styles.cancelBtn}>
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

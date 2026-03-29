// app/admin/concerts/[id]/page.tsx
// id === 'new' → 등록, id === UUID → 수정
"use client";
import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../../admin.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

interface Band {
  id: string;
  name: string;
  genre: string;
}
interface Venue {
  id: string;
  name: string;
  city: string;
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

export default function AdminConcertFormPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = id === "new";
  const defaultType =
    searchParams.get("type") === "festival" ? "festival" : "concert";

  const [bands, setBands] = useState<Band[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    type: defaultType,
    band_id: "",
    venue_id: "",
    title: "",
    date: "",
    date_end: "",
    start_time: "",
    ticket_url: "",
    ticket_open: "",
    price_min: "",
    price_max: "",
    poster_url: "",
    is_sold_out: false,
  });

  // 밴드/공연장 목록 불러오기
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [bRes, vRes] = await Promise.all([
          fetch("/api/bands").then((r) => r.json()),
          fetch("/api/venues").then((r) => r.json()),
        ]);
        setBands(bRes.data ?? []);
        setVenues(vRes.data ?? []);
      } catch (err) {
        console.error("밴드/공연장 목록 조회 실패:", err);
      }
    };
    fetchOptions();
  }, []);

  // 수정 시 기존 데이터 불러오기
  useEffect(() => {
    if (isNew) return;
    const fetchConcert = async () => {
      try {
        const res = await fetch(`/api/concerts/${id}`);
        const { data } = await res.json();

        if (data) {
          setForm({
            type: data.type ?? "concert",
            band_id: data.band_id ?? "",
            venue_id: data.venue_id ?? "",
            title: data.title ?? "",
            date: data.date ?? "",
            date_end: data.date_end ?? "",
            start_time: data.start_time ?? "",
            ticket_url: data.ticket_url ?? "",
            ticket_open: data.ticket_open ? data.ticket_open.slice(0, 16) : "",
            price_min: data.price_min ? String(data.price_min) : "",
            price_max: data.price_max ? String(data.price_max) : "",
            poster_url: data.poster_url ?? "",
            is_sold_out: data.is_sold_out ?? false,
          });
        }
      } catch (err) {
        console.error("공연 데이터 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConcert();
  }, [id, isNew]);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.venue_id) {
      setError("공연장을 선택해주세요.");
      return;
    }
    if (!form.title) {
      setError("공연명을 입력해주세요.");
      return;
    }
    if (!form.date) {
      setError("날짜를 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        band_id: form.band_id || null,
        venue_id: form.venue_id,
        title: form.title,
        date: form.date,
        date_end: form.date_end || null,
        start_time: form.start_time || null,
        ticket_url: form.ticket_url || null,
        ticket_open: form.ticket_open
          ? new Date(form.ticket_open).toISOString()
          : null,
        price_min: form.price_min ? parseInt(form.price_min) : null,
        price_max: form.price_max ? parseInt(form.price_max) : null,
        poster_url: form.poster_url || null,
        is_sold_out: form.is_sold_out,
        source: "manual",
      };

      if (isNew) {
        const res = await fetch("/api/concerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, concert_title: payload.title }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setSuccess("등록 완료!");
        setTimeout(() => router.push("/admin/concerts"), 1000);
      } else {
        const res = await fetch(`/api/concerts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, concert_title: payload.title }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setSuccess("수정 완료!");
      }
    } catch (err: any) {
      setError(err.message ?? "저장 중 오류가 발생했습니다.");
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
          {isNew
            ? form.type === "festival"
              ? "페스티벌 등록"
              : "공연 등록"
            : "공연 수정"}
        </h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* 구분 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                구분 <span className={styles.formRequired}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="concert">단독 공연</option>
                <option value="festival">페스티벌</option>
              </select>
            </div>

            {/* 밴드 (단독 공연만) */}
            {form.type === "concert" && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>밴드</label>
                <select
                  className={styles.formSelect}
                  value={form.band_id}
                  onChange={(e) => set("band_id", e.target.value)}
                >
                  <option value="">밴드 선택</option>
                  {bands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 공연명 */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>
                공연명 <span className={styles.formRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={
                  form.type === "festival"
                    ? "KBAND FEST 2026"
                    : "밴드명 단독 공연"
                }
              />
            </div>

            {/* 공연장 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                공연장 <span className={styles.formRequired}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={form.venue_id}
                onChange={(e) => set("venue_id", e.target.value)}
              >
                <option value="">공연장 선택</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.city})
                  </option>
                ))}
              </select>
            </div>

            {/* 시작 날짜 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                시작일 <span className={styles.formRequired}>*</span>
              </label>
              <input
                type="date"
                className={styles.formInput}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>

            {/* 종료 날짜 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                종료일{" "}
                <span
                  style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}
                >
                  (다일 공연)
                </span>
              </label>
              <input
                type="date"
                className={styles.formInput}
                value={form.date_end}
                onChange={(e) => set("date_end", e.target.value)}
                min={form.date}
              />
            </div>

            {/* 시작 시간 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>시작 시간</label>
              <input
                type="time"
                className={styles.formInput}
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>

            {/* 티켓 오픈 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>티켓 오픈 일시</label>
              <input
                type="datetime-local"
                className={styles.formInput}
                value={form.ticket_open}
                onChange={(e) => set("ticket_open", e.target.value)}
              />
            </div>

            {/* 가격 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>최저가 (원)</label>
              <input
                type="number"
                className={styles.formInput}
                value={form.price_min}
                onChange={(e) => set("price_min", e.target.value)}
                placeholder="50000"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>최고가 (원)</label>
              <input
                type="number"
                className={styles.formInput}
                value={form.price_max}
                onChange={(e) => set("price_max", e.target.value)}
                placeholder="120000"
              />
            </div>

            {/* 예매 링크 */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>예매 링크</label>
              <input
                type="url"
                className={styles.formInput}
                value={form.ticket_url}
                onChange={(e) => set("ticket_url", e.target.value)}
                placeholder="https://tickets.interpark.com/..."
              />
            </div>

            {/* 포스터 */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>포스터 이미지 URL</label>
              <input
                type="url"
                className={styles.formInput}
                value={form.poster_url}
                onChange={(e) => set("poster_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* 매진 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>매진 여부</label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  marginTop: 4,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_sold_out}
                  onChange={(e) => set("is_sold_out", e.target.checked)}
                />
                매진
              </label>
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
            <Link href="/admin/concerts" className={styles.cancelBtn}>
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

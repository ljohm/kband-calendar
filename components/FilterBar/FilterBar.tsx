// components/FilterBar/FilterBar.tsx
"use client";
import { ALL_GENRES, GENRE_LABELS } from "@/constants/genre";
import type { Genre } from "@/types/concert";
import styles from "./FilterBar.module.css";

interface Props {
  activeGenre: Genre | "all";
  onChange: (genre: Genre | "all") => void;
}

export default function FilterBar({ activeGenre, onChange }: Props) {
  return (
    <div className={styles.bar}>
      <button
        className={`${styles.chip} ${activeGenre === "all" ? styles.active : ""}`}
        onClick={() => onChange("all")}
      >
        전체
      </button>
      {ALL_GENRES.map((genre) => (
        <button
          key={genre}
          className={`${styles.chip} ${activeGenre === genre ? styles.active : ""}`}
          onClick={() => onChange(genre)}
        >
          {GENRE_LABELS[genre]}
        </button>
      ))}
    </div>
  );
}

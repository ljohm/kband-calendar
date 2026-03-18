// components/GenreTag/GenreTag.tsx
import type { Genre } from "@/types/concert";
import { GENRE_LABELS, GENRE_COLORS } from "@/constants/genre";

interface Props {
  genre: Genre;
  size?: "sm" | "md";
}

export default function GenreTag({ genre, size = "sm" }: Props) {
  const { bg, text } = GENRE_COLORS[genre] ?? {
    bg: "#F1EFE8",
    text: "#444441",
  };
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? "10px" : "12px";

  return (
    <span
      style={{
        background: bg,
        color: text,
        padding,
        fontSize,
        fontWeight: 500,
        borderRadius: "100px",
        display: "inline-block",
        lineHeight: 1.6,
      }}
    >
      {GENRE_LABELS[genre] ?? genre}
    </span>
  );
}

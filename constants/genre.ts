// constants/genre.ts
import type { Genre } from "@/types/concert";

export const GENRE_LABELS: Record<Genre, string> = {
  rock: "록",
  indie: "인디",
  metal: "메탈",
  pop: "팝/밴드",
  jazz: "재즈",
  emo: "이모/얼터",
  hiphop: "힙합",
};

export const GENRE_COLORS: Record<Genre, { bg: string; text: string }> = {
  rock: { bg: "#FCEBEB", text: "#A32D2D" },
  indie: { bg: "#E6F1FB", text: "#0C447C" },
  metal: { bg: "#F1EFE8", text: "#444441" },
  pop: { bg: "#FBEAF0", text: "#72243E" },
  jazz: { bg: "#EAF3DE", text: "#27500A" },
  emo: { bg: "#FAEEDA", text: "#633806" },
  hiphop: { bg: "#EEEDFE", text: "#3C3489" },
};

export const ALL_GENRES = Object.keys(GENRE_LABELS) as Genre[];

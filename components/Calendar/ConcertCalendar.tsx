// components/Calendar/ConcertCalendar.tsx
"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Concert } from "@/types/concert";

interface Props {
  concerts: Concert[];
}

export default function ConcertCalendar({ concerts }: Props) {
  const events = concerts.map((c) => ({
    id: c.id,
    title: `${c.band_name} - ${c.venue}`,
    date: c.date,
    extendedProps: c,
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale="ko"
      events={events}
      eventClick={(info) => {
        // 공연 상세 모달 or 페이지 이동
        console.log(info.event.extendedProps);
      }}
      height="auto"
    />
  );
}

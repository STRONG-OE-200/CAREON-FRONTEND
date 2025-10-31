// app/room/[id]/layout.tsx

import BottomNav from "@/components/BottomNav";
import React from "react";

// (★핵심★)
// 이 파일은 async도, params도, await도 필요 없습니다.
// 그냥 'children'을 받아서 'BottomNav'와 함께 보여주기만 합니다.
export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {children} {/* <- 여기에 page.tsx (스케줄, 로그 등)가 들어옴 */}
      </main>

      {/* (★핵심★)
        BottomNav에 roomId를 넘겨주지 않습니다!
        (BottomNav가 "use client"와 "useParams"로 스스로 ID를 찾을 겁니다)
      */}
      <BottomNav />
    </div>
  );
}

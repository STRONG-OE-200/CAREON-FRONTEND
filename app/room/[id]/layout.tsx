import React from "react";
import BottomNav from "@/components/BottomNav";

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

      {/* BottomNav에 roomId를 넘겨주지 않습니다. */}
      <BottomNav />
    </div>
  );
}

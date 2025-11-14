// app/(main)/room/[id]/schedule/layout.tsx

"use client";
import React, { useState } from "react";
import { useRoom } from "@/lib/RoomContext"; // 1. Provider 대신 useRoom 훅만 import
import TopBar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. 부모 레이아웃이 제공한 Context에서 데이터를 가져옴
  const { roomId, isOwner, scheduleStatus, isLoading } = useRoom();

  // 3. Context가 로딩 중일 때 (깜빡임 방지)
  if (isLoading) {
    return <div className="p-8 text-center">스케줄 정보 로딩 중...</div>;
  }

  return (
    // 4. <RoomProvider>가 여기서 제거됨
    <div className="flex-1 flex flex-col">
      <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isOwner={isOwner} // Context에서 가져온 값
        roomId={roomId} // Context에서 가져온 값
        weekId={scheduleStatus.week_id}
        isFinalized={scheduleStatus.is_finalized}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}

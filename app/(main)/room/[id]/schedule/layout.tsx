"use client";
import React, { useState } from "react";
import { useRoom } from "@/lib/RoomContext";
import TopBar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { roomId, isOwner, scheduleStatus, isLoading } = useRoom();

  if (isLoading) {
    return <div className="p-8 text-center">스케줄 정보 로딩 중...</div>;
  }

  return (
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
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

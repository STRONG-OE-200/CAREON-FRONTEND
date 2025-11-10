"use client";
import React, { useState } from "react";
import { RoomProvider, useRoom } from "@/lib/RoomContext";
import TopBar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

function ScheduleLayoutInner({ children }: { children: React.ReactNode }) {
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
        weekId={scheduleStatus.week_id} // Context에서 가져온 값
        isFinalized={scheduleStatus.is_finalized} // Context에서 가져온 값
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoomProvider>
      <ScheduleLayoutInner>{children}</ScheduleLayoutInner>
    </RoomProvider>
  );
}

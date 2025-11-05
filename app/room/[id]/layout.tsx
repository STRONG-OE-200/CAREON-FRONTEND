"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TopBar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const params = useParams(); //방 id 가져오기

  useEffect(() => {
    const ownerStatus = localStorage.getItem("isOwner");
    setIsOwner(ownerStatus === "true");

    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (id) {
      setRoomId(id);
    }
  }, [params.id]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isOwner={isOwner}
        roomId={roomId}
      />
      <main className="flex-1">
        {children} {/* <- 여기에 page.tsx (스케줄, 로그 등)가 들어옴 */}
      </main>
      <BottomNav />
    </div>
  );
}

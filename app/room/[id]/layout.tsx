"use client";
import React, { useState } from "react";
import TopBar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1">
        {children} {/* <- 여기에 page.tsx (스케줄, 로그 등)가 들어옴 */}
      </main>
      <BottomNav />
    </div>
  );
}

// app/room/[id]/layout.tsx

import BottomNav from "@/components/BottomNav";
import React from "react";

// 1. (★핵심★) Next.js가 params를 Promise로 줄 것을 대비해
//    props의 타입을 정확히 명시해줍니다.
type RoomLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>; // 'id'가 아니라 params *자체*가 Promise일 수 있음
};

// 2. (★핵심★) 함수를 'async'로 변경합니다.
export default async function RoomLayout({
  children,
  params, // 이제 이 params는 Promise일 수 있습니다.
}: RoomLayoutProps) {
  // 3. (★핵심★) 'await'로 params Promise를 '풀어줘서'
  //    실제 { id: '...' } 객체를 꺼냅니다.
  const resolvedParams = await params;
  const roomId = resolvedParams.id;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>

      {/* 4. 기다려서 얻은 roomId를 BottomNav에 전달 */}
      <BottomNav roomId={roomId} />
    </div>
  );
}

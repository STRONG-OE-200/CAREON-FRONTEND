import React, { use } from "react";
// import BottomNav from "@/components/BottomNav";

type RoomLayoutProps = {
  children: React.ReactNode;
  params: { id: string } | Promise<{ id: string }>;
};

export default function RoomLayout({ children, params }: RoomLayoutProps) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      {/* <BottomNav roomId={roomId} /> */}
    </div>
  );
}

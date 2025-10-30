import React from "react";
// import BottomNav from "@/components/BottomNav";

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const resolvedParams = await params;
  const roomId = resolvedParams.id;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      {/* <BottomNav roomId={roomId} /> */}
    </div>
  );
}

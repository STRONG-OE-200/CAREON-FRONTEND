// import BottomNav from "@/components/BottomNav";

export default function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const roomId = params.id;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      {/* <BottomNav roomId={roomId} /> */}
    </div>
  );
}

import { redirect } from "next/navigation";

export default async function RoomHomePage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  const roomId = resolvedParams.id;

  // /room/[id]/schedule 경로로 즉시 리다이렉트시킵니다.
  redirect(`/room/${roomId}/schedule`);

  return (
    <div>
      <p>스케줄 페이지로 이동 중...</p>
    </div>
  );
}

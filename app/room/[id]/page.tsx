//방 상세페이지 (메인)
//스케줄로 바로 리다이렉트시킴

import { redirect } from "next/navigation";

// 이 페이지는 서버에서 바로 리다이렉트 명령을 내립니다.
export default function RoomHomePage({ params }: { params: { id: string } }) {
  const roomId = params.id;

  // /room/[id]/schedule 경로로 즉시 리다이렉트시킵니다.
  redirect(`/room/${roomId}/schedule`);

  // 리다이렉트되므로 아래 부분은 실제로는 보이지 않습니다.
  return (
    <div>
      <p>스케줄 페이지로 이동 중...</p>
    </div>
  );
}

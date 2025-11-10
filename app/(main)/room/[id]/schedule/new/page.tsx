"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRoom } from "@/lib/RoomContext";

export default function NewSchedulePage() {
  const params = useParams(); // (예: { id: '13' })
  const roomId = params.id;
  const { scheduleStatus, isLoading } = useRoom();
  const week_id = scheduleStatus?.week_id;

  if (isLoading) {
    return <div className="p-4 text-center">스케줄 정보 확인 중...</div>;
  }

  return (
    <div className="p-4">
      <nav className="flex flex-col">
        <Link
          href={`/room/${roomId}/schedule/new/import`}
          className="py-4 border-b text-lg"
        >
          이전 스케줄 목록 불러오기
        </Link>
        <Link
          href={`/room/${roomId}/schedule/preview/${week_id}`}
          className="py-4 border-b text-lg"
        >
          임시저장된 시간표 보기
        </Link>
        <Link
          href={`/room/${roomId}/schedule/new/create`}
          className="py-4 border-b text-lg"
        >
          새로운 시간표 만들기
        </Link>
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewSchedulePage() {
  const params = useParams(); // (예: { id: '13' })
  const roomId = params.id;

  return (
    <div className="p-4">
      <nav className="flex flex-col">
        <Link
          href="#" // (나중에 기능 연결)
          className="py-4 border-b text-lg"
        >
          이전 스케줄 불러오기
        </Link>
        <Link
          href="#" // (나중에 기능 연결)
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

"use client";
import Link from "next/link";

export default function ScheduleCreatePage() {
  return (
    <>
      <div>
        <p>스케줄 생성하기</p>
      </div>
      <main>
        <Link href="">이전 스케줄 불러오기</Link>
        <Link href="../create/new/page.tsx">새로운 시간표 만들기</Link>
        <Link href="">시간표 생성 참여하기</Link>
      </main>
    </>
  );
}

import { Suspense } from "react";
import RoomCreateSuccessClient from "@/components/RoomCreateSuccessClient";

// "use client"가 없는 서버 컴포넌트입니다.
export default function RoomCreateSuccessPage() {
  return (
    // 1. Suspense로 클라이언트 컴포넌트를 감쌉니다.
    <Suspense fallback={<LoadingUI />}>
      <RoomCreateSuccessClient />
    </Suspense>
  );
}

// 2. Suspense가 기다리는 동안 보여줄 '로딩' 화면
function LoadingUI() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
      <h1 className="text-2xl font-bold">초대 코드 확인 중...</h1>
    </div>
  );
}

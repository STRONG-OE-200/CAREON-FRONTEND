import { Suspense } from "react";
import RoomCreateSuccessClient from "@/components/RoomCreateSuccessClient";

export default function RoomCreateSuccessPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <RoomCreateSuccessClient />
    </Suspense>
  );
}

function LoadingUI() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
      <h1 className="text-2xl font-bold">초대 코드 확인 중...</h1>
    </div>
  );
}

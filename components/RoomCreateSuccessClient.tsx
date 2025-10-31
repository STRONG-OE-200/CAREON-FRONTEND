"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";

export default function RoomCreateSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteCode = searchParams.get("code");
  const newRoomId = searchParams.get("id");

  const [copySuccess, setCopySuccess] = useState(false);

  //텍스트 복사 함수
  const handleCopyCode = async () => {
    if (!inviteCode) return;

    try {
      //텍스트 복사
      await navigator.clipboard.writeText(inviteCode);

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("클립보드 복사 실패", error);
      alert("코드 복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  return (
    <>
      <div>
        <h3>방 생성이 완료되었습니다!</h3>
        <p>팀원들에게 아래 환자 코드를 공유하세요.</p>
        <p>생성된 방에 입장하기 위해 환자 코드가 필요합니다.</p>
      </div>
      <main>
        <div>
          <span>{inviteCode || "생성된 환자 코드 없음"}</span>
          <Button onClick={handleCopyCode}>
            {copySuccess ? "✅ 복사 완료!" : "초대 코드 복사하기"}
          </Button>
        </div>
        {newRoomId && (
          <Button onClick={() => router.push(`/room/${newRoomId}/schedule`)}>
            방 입장하기
          </Button>
        )}
        {/* 메인으로 이동 */}
        <Link href="/">메인으로 가기</Link>
      </main>
    </>
  );
}

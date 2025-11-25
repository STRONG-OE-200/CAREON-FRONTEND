"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import { useAlert } from "@/lib/AlertContext";

export default function RoomCreateSuccessClient() {
  const { showAlert } = useAlert();
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
      showAlert("코드 복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  return (
    <>
      <h1 className="text-[22px] text-ex-purple font-medium text-center mt-7">
        돌봄온
      </h1>
      <div className="text-xl text-center font-light mt-[250px]">
        <h3>방 생성이 완료되었습니다!</h3>
        <p>팀원들에게 아래 환자 코드를 공유하세요.</p>
        <p>
          생성된 방에 입장하기 위해
          <br />
          환자 코드가 필요합니다.
        </p>
      </div>
      <main>
        <div className="flex justify-center items-center gap-5 py-10">
          <span>{inviteCode || "생성된 환자 코드 없음"}</span>
          <Button onClick={handleCopyCode} variant="secondary">
            {copySuccess ? "✅ 복사 완료!" : "초대 코드 복사하기"}
          </Button>
        </div>
        {newRoomId && (
          <Button
            onClick={() => {
              localStorage.setItem("currentRoomId", newRoomId);
              window.location.href = `/room/${newRoomId}/schedule`;
            }}
            className="flex justify-center w-85 rounded-[30px]"
          >
            방 입장하기
          </Button>
        )}
        <Link href="/" className="flex px-10 py-5 justify-end">
          메인으로 가기
        </Link>
      </main>
    </>
  );
}

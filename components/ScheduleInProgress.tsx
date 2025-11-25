"use client";
import { useRouter } from "next/navigation";
import Button from "./Button";

type Props = {
  isOwner: boolean;
  roomId: string;
  weekId: number;
  isFinalized: boolean;
};

export default function ScheduleInProgress({ isOwner, roomId, weekId }: Props) {
  const router = useRouter();

  return (
    <div className="p-8 text-center justify-center items-center flex flex-col gap-4 mt-10">
      <h2 className="text-xl">임시 스케줄이 생성되었습니다.</h2>
      <p className="font-light">간병 가능한 시간대를 선택해주세요</p>
      <Button
        variant="secondary"
        className="w-48"
        onClick={() =>
          router.push(`/room/${roomId}/schedule/participate/${weekId}`)
        }
      >
        시간표 생성 참여하기
      </Button>

      {/* 방장한테만 */}
      {isOwner && (
        <>
          <p className="font-light text-gray-600">
            팀원들이 참여 중입니다.
            <br />
            시간표를 확인하고 확정해주세요.
          </p>
          <Button
            variant="secondary"
            className="w-48"
            onClick={() => {
              router.push(`/room/${roomId}/schedule/preview/${weekId}`);
            }}
          >
            임시 시간표 보기
          </Button>
        </>
      )}
    </div>
  );
}

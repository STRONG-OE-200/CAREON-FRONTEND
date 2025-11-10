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
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold mb-4">임시 스케줄이 생성되었습니다.</h2>
      <p>간병 가능한 시간대를 선택해주세요</p>
      <Button
        onClick={() =>
          router.push(`/room/${roomId}/schedule/participate/${weekId}`)
        }
      >
        시간표 생성 참여하기
      </Button>

      {/* 방장한테만 */}
      {isOwner && (
        <>
          <p className="text-gray-600 mb-6">
            팀원들이 참여 중입니다.
            <br />
            시간표를 확인하고 확정해주세요.
          </p>
          <Button
            variant="primary"
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

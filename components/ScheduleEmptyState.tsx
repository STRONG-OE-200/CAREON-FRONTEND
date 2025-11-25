"use client";
import Button from "./Button";

type Props = {
  isOwner: boolean;
  onScheduleCreateClick: () => void;
  weekId: number | null;
  isFinalized: boolean;
  roomId: string;
};

export default function ScheduleEmptyState({
  onScheduleCreateClick,
  isOwner,
}: Props) {
  return (
    <div className="my-[200px] flex flex-col items-center justify-center text-center gap-5 font-light text-lg">
      {isOwner ? (
        <>
          <p>
            현재 만들어진 스케줄이 없어요
            <br />
            스케줄을 만들어주세요
          </p>
          <Button
            variant="secondary"
            className="w-48"
            onClick={onScheduleCreateClick}
          >
            스케줄 생성하기
          </Button>
        </>
      ) : (
        <p>
          현재 만들어진 스케줄이 없어요
          <br />
          방장이 스케줄을 생성하길 기다려주세요!
        </p>
      )}
    </div>
  );
}

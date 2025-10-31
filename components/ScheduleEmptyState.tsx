"use client";
import Button from "./Button";

type Props = {
  onScheduleCreateClick: () => void;
  isOwner: boolean;
};

export default function ScheduleEmptyState({
  onScheduleCreateClick,
  isOwner,
}: Props) {
  return (
    <div>
      {isOwner ? (
        <>
          <p>
            현재 만들어진 스케줄이 없어요
            <br />
            스케줄을 만들어주세요
          </p>
          <Button onClick={onScheduleCreateClick}>스케줄 생성하기</Button>
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

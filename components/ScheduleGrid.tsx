"use client";
import React from "react";

type Member = {
  id: number;
  name: string;
};
type CellData = {
  isCareNeeded: boolean;
  availableMembers: Member[];
  confirmedMember: Member | null;
};
type GridProps = {
  masterGrid: CellData[][];
  myUserId: string;
  isOwner: boolean;
  isFinalized: boolean; // (true: 확정, false: 미리보기)
  onCellClick: (day: number, hour: number, cell: CellData) => void;
  memberColorMap: Record<number, string>; // (멤버 ID와 색상 맵)
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CONFLICT_COLORS = [
  "#C8CAFA", // 1명
  "#9CA0F5", // 2명
  "#767AF0", // 3명
  "#5C61EA", // 4명 이상
];

//메인 컴포넌트
export default function ScheduleGrid({
  masterGrid,
  myUserId,
  isOwner,
  isFinalized,
  onCellClick,
  memberColorMap,
}: GridProps) {
  const getCellDisplayData = (cell: CellData) => {
    // 1. [확정된 상태] (SchedulePage용 로직)
    if (isFinalized) {
      if (cell.confirmedMember) {
        return {
          // 1-1. 확정된 멤버의 색상
          backgroundColor: memberColorMap[cell.confirmedMember.id] || "#E0E0E0", // (회색)
          // 1-2. 확정된 멤버의 이름
          content: cell.confirmedMember.name,
        };
      } else {
        // 1-3. 확정됐지만, 배정 안 됨 (흰색)
        return { backgroundColor: "#FFFFFF", content: null };
      }
    }

    // 2. [진행 중 상태] (PreviewPage용 로직)
    if (cell.confirmedMember) {
      return {
        backgroundColor: memberColorMap[cell.confirmedMember.id] || "#E0E0E0",
        content: cell.confirmedMember.name,
      };
    }
    if (!cell.isCareNeeded) {
      return { backgroundColor: "#FFFFFF", content: null };
    }
    const count = cell.availableMembers.length;
    if (count === 0) return { backgroundColor: "#BFBFBF", content: null }; // (빈 필요시간)
    if (count === 1)
      return {
        backgroundColor: CONFLICT_COLORS[0],
        content: cell.availableMembers[0].name,
      };
    if (count === 2)
      return { backgroundColor: CONFLICT_COLORS[1], content: "2명" };
    if (count === 3)
      return { backgroundColor: CONFLICT_COLORS[2], content: "3명" };
    return { backgroundColor: CONFLICT_COLORS[3], content: `${count}명` };
  };

  //렌더링
  return (
    <div>
      <div className="grid grid-cols-8 gap-1 rounded-lg shadow-md">
        {/* 요일 헤더 */}
        <div className="w-5" />
        {DAYS.map((day) => (
          <div key={day} className="text-center font-semibold text-xs py-2">
            {day}
          </div>
        ))}

        {/* 시간 및 그리드 셀 */}
        {HOURS.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            <div className="text-xs text-right text-gray-500 h-8 w-5">
              {hour}
            </div>
            {DAYS.map((day, dayIndex) => {
              if (!masterGrid[dayIndex]) return null;
              const cell = masterGrid[dayIndex][hourIndex];
              if (!cell) return null;

              const { backgroundColor, content } = getCellDisplayData(cell);

              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => onCellClick(dayIndex, hourIndex, cell)}
                  style={{ backgroundColor: backgroundColor }}
                  title={content || ""}
                  className="border h-8 text-xs text-center leading-8 overflow-hidden text-ellipsis whitespace-nowrap px-1"
                >
                  {content}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

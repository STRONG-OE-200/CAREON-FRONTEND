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
  isFinalized: boolean; //
  onCellClick: (day: number, hour: number, cell: CellData) => void;
  memberColorMap: Record<number, string>; //
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

//메인 컴포넌트
export default function ScheduleGrid({
  masterGrid,
  myUserId,
  isOwner,
  isFinalized,
  onCellClick,
  memberColorMap, //
}: GridProps) {
  const getCellDisplayData = (cell: CellData) => {
    // 1. [확정된 상태] (isFinalized: true)
    if (isFinalized) {
      if (cell.confirmedMember) {
        return {
          backgroundColor: memberColorMap[cell.confirmedMember.id] || "#E0E0E0", // (회색)
          content: cell.confirmedMember.name,
        };
      } else {
        return { backgroundColor: "#FFFFFF", content: null };
      }
    }

    // 2. [진행 중 상태] (isFinalized: false)
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
    if (count === 0) return { backgroundColor: "#BFBFBF", content: null };
    if (count === 1)
      return {
        backgroundColor: "#C8CAFA",
        content: cell.availableMembers[0].name,
      };
    if (count === 2) return { backgroundColor: "#9CA0F5", content: "2명" };
    if (count === 3) return { backgroundColor: "#767AF0", content: "3명" };
    return { backgroundColor: "#5C61EA", content: `${count}명` };
  };

  //리턴
  return (
    <div className="grid grid-cols-8 gap-1 p-4 bg-white rounded-lg shadow-md">
      <div />
      {DAYS.map((day) => (
        <div key={day} className="text-center font-semibold text-xs py-2">
          {day}
        </div>
      ))}

      {HOURS.map((hour, hourIndex) => (
        <React.Fragment key={hour}>
          <div className="text-xs text-right text-gray-500 pr-1 h-8">
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
                className="border h-8 w-full text-xs text-center leading-8 overflow-hidden text-ellipsis whitespace-nowrap px-1"
              >
                {content}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

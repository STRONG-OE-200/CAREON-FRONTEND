"use client";
import React from "react";

type GridProps = {
  gridData: number[][];
  highlightColor?: string;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ReadOnlyScheduleGrid({
  gridData,
  highlightColor = "#F5F5F5", // 기본값을 회색으로
}: GridProps) {
  return (
    <div className="overflow-x-auto">
      {" "}
      {/* 폰에서 가로 스크롤 */}
      <div className="grid grid-cols-8 gap-1 p-4 rounded-lg shadow-md min-w-[424px]">
        {/* 요일 헤더 */}
        <div className="w-8" />
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-xs py-2 min-w-[56px]"
          >
            {day}
          </div>
        ))}

        {/* 시간 및 그리드 셀 */}
        {HOURS.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            <div className="text-xs text-right text-gray-500 pr-1 h-8 w-8">
              {hour}
            </div>
            {DAYS.map((day, dayIndex) => {
              if (!gridData[dayIndex]) return null;

              const isSelected = gridData[dayIndex][hourIndex] === 1;

              return (
                <div
                  key={`${day}-${hour}`}
                  style={{
                    backgroundColor: isSelected ? highlightColor : "#FFFFFF",
                  }}
                  className="border h-8 min-w-[56px]"
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // [0, 1, 2, ... 23]

const createEmptySchedule = () =>
  Array.from({ length: 7 }, () => Array(24).fill(0));

export default function ScheduleGrid() {
  const [mySchedule, setMySchedule] = useState(createEmptySchedule());

  const handleCellClick = (dayIndex: number, hourIndex: number) => {
    //실제거 건들이지 않고 복사해와서
    const newSchedule = mySchedule.map((day) => [...day]);
    //선택따라 0,1 토글
    newSchedule[dayIndex][hourIndex] =
      mySchedule[dayIndex][hourIndex] === 0 ? 1 : 0;
    //새로운 배열로 교체
    setMySchedule(newSchedule);
  };

  return (
    //전체
    <div>
      {/* 그리드 */}
      <div className="grid grid-cols-8">
        {/* 요일 헤더 */}
        <div />
        {DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
        {/* 시간표 */}
        {HOURS.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            {/* 시간안내 */}
            <div>{hour}:00</div>
            {/* 시간 선택 */}
            {DAYS.map((day, dayIndex) => {
              const isSelected = mySchedule[dayIndex][hourIndex] === 1;

              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => handleCellClick(dayIndex, hourIndex)}
                  className={`border h-8 w-full cursor-pointer transition-colors duration-100 ${
                    isSelected ? "bg-blue-500" : "bg-white hover:bg-gray-100"
                  }`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

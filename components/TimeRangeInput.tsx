"use client";
import React, { useState } from "react";
import Button from "./Button";

const DAYS_OF_WEEK = [
  { label: "일", value: 0 },
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
  { label: "토", value: 6 },
];
const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => ({
  label: `${i}:00`,
  value: i,
}));

type Props = {
  // "추가" 버튼 클릭 시 호출될 함수
  onAddTimeRange: (day: number, start: number, end: number) => boolean;
  // (나중에 ParticipatePage에서 사용할 '필터링' prop - 지금은 비워둠)
  // availableHours?: Record<number, number[]>; // { 0: [9, 10], 1: [11, 12] }
};

export default function TimeRangeInput({ onAddTimeRange }: Props) {
  const [selectedDay, setSelectedDay] = useState(0); // 기본값 "월"
  const [startTime, setStartTime] = useState(0); // 기본값 "9:00"
  const [endTime, setEndTime] = useState(1); // 기본값 "17:00"

  const [error, setError] = useState("");

  const handleAddClick = () => {
    if (startTime >= endTime) {
      setError("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }
    setError("");

    const success = onAddTimeRange(selectedDay, startTime, endTime);
    if (!success) {
      setError("방장이 요청한 필요 시간과 겹치지 않습니다.");
    }
  };

  return (
    <div className="w-full p-4 bg-gray-100 border-t shadow-md">
      <div className="flex items-center gap-2">
        {/* 요일 선택 */}
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          className="p-2 border rounded-md"
        >
          {DAYS_OF_WEEK.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>

        {/* 시작 시간 */}
        <select
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
          className="p-2 border rounded-md"
        >
          {HOURS_OF_DAY.map((hour) => (
            <option key={hour.value} value={hour.value}>
              {hour.label}
            </option>
          ))}
        </select>

        <span>~</span>

        {/* 종료 시간 */}
        <select
          value={endTime}
          onChange={(e) => setEndTime(Number(e.target.value))}
          className="p-2 border rounded-md"
        >
          {/* (종료 시간은 1시~24시(다음날 0시)로 표시) */}
          {HOURS_OF_DAY.map((hour) => (
            <option key={hour.value + 1} value={hour.value + 1}>
              {hour.value + 1}:00
            </option>
          ))}
          <option value={24}>24:00</option>
        </select>

        {/* 추가 버튼 */}
        <Button variant="primary" onClick={handleAddClick} className="!p-3">
          +
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

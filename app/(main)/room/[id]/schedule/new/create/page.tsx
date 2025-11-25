"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api";
import TimeRangeInput from "@/components/TimeRangeInput";
import { useAlert } from "@/lib/AlertContext";

function getWeekData() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(new Date().setDate(today.getDate() - dayOfWeek));
  const formatDate = (date: Date) =>
    `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;
  const y = startOfWeek.getFullYear();
  const m = (startOfWeek.getMonth() + 1).toString().padStart(2, "0");
  const d = startOfWeek.getDate().toString().padStart(2, "0");
  const apiWeekStart = `${y}-${m}-${d}`;
  return {
    displayRange: `${formatDate(startOfWeek)} - ${formatDate(
      new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    )}`,
    apiWeekStart: apiWeekStart,
  };
}

// (예: [{day: 1, start: 9, end: 11}] -> [{day: 1, hour: 9}, {day: 1, hour: 10}])
const convertRangesToCells = (ranges: TimeRange[]) => {
  const cells: { day: number; hour: number }[] = [];
  ranges.forEach((range) => {
    for (let hour = range.start; hour < range.end; hour++) {
      // 중복 방지 체크
      if (!cells.some((cell) => cell.day === range.day && cell.hour === hour)) {
        cells.push({ day: range.day, hour: hour });
      }
    }
  });
  return cells;
};

const DAY_MAP = ["일", "월", "화", "수", "목", "금", "토"];

type TimeRange = {
  day: number;
  start: number;
  end: number;
};

// 메인 컴포넌트
export default function CreateNewSchedulePage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [error, setError] = useState("");
  const [weekData] = useState(getWeekData());

  const handleAddTimeRange = (day: number, start: number, end: number) => {
    setTimeRanges((prevRanges) => [...prevRanges, { day, start, end }]);
    return true; // (Create 페이지는 항상 성공)
  };

  const handleDeleteTimeRange = (indexToDelete: number) => {
    setTimeRanges((prevRanges) =>
      prevRanges.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleSubmit = async () => {
    setError("");
    const numericRoomId = parseInt(roomId);
    if (isNaN(numericRoomId)) {
      setError(`방 ID가 잘못되었습니다. (현재 값: ${roomId})`);
      return;
    }
    const payload = {
      room_id: numericRoomId,
      start_date: weekData.apiWeekStart,
    };
    try {
      const createResponse = await api.post("/schedules/", payload);
      const week_id = createResponse.data.schedule_id;
      if (!week_id) {
        setError("스케줄 껍데기 생성은 되었으나 ID를 받지 못했습니다.");
        return;
      }

      const cellsToSubmit = convertRangesToCells(timeRanges);

      if (cellsToSubmit.length === 0) {
        setError("간병이 필요한 시간대를 1칸 이상 선택해야 합니다.");
        return;
      }

      await api.post(`/schedules/${week_id}/needed/`, { slots: cellsToSubmit });

      showAlert("새 스케줄이 생성되었습니다.");
      router.push(`/room/${roomId}/schedule`);
    } catch (err: any) {
      //에러 핸들링
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-auto pb-40">
        <div className="p-4 flex-shrink-0">
          <p className="text-center text-gray-700 mb-2">
            <span className="font-bold">간병 필요 시간대</span>를 등록해주세요
          </p>
          <p className="text-center text-sm text-gray-500">
            이번주 ({weekData.displayRange})
          </p>
        </div>
        <div className="p-4 space-y-2">
          {timeRanges.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              하단 입력창으로 시간대를 추가하세요.
            </p>
          ) : (
            timeRanges.map((range, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white rounded-2xl shadow-sm"
              >
                <span className="font-semibold text-gray-800">
                  {`${DAY_MAP[range.day]}요일 ${range.start}:00 - ${
                    range.end
                  }:00`}
                </span>
                <Button
                  onClick={() => handleDeleteTimeRange(index)}
                  className="!px-2 !py-1"
                  variant="secondary"
                >
                  삭제
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-20 w-full">
        <TimeRangeInput onAddTimeRange={handleAddTimeRange} />
        <div className="p-4">
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <Button variant="primary" onClick={handleSubmit} className="w-full">
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

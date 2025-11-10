"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const createEmptySchedule = () =>
  Array.from({ length: 7 }, () => Array(24).fill(0));

const convertGridToCells = (grid: number[][]) => {
  const cells: { day: number; hour: number }[] = [];
  grid.forEach((hours, dayIndex) => {
    hours.forEach((isSelected, hourIndex) => {
      if (isSelected === 1) {
        cells.push({ day: dayIndex, hour: hourIndex });
      }
    });
  });
  return cells;
};

// 헬퍼 함수: 날짜 계산
function getWeekData() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = 일요일, 1 = 월요일 ...

  // 이번 주 일요일 날짜 계산
  const startOfWeek = new Date(new Date().setDate(today.getDate() - dayOfWeek));
  // 이번 주 토요일 날짜 계산
  const endOfWeek = new Date(new Date().setDate(startOfWeek.getDate() + 6));

  const formatDate = (date: Date) =>
    `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;

  // API 전송용 'YYYY-MM-DD' 형식
  const y = startOfWeek.getFullYear();
  const m = (startOfWeek.getMonth() + 1).toString().padStart(2, "0");
  const d = startOfWeek.getDate().toString().padStart(2, "0");
  const apiWeekStart = `${y}-${m}-${d}`;

  return {
    displayRange: `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`,
    apiWeekStart: apiWeekStart, // 예: "2025-11-02"
  };
}

// 메인 컴포넌트
export default function CreateNewSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [careNeededSchedule, setCareNeededSchedule] = useState(
    createEmptySchedule()
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const [weekData] = useState(getWeekData());

  const handleCellClick = (dayIndex: number, hourIndex: number) => {
    const newSchedule = careNeededSchedule.map((day) => [...day]);
    newSchedule[dayIndex][hourIndex] =
      careNeededSchedule[dayIndex][hourIndex] === 0 ? 1 : 0;
    setCareNeededSchedule(newSchedule);
  };
  const handleMouseDown = (dayIndex: number, hourIndex: number) => {
    setIsDragging(true);
    handleCellClick(dayIndex, hourIndex);
  };
  const handleMouseOver = (dayIndex: number, hourIndex: number) => {
    if (isDragging) {
      const newSchedule = careNeededSchedule.map((day) => [...day]);
      newSchedule[dayIndex][hourIndex] = 1;
      setCareNeededSchedule(newSchedule);
    }
  };
  const handleMouseUp = () => setIsDragging(false);

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
    console.log("백엔드로 전송할 데이터 (Body):", payload);

    try {
      const createResponse = await api.post("/schedules/", payload);

      const createData = createResponse.data;

      const week_id = createData.schedule_id;

      if (!week_id) {
        setError("스케줄 껍데기 생성은 되었으나 ID를 받지 못했습니다.");
        return;
      }

      const cellsToSubmit = convertGridToCells(careNeededSchedule);

      if (cellsToSubmit.length === 0) {
        setError("간병이 필요한 시간대를 1칸 이상 선택해야 합니다.");
        return;
      }

      const updateResponse = await api.post(`/schedules/${week_id}/needed/`, {
        slots: cellsToSubmit,
      });

      alert("새 스케줄이 생성되었습니다.");
      window.location.href = `/room/${roomId}/schedule`;
    } catch (err: any) {
      console.error("API 오류 발생:", err);

      if (err.response) {
        const errorData = err.response.data;
        console.error("서버 응답 에러:", err.response.status, errorData);

        let message =
          errorData.detail ||
          (errorData.slots ? `Slots 오류: ${errorData.slots[0]}` : null) ||
          (errorData.start_date
            ? `날짜 오류: ${errorData.start_date[0]}`
            : null) ||
          "알 수 없는 서버 오류입니다.";

        setError(message);
      } else if (err.request) {
        setError("서버에서 응답이 없습니다. 네트워크를 확인해주세요.");
      } else {
        setError(`네트워크 오류가 발생했습니다: ${err.message}`);
      }
    }
  };

  // --- 렌더링 ---
  return (
    <div className="p-4">
      <p className="text-center text-gray-700 mb-4">
        <span className="font-bold">간병 필요 시간대</span>를 선택해주세요
      </p>

      <div
        className="grid grid-cols-8 gap-1 p-4 bg-white rounded-lg shadow-md"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
              const isSelected = careNeededSchedule[dayIndex][hourIndex] === 1;
              return (
                <div
                  key={`${day}-${hour}`}
                  onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                  onMouseOver={() => handleMouseOver(dayIndex, hourIndex)}
                  className={`border h-8 w-full cursor-pointer
                    ${isSelected ? "bg-gray-400" : "bg-white hover:bg-gray-300"}
                  `}
                  onDragStart={(e) => e.preventDefault()}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          이번주 ({weekData.displayRange})
        </span>
        <Button variant="primary" onClick={handleSubmit}>
          저장
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api"; // 1. (★수정★) fetch 대신 api.ts를 import

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// 7x24 배열
const createEmptySchedule = () =>
  Array.from({ length: 7 }, () => Array(24).fill(0));

// (convertGridToCells 함수는 이전과 동일)
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

// (getWeekData 함수는 이전과 동일)
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

//-----------
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

  // (그리드 로직 4개 함수는 이전과 동일)
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

  // 2. (★핵심 수정★) handleSubmit 함수를 axios에 맞게 수정
  const handleSubmit = async () => {
    setError("");

    // (localStorage.getItem("token") 확인 로직 삭제 -> api.ts가 자동으로 처리)

    const numericRoomId = parseInt(roomId);
    if (isNaN(numericRoomId)) {
      setError(`방 ID가 잘못되었습니다. (현재 값: ${roomId})`);
      return;
    }

    const payload = {
      room_id: numericRoomId,
      week_start: weekData.apiWeekStart,
    };
    console.log("백엔드로 전송할 데이터 (Body):", payload);

    try {
      // --- 1단계: '주간 스케줄 껍데기' 생성 (POST /schedules/) ---
      // (headers, credentials, method가 모두 자동으로 적용됨)
      const createResponse = await api.post("/schedules/", payload);

      // (axios는 201(성공)이 아니면 'catch'로 바로 빠지므로 'if'문 삭제)
      const createData = createResponse.data; // .json() 필요 없음
      const week_id = createData.id;

      // --- 2단계: '간병 필요 시간' 등록 (PUT /schedules/{week_id}/needed/) ---
      const cellsToUpdate = convertGridToCells(careNeededSchedule);

      const updateResponse = await api.put(
        `/schedules/${week_id}/needed/`,
        { cells: cellsToUpdate } // body
      );

      // (axios는 200(성공)이 아니면 'catch'로 바로 빠지므로 'if'문 삭제)

      // --- 3단계: 최종 성공 ---
      alert("새 스케줄이 생성되었습니다.");
      router.push(`/room/${roomId}/schedule`); // 스케줄 메인 페이지로 복귀
    } catch (err: any) {
      // 3. (★핵심 수정★) axios의 통합 에러 핸들링
      console.error("API 오류 발생:", err);

      if (err.response) {
        // 서버가 400, 401, 403, 404, 409, 500 등 에러 응답을 한 경우
        const errorData = err.response.data;
        console.error("서버 응답 에러:", err.response.status, errorData);

        // API 명세서에 나온 'detail' 또는 'non_field_errors'
        const message =
          errorData.detail ||
          (errorData.non_field_errors ? errorData.non_field_errors[0] : null) ||
          "알 수 없는 서버 오류입니다.";
        setError(message);
      } else if (err.request) {
        // 요청은 했으나 응답을 못 받은 경우 (e.g., 네트워크 오류)
        setError("서버에서 응답이 없습니다. 네트워크를 확인해주세요.");
      } else {
        // 요청을 설정하는 중에 에러가 난 경우
        setError(`네트워크 오류가 발생했습니다: ${err.message}`);
      }
    }
  };

  // (return JSX 부분은 이전과 100% 동일)
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

      {/* 하단 UI  */}
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

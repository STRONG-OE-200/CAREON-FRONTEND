"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api";
import { MEMBER_COLORS } from "@/lib/colors";

const colorsArray = Object.values(MEMBER_COLORS);
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

//메인 컴포넌트
export default function ParticipatePage() {
  const router = useRouter();
  const params = useParams();

  const roomId = params.id as string;
  const weekId = params.week_id as string;

  const [neededSchedule, setNeededSchedule] = useState(createEmptySchedule());
  const [mySchedule, setMySchedule] = useState(createEmptySchedule());
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [myColor, setMyColor] = useState("#FFFFFF");

  useEffect(() => {
    const colorIndexStr = localStorage.getItem("myIndex");
    const colorIndex = parseInt(colorIndexStr || "0", 10);
    const color = colorsArray[colorIndex % colorsArray.length];
    setMyColor(`#${color}`);

    const myUserId = localStorage.getItem("myUserId");

    if (!weekId || !roomId || !myUserId) {
      setError("필수 정보(방 ID, 주간 ID, 유저 ID)가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchGrids = async () => {
      try {
        const response = await api.get(
          `/schedules/?room_id=${roomId}&week_id=${weekId}`
        );

        const fullGrid = response.data.masterGrid;

        if (!Array.isArray(fullGrid)) {
          console.error("API 응답이 그리드 배열이 아닙니다:", response.data);
          setError("스케줄 데이터 형식이 올바르지 않습니다.");
          setIsLoading(false);
          return;
        }

        const neededGrid = createEmptySchedule();
        const myGrid = createEmptySchedule();
        let hasParticipated = false;

        fullGrid.forEach((day: any[], dayIndex: number) => {
          day.forEach((cell: any, hourIndex: number) => {
            if (cell.isCareNeeded) {
              neededGrid[dayIndex][hourIndex] = 1;
            }
            const amIAvailable = cell.availableMembers.some(
              (member: any) => member.id.toString() === myUserId
            );
            const amIConfirmed =
              cell.confirmedMember?.id.toString() === myUserId;

            if (amIAvailable || amIConfirmed) {
              myGrid[dayIndex][hourIndex] = 1;
              hasParticipated = true;
            }
          });
        });

        setNeededSchedule(neededGrid);
        setMySchedule(myGrid);
        setHasAlreadyParticipated(hasParticipated);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError("스케줄을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrids();
  }, [weekId, roomId]);

  const handleCellClick = (dayIndex: number, hourIndex: number) => {
    if (hasAlreadyParticipated) {
      alert("이미 시간을 저장했습니다. 수정할 수 없습니다.");
      return;
    }
    if (neededSchedule[dayIndex][hourIndex] === 0) {
      return;
    }
    const newSchedule = mySchedule.map((day) => [...day]);
    newSchedule[dayIndex][hourIndex] =
      mySchedule[dayIndex][hourIndex] === 0 ? 1 : 0;
    setMySchedule(newSchedule);
  };

  const handleSubmit = async () => {
    if (hasAlreadyParticipated) {
      alert("이미 시간을 저장했습니다.");
      return;
    }
    setError("");
    try {
      const cellsToSubmit = convertGridToCells(mySchedule);

      if (cellsToSubmit.length === 0) {
        setError("간병 가능한 시간대를 1칸 이상 선택해야 합니다.");
        return;
      }

      await api.post(`/schedules/${weekId}/availability/`, {
        slots: cellsToSubmit,
      });

      alert("내 시간이 저장되었습니다.");
      setHasAlreadyParticipated(true);
      router.push(`/room/${roomId}/schedule`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "저장에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">스케줄을 불러오는 중...</div>;
  }

  return (
    <div className="p-4">
      <p className="text-center text-gray-700 mb-4">
        {hasAlreadyParticipated
          ? "내가 선택한 시간표입니다."
          : "간병 가능한 시간대를 선택해주세요"}
      </p>

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
              const isNeeded = neededSchedule[dayIndex][hourIndex] === 1;
              const isMySelection = mySchedule[dayIndex][hourIndex] === 1;
              const isClickable = isNeeded && !hasAlreadyParticipated;

              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => handleCellClick(dayIndex, hourIndex)}
                  style={{
                    backgroundColor: isMySelection
                      ? myColor
                      : isNeeded
                      ? "#BFBFBF" // 회색 (간병 필요)
                      : "#FFFFFF",
                  }}
                  className={`border h-8 w-full
                    ${
                      isClickable
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"
                    }
                  `}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="flex justify-end items-center mt-4">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={hasAlreadyParticipated}
        >
          {hasAlreadyParticipated ? "저장 완료" : "내 시간 저장하기"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}

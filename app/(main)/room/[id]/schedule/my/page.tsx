"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRoom } from "@/lib/RoomContext";
import api from "@/lib/api";
import { MEMBER_COLORS } from "@/lib/colors";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MEMBER_COLOR_ARRAY = Object.values(MEMBER_COLORS);

type Member = {
  id: number;
  name: string;
};
type CellData = {
  isCareNeeded: boolean;
  availableMembers: Member[];
  confirmedMember: Member | null;
};
type FullGrid = CellData[][];

function LoadingSpinner() {
  return <div className="p-8 text-center">스케줄 불러오는 중...</div>;
}

//메인 컴포넌트
export default function MySchedulePage() {
  const params = useParams();
  const { roomId, scheduleStatus, isLoading: isContextLoading } = useRoom();
  const { week_id, is_finalized } = scheduleStatus;
  const [myScheduleGrid, setMyScheduleGrid] = useState<FullGrid | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<string>("#FFFFFF");
  const [isGridLoading, setIsGridLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("myUserId");
    const colorIndexStr = localStorage.getItem("myIndex");
    const colorIndex = parseInt(colorIndexStr || "0", 10);

    setMyUserId(userId);
    setMyColor(
      `#${MEMBER_COLOR_ARRAY[colorIndex % MEMBER_COLOR_ARRAY.length]}`
    );

    //확정스케줄 가져옴
    if (is_finalized && roomId && week_id) {
      const fetchFinalizedGrid = async () => {
        setIsGridLoading(true);
        try {
          const response = await api.get(
            `/schedules?room_id=${roomId}&schedule_id=${week_id}`
          );
          setMyScheduleGrid(response.data.masterGrid);
        } catch (err) {
          console.error("확정 스케줄 로드 실패:", err);
        } finally {
          setIsGridLoading(false);
        }
      };
      fetchFinalizedGrid();
    } else {
      setIsGridLoading(false); // 확정 스케줄이 없으면 로딩 끝
    }
  }, [is_finalized, roomId, week_id]);

  //렌더링
  if (isContextLoading || isGridLoading) {
    return <LoadingSpinner />;
  }

  if (!is_finalized || !myScheduleGrid) {
    return (
      <div className="p-8 text-center">아직 확정된 스케줄이 없습니다.</div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">
        이번주 나의 시간표
      </h2>

      <div className="grid grid-cols-8 gap-1 p-4 rounded-lg shadow-md">
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
              const cell = myScheduleGrid[dayIndex][hourIndex];
              if (!cell) return null;

              let backgroundColor = "#FFFFFF";
              const isMyCell = cell.confirmedMember?.id.toString() === myUserId;

              if (isMyCell) {
                backgroundColor = myColor;
              } else if (cell.confirmedMember) {
                backgroundColor = "#BFBFBF";
              }

              return (
                <div
                  key={`${day}-${hour}`}
                  style={{ backgroundColor: backgroundColor }}
                  className="border h-8 w-full"
                >
                  {/* 이름은 표시하지 않음 */}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

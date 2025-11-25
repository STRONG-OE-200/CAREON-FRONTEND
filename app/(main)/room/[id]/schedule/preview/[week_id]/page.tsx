"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { MEMBER_COLORS } from "@/lib/colors";
import { useAlert } from "@/lib/AlertContext";

type Member = {
  id: number;
  name: string;
  membership_index: number;
};
type CellData = {
  isCareNeeded: boolean;
  availableMembers: Member[];
  confirmedMember: Member | null;
};
type FullGrid = CellData[][];
type SubmissionStatus = {
  id: number;
  name: string;
  submitted: boolean;
  submitted_at: string | null;
  slots: number | null;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MEMBER_COLOR_ARRAY = Object.values(MEMBER_COLORS);
const CONFLICT_COLORS = ["#C8CAFA", "#9CA0F5", "#767AF0", "#5C61EA"];

//메인 컴포넌트
export default function PreviewPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const weekId = params.week_id as string;

  const [scheduleGrid, setScheduleGrid] = useState<FullGrid | null>(null);
  const [memberColorMap, setMemberColorMap] = useState<Record<number, string>>(
    {}
  );
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState<{
    day: number;
    hour: number;
    cell: CellData;
  } | null>(null);

  useEffect(() => {
    if (!weekId || !roomId) {
      setIsLoading(false);
      setError("방 ID 또는 스케줄 ID가 없습니다.");
      return;
    }
    const fetchData = async () => {
      try {
        const [scheduleRes, membersRes, statusRes] = await Promise.all([
          api.get(`/schedules?room_id=${roomId}&schedule_id=${weekId}`),
          api.get(`/rooms/${roomId}/members/`),
          api.get(`/schedules/${weekId}/availability/members/`),
        ]);

        const grid: FullGrid = scheduleRes.data.masterGrid;
        const members: any[] = membersRes.data;
        const statusList: SubmissionStatus[] = statusRes.data.members;

        const colorMap: Record<number, string> = {};
        members.forEach((member) => {
          const colorIndex = member.membership_index || 0;
          colorMap[member.user_id] = `#${
            MEMBER_COLOR_ARRAY[colorIndex % MEMBER_COLOR_ARRAY.length]
          }`;
        });

        setScheduleGrid(grid);
        setMemberColorMap(colorMap);
        setSubmissionStatus(statusList);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError("스케줄 현황을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [weekId, roomId]);

  const getCellStyle = (cell: CellData) => {
    if (cell.confirmedMember) {
      return {
        backgroundColor: CONFLICT_COLORS[0] || "#E0E0E0",
        color: "#000000",
      };
    }
    if (!cell.isCareNeeded) {
      return { backgroundColor: "#FFFFFF" };
    }

    const count = cell.availableMembers.length;

    if (count === 0) {
      return { backgroundColor: "#BFBFBF", cursor: "not-allowed" };
    }

    let color = CONFLICT_COLORS[0];
    if (count === 2) color = CONFLICT_COLORS[1];
    if (count === 3) color = CONFLICT_COLORS[2];
    if (count >= 4) color = CONFLICT_COLORS[3];

    return { backgroundColor: color, cursor: "pointer" };
  };

  const handleCellClick = (day: number, hour: number, cell: CellData) => {
    if (
      cell.confirmedMember ||
      !cell.isCareNeeded ||
      cell.availableMembers.length <= 1
    ) {
      return;
    }
    setSelectedCellData({ day, hour, cell });
    setIsModalOpen(true);
  };

  const handleSelectMember = (member: Member) => {
    if (!scheduleGrid || !selectedCellData) return;
    const { day, hour } = selectedCellData;
    const newGrid: FullGrid = scheduleGrid.map((dayRow) =>
      dayRow.map((cell) => ({
        ...cell,
        availableMembers: [...cell.availableMembers],
      }))
    );
    newGrid[day][hour].confirmedMember = member;
    setScheduleGrid(newGrid);
    setIsModalOpen(false);
    setSelectedCellData(null);
  };

  const handleSubmitFinalize = async () => {
    if (!scheduleGrid) return;
    setError("");
    setIsSubmitting(true);
    try {
      const assignments: { day: number; hour: number; assignee_id: number }[] =
        [];
      scheduleGrid.forEach((dayRow, dayIndex) => {
        dayRow.forEach((cell, hourIndex) => {
          if (cell.confirmedMember && cell.availableMembers.length > 1) {
            assignments.push({
              day: dayIndex,
              hour: hourIndex,
              assignee_id: cell.confirmedMember.id,
            });
          }
        });
      });
      await api.post(`/schedules/${weekId}/finalize/`, {
        assignments: assignments,
      });
      showAlert("스케줄이 최종 확정되었습니다.");
      window.location.href = `/room/${roomId}/schedule`;
    } catch (err: any) {
      console.error("최종 확정 실패:", err);
      setError(err.response?.data?.detail || "확정에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">스케줄 현황 로딩 중...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  //렌더링
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-center mb-1">임시 시간표</h1>
      <h2 className="text-lg font-semibold text-center text-gray-700 mb-4"></h2>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-2 text-gray-800">멤버 제출 현황</h3>
        <div className="space-y-1">
          {submissionStatus.map((member) => (
            <div key={member.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{member.name}</span>
              {member.submitted ? (
                <span className="font-semibold text-green-600">
                  제출 완료 ({member.slots}칸)
                </span>
              ) : (
                <span className="font-medium text-red-500">미제출</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 rounded-lg shadow-md pb-4 mb-20">
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
              if (!scheduleGrid) return null;

              const cell = scheduleGrid[dayIndex][hourIndex];
              const style = getCellStyle(cell);

              let content = null;
              if (cell.confirmedMember) {
                content = cell.confirmedMember.name;
              } else if (cell.isCareNeeded) {
                const count = cell.availableMembers.length;
                if (count === 1) {
                  content = cell.availableMembers[0].name;
                } else if (count > 1) {
                  content = `${count}명`;
                }
              }

              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => handleCellClick(dayIndex, hourIndex, cell)}
                  style={style}
                  className="border h-8 w-full text-xs text-center leading-8 overflow-hidden text-ellipsis whitespace-nowrap px-1"
                >
                  {content}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="fixed bottom-24 z-10 right-4">
        <Button
          variant="primary"
          onClick={handleSubmitFinalize}
          disabled={isSubmitting}
        >
          {isSubmitting ? "확정 중..." : "저장하기"}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-xl font-bold">멤버 배정하기</h2>
          <p className="text-gray-600">
            {selectedCellData &&
              `${DAYS[selectedCellData.day]}요일 ${selectedCellData.hour}시`}
            에 배정할 멤버를 선택하세요.
          </p>
          <div className="w-full space-y-2">
            {selectedCellData?.cell.availableMembers.map((member) => (
              <Button
                key={member.id}
                variant="secondary"
                onClick={() => handleSelectMember(member)}
                className="w-full"
                style={{
                  backgroundColor: memberColorMap[member.id] || "#E0E0E0",
                }}
              >
                {member.name}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

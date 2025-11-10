"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Button from "@/components/Button";
import ScheduleGrid from "@/components/ScheduleGrid";
import { useRoom } from "@/lib/RoomContext";
import { MEMBER_COLORS } from "@/lib/colors";

type HistoryItem = {
  week: string; // "2025-W44"
  status: string;
  start_date: string;
  end_date: string;
};
const MEMBER_COLOR_ARRAY = Object.values(MEMBER_COLORS);

function formatHistoryDate(startDate: string): string {
  try {
    const date = new Date(startDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일 시작 주`;
  } catch (e) {
    return "날짜 형식 오류";
  }
}

function LoadingSpinner() {
  return <div className="p-8 text-center">로딩 중...</div>;
}

//메인 컴포넌트
export default function ImportSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { scheduleStatus: currentSchedule } = useRoom();

  const roomId = params.id as string;
  const sourceWeekQuery = searchParams.get("source_week");

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [previewGrid, setPreviewGrid] = useState<any[][] | null>(null);
  const [previewWeekRange, setPreviewWeekRange] = useState<string[] | null>(
    null
  );

  const [sourceWeekIdToApply, setSourceWeekIdToApply] = useState<number | null>(
    null
  );
  const [memberColorMap, setMemberColorMap] = useState<Record<number, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //데이터 로드
  useEffect(() => {
    if (!roomId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        if (sourceWeekQuery) {
          //[미리보기 모드]
          const [scheduleRes, membersRes] = await Promise.all([
            api.get(`/schedules?room_id=${roomId}&week=${sourceWeekQuery}`),
            api.get(`/rooms/${roomId}/members/`),
          ]);

          const apiData = scheduleRes.data;

          setPreviewGrid(apiData.masterGrid);
          setSourceWeekIdToApply(apiData.week_id);
          setPreviewWeekRange(apiData.week_range);

          const members: any[] = membersRes.data;
          const colorMap: Record<number, string> = {};
          members.forEach((member) => {
            const colorIndex = member.membership_index || 0;
            colorMap[member.user_id] = `#${
              MEMBER_COLOR_ARRAY[colorIndex % MEMBER_COLOR_ARRAY.length]
            }`;
          });
          setMemberColorMap(colorMap);
        } else {
          //[목록 모드]
          const response = await api.get(
            `/schedules/history?room_id=${roomId}&limit=4`
          );
          setHistoryList(response.data.history);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId, sourceWeekQuery]); //

  const handleApplyClick = async () => {
    if (!sourceWeekIdToApply) {
      setError("복사할 스케줄 ID를 찾을 수 없습니다.");
      return;
    }
    const currentWeekId = currentSchedule.week_id;

    // 이번주에 확정스케줄 있으면 복사해올 수 없음
    if (currentSchedule.is_finalized) {
      alert("이미 확정된 스케줄에는 복사할 수 없습니다.");
      return;
    }

    //드래프트를 만든 후에 복사해올 수 있음
    if (!currentWeekId) {
      alert(
        "이번 주 스케줄이 '임시저장' 상태일 때만 덮어쓸 수 있습니다.\n먼저 '새로운 시간표 만들기'로 이번 주 스케줄을 생성해주세요."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post(
        `/schedules/${currentWeekId}/import_previous/`,
        { source_week_id: sourceWeekIdToApply } //
      );

      alert("이전 스케줄을 이번 주로 복사했습니다!");
      window.location.href = `/room/${roomId}/schedule`;
    } catch (err: any) {
      console.error("적용 실패:", err);
      setError(err.response?.data?.detail || "적용에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // [미리보기 모드]
  if (sourceWeekQuery && previewGrid && previewWeekRange) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-center mb-4">
          {formatHistoryDate(previewWeekRange[0])} 확정 시간표
        </h1>
        <ScheduleGrid
          masterGrid={previewGrid}
          myUserId={""}
          isOwner={false}
          isFinalized={true}
          onCellClick={() => {}}
          memberColorMap={memberColorMap}
        />
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={handleApplyClick}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "적용 중..." : "이번주에도 적용하기"}
          </Button>
        </div>
      </div>
    );
  }

  // [목록 모드]
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        이전 스케줄 불러오기
      </h1>
      <nav className="flex flex-col">
        {historyList.length > 0 ? (
          historyList.map((item) => (
            <Link
              key={item.week}
              href={`/room/${roomId}/schedule/new/import?source_week=${item.week}`}
              className="py-4 border-b text-lg"
            >
              {formatHistoryDate(item.start_date)}
            </Link>
          ))
        ) : (
          <p className="text-gray-500">
            불러올 수 있는 이전 스케줄이 없습니다.
          </p>
        )}
      </nav>
    </div>
  );
}

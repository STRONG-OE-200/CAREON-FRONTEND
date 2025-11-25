"use client";
import { useRouter } from "next/navigation";
import { useRoom } from "@/lib/RoomContext";
import ScheduleGrid from "@/components/ScheduleGrid";
import ScheduleEmptyState from "@/components/ScheduleEmptyState";
import ScheduleInProgress from "@/components/ScheduleInProgress";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { MEMBER_COLORS } from "@/lib/colors";

const MEMBER_COLOR_ARRAY = Object.values(MEMBER_COLORS);

function LoadingSpinner() {
  return <div className="p-8 text-center">스케줄 불러오는 중...</div>;
}

export default function SchedulePage() {
  const router = useRouter();

  const { roomId, isOwner, scheduleStatus, isLoading } = useRoom();
  const { week_id, is_finalized } = scheduleStatus;

  const [finalizedGrid, setFinalizedGrid] = useState<any[][] | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [memberColorMap, setMemberColorMap] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    setMyUserId(localStorage.getItem("myUserId"));

    if (is_finalized && roomId && week_id) {
      const fetchFinalizedData = async () => {
        setIsGridLoading(true);
        try {
          const [scheduleRes, membersRes] = await Promise.all([
            api.get(`/schedules?room_id=${roomId}&schedule_id=${week_id}`),
            api.get(`/rooms/${roomId}/members/`),
          ]);
          setFinalizedGrid(scheduleRes.data.masterGrid);

          const members: any[] = membersRes.data;
          const colorMap: Record<number, string> = {};
          members.forEach((member) => {
            const colorIndex = member.membership_index || 0;
            colorMap[member.user_id] = `#${
              MEMBER_COLOR_ARRAY[colorIndex % MEMBER_COLOR_ARRAY.length]
            }`;
          });
          setMemberColorMap(colorMap);
        } catch (err) {
          console.error("확정 스케줄 로드 실패:", err);
        } finally {
          setIsGridLoading(false);
        }
      };
      fetchFinalizedData();
    }
  }, [is_finalized, roomId, week_id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!week_id) {
    return (
      <ScheduleEmptyState
        isOwner={isOwner}
        onScheduleCreateClick={() =>
          router.push(`/room/${roomId}/schedule/new/create`)
        }
        roomId={roomId}
        weekId={null}
        isFinalized={false}
      />
    );
  }

  if (!is_finalized) {
    return (
      <ScheduleInProgress
        isOwner={isOwner}
        roomId={roomId}
        weekId={week_id}
        isFinalized={is_finalized}
      />
    );
  }

  if (is_finalized) {
    if (isGridLoading || !finalizedGrid || !myUserId) {
      return <LoadingSpinner />;
    }

    return (
      <div className="p-4">
        <h1 className="text-xl font-medium text-center mb-4">
          이번주 확정 시간표
        </h1>
        <ScheduleGrid
          masterGrid={finalizedGrid}
          myUserId={myUserId}
          isOwner={isOwner}
          isFinalized={true}
          onCellClick={() => {}} // 확정 시 클릭 안 됨
          memberColorMap={memberColorMap}
        />
      </div>
    );
  }

  return <div>알 수 없는 에러가 발생했습니다.</div>;
}

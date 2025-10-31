"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ScheduleGrid from "@/components/ScheduleGrid";
import ScheduleEmptyState from "@/components/ScheduleEmptyState";
import Modal from "@/components/Modal";

type SchedulePageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

// (임시) 로딩 스피너
function LoadingSpinner() {
  return <div className="p-8 text-center">스케줄 불러오는 중...</div>;
}

//방장이 스케줄 최초 생성
function CreateScheduleModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // 방장이 간병필요시간 설정
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>스케줄 생성하기</h2>
      <p>방장이 간병필요시간 설정하는 ui</p>
    </Modal>
  );
}

export default function SchedulePage({ params }: SchedulePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [scheduleData, setScheduleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchSchedule = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/schedule/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          setScheduleData(data.schedule);
          setIsOwner(data.userRole === "OWNER");
        } else if (response.status === 400) {
          //404인지 백한테 확인 필요
          setIsOwner(data.userRole === "OWNER");
          setScheduleData(null);
        } else {
          console.error("스케줄 로딩 실패");
          setScheduleData(null);
        }
      } catch (error) {
        console.error("네트워크 오류", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [roomId, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <>
      {scheduleData ? (
        <div>
          <h1>스케줄</h1>
          <ScheduleGrid />
        </div>
      ) : (
        <ScheduleEmptyState
          isOwner={isOwner}
          onScheduleCreateClick={() => setIsModalOpen(true)}
        />
      )}

      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

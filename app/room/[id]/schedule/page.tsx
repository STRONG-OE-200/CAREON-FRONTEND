"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ScheduleGrid from "@/components/ScheduleGrid";
import ScheduleEmptyState from "@/components/ScheduleEmptyState";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

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
      <Button onClick={onClose} className="mt-4">
        닫기
      </Button>
    </Modal>
  );
}

export default function SchedulePage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [scheduleData, setScheduleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const ownerStatus = localStorage.getItem("isOwner");
    setIsOwner(ownerStatus === "true");

    if (!roomId) {
      setIsLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/schedule/`, // (이 API 주소는 백엔드와 확인 필요!)
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          // (API 명세서에 따라 data.schedule 키 이름 확인 필요!)
          setScheduleData(data.schedule);
        } else if (response.status === 404) {
          // 404 (스케줄 없음)일 때 HTML이 오는지 JSON이 오는지 확인 필요!
          // (임시로 '스케줄 없음'으로 처리)
          setScheduleData(null);
        } else {
          console.error("스케줄 로딩 실패");
          setScheduleData(null);
        }
      } catch (error) {
        console.error("네트워크 오류:", error);
        setScheduleData(null);
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
        // 스케줄 데이터가 null이면 '빈 화면' 렌더링
        <ScheduleEmptyState
          isOwner={isOwner}
          onScheduleCreateClick={() => setIsModalOpen(true)}
        />
      )}

      {/* '스케줄 생성하기' 버튼이 열 모달 */}
      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

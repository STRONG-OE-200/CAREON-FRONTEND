"use client";
import { useState, useEffect } from "react";
// 1. (★수정★) 'useParams' 훅을 import 합니다.
import { useRouter, useParams } from "next/navigation";
import ScheduleGrid from "@/components/ScheduleGrid";
import ScheduleEmptyState from "@/components/ScheduleEmptyState"; // (경로 @/components/... 로 수정됨)
import Modal from "@/components/Modal";
import Button from "@/components/Button"; // CreateScheduleModal에서 사용

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
      {/* 이 모달 안에서 '방장 스케줄 생성' API를 호출하고,
        성공하면 onClose()를 호출하면서 
        부모(SchedulePage)에게 스케줄을 다시 불러오라고 신호를 줘야 합니다.
      */}
      <Button onClick={onClose} className="mt-4">
        닫기
      </Button>
    </Modal>
  );
}

// 2. (★수정★) props로 params를 받지 않습니다.
export default function SchedulePage() {
  const router = useRouter();

  // 3. (★수정★) 'useParams' 훅을 사용해 ID를 가져옵니다.
  const params = useParams(); // (예: { id: '13' })
  const roomId = params.id as string; // 'Promise'가 아닌 'string'이 바로 나옵니다.

  const [scheduleData, setScheduleData] = useState<any>(null); // (API 응답 데이터)
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // (방장 여부)

  // 4. useEffect는 이제 안정적인 roomId를 기반으로 실행됩니다.
  useEffect(() => {
    // roomId가 (useParams로 인해) 아직 준비되지 않았으면 실행 안 함
    if (!roomId) return;

    const fetchSchedule = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(
          // (API 명세서에 따라 /schedule/이 아닐 수 있음 - 확인 필요!)
          `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/schedule/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // (API 명세서에 따라 응답 코드가 다를 수 있음!)
        if (response.status === 200) {
          const data = await response.json();
          // (API 명세서에 따라 data.schedule / data.userRole 키 이름 확인 필요!)
          setScheduleData(data.schedule);
          setIsOwner(data.userRole === "OWNER");
        } else if (response.status === 404) {
          // (404일 때도 userRole을 받기로 백엔드와 약속해야 함!)
          const data = await response.json();
          setIsOwner(data.userRole === "OWNER");
          setScheduleData(null);
        } else {
          console.error("스케줄 로딩 실패");
          setScheduleData(null);
          setIsOwner(false); // 에러 시 기본값
        }
      } catch (error) {
        console.error("네트워크 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [roomId, router]); // roomId가 변경되면 이 useEffect를 다시 실행

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {scheduleData ? (
        // (★참고★)
        // 스케줄 데이터가 있으면 ScheduleGrid를 렌더링
        // (지금은 ScheduleGrid가 'props'를 받지 않는 예전 버전으로 가정)
        <div>
          <h1>스케줄</h1>
          <ScheduleGrid />
        </div>
      ) : (
        // 스케줄 데이터가 null이면 '빈 화면' 렌더링
        <ScheduleEmptyState
          isOwner={isOwner} // isOwner prop을 전달
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

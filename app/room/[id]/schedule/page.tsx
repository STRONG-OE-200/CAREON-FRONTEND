"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ScheduleGrid from "@/components/ScheduleGrid";
import ScheduleEmptyState from "@/components/ScheduleEmptyState";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import api from "@/lib/api"; // 1. (★수정★) fetch 대신 api.ts를 import

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

  const [scheduleData, setScheduleData] = useState<any>(null); // 'masterGrid' 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [myUserId, setMyUserId] = useState("temp-user-id"); // (★임시★ 로그인 시 내 ID 저장 필요)

  useEffect(() => {
    const ownerStatus = localStorage.getItem("isOwner");
    setIsOwner(ownerStatus === "true");

    if (!roomId) {
      setIsLoading(false);
      return;
    }

    // 2. (★수정★) fetchSchedule 함수를 axios로 변경
    const fetchSchedule = async () => {
      // (localStorage.getItem("token") 및 !token 체크 로직 삭제 -> api.ts가 자동 처리)
      try {
        // 3. (★수정★) api.get() 호출
        // (Authorization 헤더와 credentials 옵션이 자동으로 포함됨)
        const response = await api.get(
          `/rooms/${roomId}/schedule/` // (이 API 주소는 백엔드와 확인 필요!)
        );

        // 4. (★수정★) axios는 200 성공 시 .data로 JSON을 바로 줌
        // (if (response.status === 200) ... 로직이 이 안으로 들어옴)
        const data = response.data;
        setScheduleData(data.schedule); // (백엔드와 확인 필요!)
      } catch (error: any) {
        // 5. (★수정★) axios는 4xx, 5xx 에러를 catch로 보냄
        if (error.response) {
          // 5-A. 서버가 응답을 하긴 함 (4xx, 5xx)
          if (error.response.status === 404) {
            // (이전 404 로직)
            console.log("스케줄 없음(404), 빈화면 표시");
            setScheduleData(null);
          } else {
            // (이전 'else' 로직)
            // (401 토큰 만료는 api.ts가 알아서 재발급 시도함)
            console.error("스케줄 로딩 실패", error.response.data);
            setScheduleData(null);
          }
        } else {
          // 5-B. 서버가 응답을 안 함 (네트워크 오류)
          // (이전 'catch' 로직)
          console.error("네트워크 오류:", error);
          setScheduleData(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [roomId, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // (return JSX 부분은 요청하신 대로 수정하지 않았습니다)
  return (
    <>
      {scheduleData ? (
        // 3. (★핵심 수정★) ScheduleGrid에 props를 전달합니다!
        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-4">공동 스케줄</h1>
          <ScheduleGrid
            masterGrid={scheduleData}
            myUserId={myUserId}
            onCellClick={(day, hour) => {
              // (여기에 F2 기능: '내 시간 참여하기' socket.emit 로직 추가)
              console.log("클릭됨:", day, hour);
            }}
          />
        </div>
      ) : (
        // 스케줄 데이터가 null이면 '빈 화면' 렌더링
        <ScheduleEmptyState
          isOwner={isOwner}
          onScheduleCreateClick={
            () => router.push(`/room/${roomId}/schedule/new/create`) // (new/create 경로로 수정)
          }
        />
      )}
    </>
  );
}

// app/mypage/delete-room/page.tsx (경로는 예시입니다)

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import Modal from "@/components/Modal"; // Modal 컴포넌트 경로

// patientName 대신 'patient' 필드를 사용 (LeaveRoomPage와 동일)
interface RoomInfo {
  patient: string;
}

export default function DeleteRoomPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState<string>("로딩 중...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 이 부분은 LeaveRoomPage와 100% 동일합니다.
  useEffect(() => {
    const currentRoomId = localStorage.getItem("currentRoomId");

    if (!currentRoomId) {
      alert("방 ID를 찾을 수 없습니다. 다시 시도해주세요.");
      router.back();
      return;
    }

    const fetchRoomInfo = async () => {
      try {
        const response = await api.get<RoomInfo>(`/rooms/${currentRoomId}/`);
        setPatientName(response.data.patient);
      } catch (error) {
        console.error("방 정보를 불러오기 실패:", error);
        setPatientName("정보 없음");
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          alert("방 정보를 조회할 권한이 없습니다.");
          router.back();
        } else {
          alert("방 정보를 불러오는 데 실패했습니다.");
          router.back();
        }
      }
    };

    fetchRoomInfo();
  }, [router]);

  // --- ⬇️ 여기가 변경되었습니다 ⬇️ ---

  // 1. 함수 이름 변경: handleLeaveRoom -> handleDeleteRoom
  const handleDeleteRoom = async () => {
    const currentRoomId = localStorage.getItem("currentRoomId");
    if (!currentRoomId) {
      setErrorMessage("방 ID를 찾을 수 없어 요청에 실패했습니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 2. API 요청 변경: api.post() -> api.delete()
      // 3. URL 변경: /leave/ 제거
      await api.delete(`/rooms/${currentRoomId}/`);

      alert("방을 성공적으로 삭제했습니다."); // 성공 메시지 변경
      setIsModalOpen(false);
      localStorage.removeItem("currentRoomId");
      router.push("/login");
    } catch (error) {
      // 4. 에러 핸들링 (PDF의 403: "방장에게만..." 메시지가 자동으로 처리됩니다) [cite: 23]
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          error.response.data.detail || "알 수 없는 오류가 발생했습니다."
        );
      } else {
        console.error("방 삭제 API 요청 실패:", error); // 로그 메시지 변경
        setErrorMessage(
          "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 이 부분은 LeaveRoomPage와 100% 동일합니다.
  const closeModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 md:p-8 space-y-6 max-w-sm">
        {/* 1. 제목 변경 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">방 삭제하기</h1>

        {/* 환자명 (동일) */}
        <div className="flex items-center space-x-8 text-lg pl-2">
          <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
            환자명
          </span>
          <span className="font-medium text-gray-900">{patientName}</span>
        </div>

        {/* 2. 버튼 텍스트 변경 (의미상 danger 스타일로 border-red-500 등을 적용해도 좋습니다) */}
        <button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          disabled={patientName === "로딩 중..." || patientName === "정보 없음"}
          className="mt-6 px-6 py-3 border border-gray-300 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          방 삭제하기
        </button>
      </div>

      {/* 3. 모달 UI 변경 */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col items-center space-y-6 px-4 py-6 border border-blue-300 bg-blue-50 rounded-lg shadow-md">
          {/* 모달 텍스트 변경 (이미지 반영) */}
          <p className="text-lg text-gray-800 font-medium text-center leading-relaxed">
            해당 환자의 방을 삭제하시겠습니까?
            <br />
            <span className="font-semibold">
              한 번 삭제한 방은 되돌릴 수 없습니다.
            </span>
          </p>

          {errorMessage && (
            <p className="w-full p-2 text-sm text-red-700 bg-red-100 rounded-md text-center">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-center w-full gap-6 pt-2">
            {/* '아니요' 버튼 (동일) */}
            <button
              onClick={closeModal}
              disabled={isLoading}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-gray-700 hover:text-blue-700 hover:border-blue-500 rounded-lg disabled:opacity-50"
            >
              아니요
            </button>
            {/* '예' 버튼 (이미지처럼 text-red-600으로 변경) */}
            <button
              onClick={handleDeleteRoom} // 1. onDelete 함수 연결
              disabled={isLoading}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-red-600 hover:text-red-800 hover:border-red-500 rounded-lg disabled:opacity-50" // 2. 색상 변경 (blue -> red)
            >
              {isLoading ? "삭제 중..." : "예"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

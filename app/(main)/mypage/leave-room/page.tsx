"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import Modal from "@/components/Modal"; // 경로가 맞는지 확인해주세요!

interface RoomInfo {
  patient: string;
}

export default function LeaveRoomPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState<string>("로딩 중...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleLeaveRoom = async () => {
    const currentRoomId = localStorage.getItem("currentRoomId");
    if (!currentRoomId) {
      setErrorMessage("방 ID를 찾을 수 없어 요청에 실패했습니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.post(`/rooms/${currentRoomId}/leave/`);

      alert("방에서 성공적으로 나갔습니다.");
      setIsModalOpen(false);
      localStorage.removeItem("currentRoomId");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          error.response.data.detail || "알 수 없는 오류가 발생했습니다."
        );
      } else {
        console.error("방 나가기 API 요청 실패:", error);
        setErrorMessage(
          "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  return (
    // 1. 배경색을 white로 변경하고, justify-center items-center 제거
    <div className="min-h-screen bg-white">
      {/* 2. 컨텐츠를 감싸는 div에 padding을 주어 좌측 상단에 배치 */}
      <div className="p-6 md:p-8 space-y-6 max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">방 나가기</h1>

        {/* 환자명 표시 (스타일 유지) */}
        <div className="flex items-center space-x-8 text-lg pl-2">
          <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
            환자명
          </span>
          <span className="font-medium text-gray-900">{patientName}</span>
        </div>

        {/* 방 나가기 버튼 (w-full 제거, mt-10 -> mt-6 조정) */}
        <button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          disabled={patientName === "로딩 중..." || patientName === "정보 없음"}
          className="mt-6 px-6 py-3 border border-gray-300 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          방 나가기
        </button>
      </div>

      {/* 모달 부분은 기존 스타일을 유지합니다. */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col items-center space-y-6 px-4 py-6 border border-blue-300 bg-blue-50 rounded-lg shadow-md">
          <p className="text-lg text-gray-800 font-medium text-center leading-relaxed">
            해당 환자의 방을 나가시겠습니까?
          </p>

          {errorMessage && (
            <p className="w-full p-2 text-sm text-red-700 bg-red-100 rounded-md text-center">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-center w-full gap-6 pt-2">
            <button
              onClick={closeModal}
              disabled={isLoading}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-gray-700 hover:text-blue-700 hover:border-blue-500 rounded-lg disabled:opacity-50"
            >
              아니요
            </button>
            <button
              onClick={handleLeaveRoom}
              disabled={isLoading}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-blue-600 hover:text-blue-800 hover:border-blue-500 rounded-lg disabled:opacity-50"
            >
              {isLoading ? "나가는 중..." : "예"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// app/mypage/delete-room/page.tsx (경로는 예시입니다)

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useAlert } from "@/lib/AlertContext";

interface RoomInfo {
  patient: string;
}

export default function DeleteRoomPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [patientName, setPatientName] = useState<string>("로딩 중...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const currentRoomId = localStorage.getItem("currentRoomId");

    if (!currentRoomId) {
      showAlert("방 ID를 찾을 수 없습니다. 다시 시도해주세요.");
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
          showAlert("방 정보를 조회할 권한이 없습니다.");
          router.back();
        } else {
          showAlert("방 정보를 불러오는 데 실패했습니다.");
          router.back();
        }
      }
    };

    fetchRoomInfo();
  }, [router]);

  const handleDeleteRoom = async () => {
    const currentRoomId = localStorage.getItem("currentRoomId");
    if (!currentRoomId) {
      setErrorMessage("방 ID를 찾을 수 없어 요청에 실패했습니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.delete(`/rooms/${currentRoomId}/`);

      showAlert("방을 성공적으로 삭제했습니다.");
      setIsModalOpen(false);
      localStorage.removeItem("currentRoomId");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(
          error.response.data.detail || "알 수 없는 오류가 발생했습니다."
        );
      } else {
        console.error("방 삭제 API 요청 실패:", error);
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
    <div>
      <div className="p-6 md:p-8 space-y-6 max-w-sm">
        <h1 className="text-[22px] text-ex-purple font-medium text-center">
          돌봄온
        </h1>
        <div className="">
          <h2 className="text-xl">방 삭제하기</h2>
          <hr className="border-t border-bg-purple w-[350px]" />
        </div>
        <div className="flex items-center space-x-8 text-lg pl-2">
          <span className="font-semibold w-20 flex-shrink-0">환자명</span>
          <span className="font-medium text-gray-900">{patientName}</span>
        </div>

        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          variant="secondary"
          className="mt-20 w-[340px]"
          disabled={patientName === "로딩 중..." || patientName === "정보 없음"}
        >
          방 삭제하기
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div>
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
            <button
              onClick={closeModal}
              disabled={isLoading}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-gray-700 rounded-lg disabled:opacity-50"
            >
              아니요
            </button>
            <button
              onClick={handleDeleteRoom}
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

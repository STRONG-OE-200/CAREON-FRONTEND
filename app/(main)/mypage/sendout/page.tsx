// app/mypage/sendout/page.tsx (경로는 예시입니다)

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { twMerge } from "tailwind-merge"; // 스타일 병합을 위해
import api from "@/lib/api";
import Modal from "@/components/Modal"; // Modal 컴포넌트 경로

// RoomInfoPage에서 사용한 Member 타입을 동일하게 정의
type Member = {
  user_id: number;
  user_name: string;
  relation: string;
  role: "OWNER" | "MEMBER";
};

export default function SendOutPage() {
  const router = useRouter();

  // 페이지 로딩 상태
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달 및 API 제출 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. 데이터 로드: 멤버 목록을 불러옵니다.
  useEffect(() => {
    const currentRoomId = localStorage.getItem("currentRoomId");

    if (!currentRoomId) {
      alert("방 ID를 찾을 수 없습니다. 다시 시도해주세요.");
      router.back();
      return;
    }

    const fetchMembers = async () => {
      try {
        const response = await api.get<Member[]>(
          `/rooms/${currentRoomId}/members/`
        );
        setMembers(response.data);
      } catch (error) {
        console.error("멤버 목록을 불러오기 실패:", error);
        setError("멤버 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [router]);

  // 2. 모달 열기 함수
  const openModal = (member: Member) => {
    // API 명세에 따라 방장(OWNER)은 내보낼 수 없습니다. [cite: 80, 105]
    if (member.role === "OWNER") {
      // API 명세의 400 에러 메시지 사용 [cite: 105]
      alert("방장 계정은 내보낼 수 없습니다.");
      return;
    }
    setSelectedMember(member);
    setSubmitError(null); // 이전 에러 초기화
    setIsModalOpen(true);
  };

  // 3. 모달 닫기 함수
  const closeModal = () => {
    if (isSubmitting) return; // 제출 중에는 닫기 방지
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // 4. API 호출: 멤버 내보내기
  const handleKickMember = async () => {
    const currentRoomId = localStorage.getItem("currentRoomId");
    if (!selectedMember || !currentRoomId) {
      setSubmitError("선택된 멤버 또는 방 ID가 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // API 명세에 따라 DELETE /rooms/{room_id}/members/{user_id}/ 호출 [cite: 67, 69]
      await api.delete(
        `/rooms/${currentRoomId}/members/${selectedMember.user_id}/`
      );

      // 성공 시 (204 No Content) [cite: 90]
      alert(
        `${selectedMember.relation} ${selectedMember.user_name} 님을 내보냈습니다.`
      );

      // 상태 업데이트: UI에서 즉시 제거
      setMembers((prevMembers) =>
        prevMembers.filter((m) => m.user_id !== selectedMember.user_id)
      );
      closeModal();
    } catch (error) {
      // 403 (방장 아님), 404 (멤버 없음) 등 [cite: 96, 100]
      if (axios.isAxiosError(error) && error.response) {
        setSubmitError(
          error.response.data.detail || "알 수 없는 오류가 발생했습니다."
        );
      } else {
        console.error("멤버 내보내기 API 요청 실패:", error);
        setSubmitError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI 렌더링 ---

  if (isLoading) {
    return <div className="p-8 text-center">멤버 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 md:p-8 space-y-4 max-w-sm">
        {" "}
        {/* 간격을 space-y-4로 줄임 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          구성원 내보내기
        </h1>
        <h2 className="text-lg font-semibold text-gray-700 pl-2">
          현재 구성원
        </h2>
        {/* 멤버 목록 */}
        <div className="space-y-3">
          {members.map((member) => (
            <button
              key={member.user_id}
              onClick={() => openModal(member)}
              // 방장은 비활성화 스타일 적용 (흐리게)
              disabled={member.role === "OWNER"}
              className={twMerge(
                "w-full p-4 border border-gray-300 rounded-lg text-left flex justify-between items-center text-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300",
                member.role === "OWNER" &&
                  "opacity-60 cursor-not-allowed hover:bg-white",
                selectedMember?.user_id === member.user_id &&
                  "border-2 border-blue-500" // 이미지처럼 선택 시 파란 테두리
              )}
            >
              <div>
                <span className="font-semibold text-gray-700 w-20 inline-block">
                  {/* API 응답에 '방장' 텍스트가 따로 없으므로 role 기준으로 표시 */}
                  {member.role === "OWNER" ? "방장" : member.relation}
                </span>
                <span className="font-medium text-gray-900 ml-4">
                  {member.user_name}
                </span>
              </div>
              {/* 방장에게는 '내보내기' 텍스트 숨김 */}
              {member.role === "MEMBER" && (
                <span className="text-sm text-gray-400">내보내기</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 내보내기 확인 모달 */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col items-center space-y-6 px-4 py-6 border border-blue-300 bg-blue-50 rounded-lg shadow-md">
          <p className="text-lg text-gray-800 font-medium text-center leading-relaxed">
            {/* selectedMember가 있을 때만 텍스트 표시 */}
            {selectedMember && (
              <>
                <span className="font-bold">{`${selectedMember.relation} ${selectedMember.user_name}`}</span>
                <span> 님을 내보내시겠습니까?</span>
              </>
            )}
          </p>

          {submitError && (
            <p className="w-full p-2 text-sm text-red-700 bg-red-100 rounded-md text-center">
              {submitError}
            </p>
          )}

          <div className="flex justify-center w-full gap-6 pt-2">
            <button
              onClick={closeModal}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-gray-700 hover:text-blue-700 hover:border-blue-500 rounded-lg disabled:opacity-50"
            >
              아니요
            </button>
            <button
              onClick={handleKickMember}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-blue-600 hover:text-blue-800 hover:border-blue-500 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "내보내는 중..." : "예"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

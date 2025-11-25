"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { twMerge } from "tailwind-merge";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { useAlert } from "@/lib/AlertContext";

type Member = {
  user_id: number;
  user_name: string;
  relation: string;
  role: "OWNER" | "MEMBER";
};

export default function SendOutPage() {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const currentRoomId = localStorage.getItem("currentRoomId");

    if (!currentRoomId) {
      showAlert("방 ID를 찾을 수 없습니다. 다시 시도해주세요.");
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

  const openModal = (member: Member) => {
    if (member.role === "OWNER") {
      showAlert("방장 계정은 내보낼 수 없습니다.");
      return;
    }
    setSelectedMember(member);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleKickMember = async () => {
    const currentRoomId = localStorage.getItem("currentRoomId");
    if (!selectedMember || !currentRoomId) {
      setSubmitError("선택된 멤버 또는 방 ID가 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.delete(
        `/rooms/${currentRoomId}/members/${selectedMember.user_id}/`
      );

      showAlert(
        `${selectedMember.relation} ${selectedMember.user_name} 님을 내보냈습니다.`
      );

      setMembers((prevMembers) =>
        prevMembers.filter((m) => m.user_id !== selectedMember.user_id)
      );
      closeModal();
    } catch (error) {
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
    <div className="min-h-screen">
      <div className="p-6 md:p-8 space-y-4 max-w-sm">
        <h1 className="text-[22px] text-ex-purple font-medium text-center">
          돌봄온
        </h1>
        <div className="">
          <h2 className="text-xl">구성원 내보내기</h2>
          <hr className="border-t border-bg-purple w-[350px]" />
        </div>
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
                "w-full px-4 py-2 shadow shadow-bg-purple rounded-4xl text-left flex justify-between items-center text-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300",
                member.role === "OWNER" &&
                  "opacity-60 cursor-not-allowed hover:bg-white",
                selectedMember?.user_id === member.user_id &&
                  "border-2 border-bg-purple"
              )}
            >
              <div>
                <span className="font-semibold text-gray-700 w-20 inline-block">
                  {member.role === "OWNER" ? "방장" : member.relation}
                </span>
                <span className="font-medium text-gray-900 ml-4">
                  {member.user_name}
                </span>
              </div>
              {member.role === "MEMBER" && (
                <span className="text-sm text-ex-purple">내보내기</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div>
          <p className="text-lg text-gray-800 font-medium text-center leading-relaxed">
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
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-gray-700 rounded-lg disabled:opacity-50"
            >
              아니요
            </button>
            <button
              onClick={handleKickMember}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 border-2 border-transparent text-lg font-medium text-ex-purple rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "내보내는 중..." : "예"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

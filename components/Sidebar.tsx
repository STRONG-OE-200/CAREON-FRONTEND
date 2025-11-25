"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  roomId: string;
  weekId: number | null;
  isFinalized: boolean;
};

export default function Sidebar({
  isOpen,
  onClose,
  isOwner,
  roomId,
  weekId,
  isFinalized,
}: SidebarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClick = () => {
    onClose();
    if (isOwner) {
      router.push(`/room/${roomId}/schedule/new/`);
    } else {
      setIsModalOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 top-16 z-20" onClick={onClose}>
        <div
          className="fixed top-16 left-0 w-full h-full bg-[linear-gradient(180deg,#E8E9FB_0%,#FFF_100%)] z-30 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col text-lg font-light">
            <>
              <button
                onClick={() => {
                  onClose();
                  router.push(`/room/${roomId}/schedule/my`);
                }}
                className="py-3 border-b border-main-purple text-left"
                disabled={!roomId}
              >
                내 스케줄만 보기
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push(`/room/${roomId}/schedule/participate/${weekId}`);
                }}
                className="py-3 border-b border-main-purple text-left"
                disabled={!roomId}
              >
                시간표 생성 참여하기
              </button>
            </>
            <button
              onClick={handleCreateClick}
              className="py-3 border-b border-main-purple text-left"
              disabled={!roomId}
            >
              스케줄 생성하기
            </button>
          </nav>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p className="text-center mt-4">
          앗, 방장만 사용할 수 있는 기능이에요.
        </p>
        <Button onClick={() => setIsModalOpen(false)} className="mt-4 ml-48">
          확인
        </Button>
      </Modal>
    </>
  );
}

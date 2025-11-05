"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  roomId: string;
};

export default function Sidebar({
  isOpen,
  onClose,
  isOwner,
  roomId,
}: SidebarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClick = () => {
    if (isOwner) {
      onClose();
      router.push(`/room/${roomId}/schedule/new`);
    } else {
      setIsModalOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 top-16 z-20" onClick={onClose}>
        <div
          className="fixed top-16 left-0 w-64 h-full bg-white z-30 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col">
            <Link href="#" className="py-3 border-b">
              내 스케줄만 보기
            </Link>
            <Link href="#" className="py-3 border-b">
              시간표 생성 참여하기
            </Link>
            <button
              onClick={handleCreateClick}
              className="py-3 border-b text-left"
              disabled={!roomId}
            >
              스케줄 생성하기
            </button>
          </nav>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>앗, 방장만 사용할 수 있는 기능이에요.</p>
        <Button onClick={() => setIsModalOpen(false)} className="mt-4">
          확인
        </Button>
      </Modal>
    </>
  );
}

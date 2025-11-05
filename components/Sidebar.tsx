"use client";
import Link from "next/link";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-20" onClick={onClose}>
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
          <Link href="#" className="py-3 border-b">
            스케줄 생성하기
          </Link>
        </nav>
      </div>
    </div>
  );
}

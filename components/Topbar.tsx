"use client";
import { RxHamburgerMenu } from "react-icons/rx";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <>
      <header className="sticky flex items-center justify-between top-0 z-10 w-full h-16 px-4">
        <button onClick={onMenuClick}>
          <RxHamburgerMenu size={24} className="text-main-purple" />
        </button>
        <h1 className="text-lg font-bold text-main-purple">스케줄</h1>
        <div className="w-8" />
      </header>
    </>
  );
}

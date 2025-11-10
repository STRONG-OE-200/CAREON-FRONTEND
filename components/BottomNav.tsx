"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const storedRoomId = localStorage.getItem("currentRoomId");
    setRoomId(storedRoomId);
  }, []);

  const fallbackPath = "/login/success";

  const navLinks = [
    {
      name: "스케줄",
      href: roomId ? `/room/${roomId}/schedule` : fallbackPath,
    },
    { name: "로그", href: roomId ? `/room/${roomId}/log` : fallbackPath },
    {
      name: "캘린더",
      href: roomId ? `/room/${roomId}/calendar` : fallbackPath,
    },
    { name: "챗봇", href: roomId ? `/room/${roomId}/chatbot` : fallbackPath },
    { name: "마이페이지", href: "/mypage" },
  ];

  return (
    <nav className="sticky bottom-0 w-full bg-white border-t">
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center text-sm ${
                isActive ? "text-blue-600 font-bold" : "text-gray-500"
              }`}
            >
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

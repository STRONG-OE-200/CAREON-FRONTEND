"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function BottomNav() {
  const pathname = usePathname();
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const storedRoomId = localStorage.getItem("currentRoomId");
    setRoomId(storedRoomId);
  }, [pathname]);

  const fallbackPath = "/login/success";

  const navLinks = [
    {
      name: "스케줄",
      href: roomId ? `/room/${roomId}/schedule` : fallbackPath,
      icon: "/bn-schedule.svg",
    },
    {
      name: "로그",
      href: roomId ? `/room/${roomId}/log` : fallbackPath,
      icon: "/bn-log.svg",
    },
    {
      name: "캘린더",
      href: roomId ? `/room/${roomId}/calendar` : fallbackPath,
      icon: "/bn-calendar.svg",
    },
    { name: "마이페이지", href: "/mypage", icon: "/bn-mypage.svg" },
  ];

  return (
    <nav className="sticky bottom-0 w-full bg-white border-t border-sub-purple">
      <div className="flex justify-around items-center h-20">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 text-base text-main-purple`}
            >
              <div className="relative w-6 h-6">
                <Image
                  src={link.icon}
                  alt={link.name}
                  fill
                  className={isActive ? "" : "opacity-50"} // 비활성일 때 흐리게
                />
              </div>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// components/BottomNav.tsx

"use client"; // (★핵심★) useParams는 "use client" 안에서만 쓸 수 있습니다.

import Link from "next/link";
// (★핵심★) usePathname (현재 경로) / useParams (URL 파라미터)
import { usePathname, useParams } from "next/navigation";

// (★핵심★) 이제 props로 roomId를 받지 않습니다.
export default function BottomNav() {
  const pathname = usePathname(); // 현재 전체 URL (예: "/room/123/schedule")
  const params = useParams(); // URL의 파라미터 (예: { id: "123" })

  // 1. params에서 id를 가져옵니다. (id가 string일 수도 있고 string[]일 수도 있어서 처리)
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;

  // 2. roomId가 있을 때만 링크를 만듭니다.
  const navLinks = [
    { name: "스케줄", href: `/room/${roomId}/schedule` },
    { name: "로그", href: `/room/${roomId}/log` },
    { name: "캘린더", href: `/room/${roomId}/calendar` },
    { name: "챗봇", href: `/room/${roomId}/chatbot` },
    { name: "마이페이지", href: "/mypage" },
  ];

  // 3. roomId가 없으면 (예: /mypage) 하단바를 안 보여줄 수도 있지만,
  //    일단 /room/[id]/layout.tsx가 호출했으니 roomId는 항상 있다고 가정합니다.
  if (!roomId) {
    // 혹시 모를 에러 방지 (room이 아닌 다른 곳에서 이 하단바를 쓰는 경우)
    return null;
  }

  return (
    <nav className="sticky bottom-0 w-full bg-white border-t">
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center text-sm ${
                isActive ? "text-blue-500" : "text-gray-500"
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

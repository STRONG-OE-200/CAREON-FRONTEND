// app/(main)/mypage/page.tsx  <-- (main) 폴더 안에 있어야 합니다.

import Link from "next/link";

export default function Mypage() {
  return (
    // BottomNav나 flex wrapper가 없는 순수한 페이지 내용
    <div className="p-6 bg-white min-h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-10">마이페이지</h1>
      <div className="flex flex-col space-y-6">
        <Link
          href="/mypage/room-info"
          className="text-lg text-gray-800 hover:text-blue-600"
        >
          우리 방 정보
        </Link>
        <Link
          href="/mypage/logout"
          className="text-lg text-gray-800 hover:text-blue-600"
        >
          로그아웃
        </Link>
      </div>
    </div>
  );
}

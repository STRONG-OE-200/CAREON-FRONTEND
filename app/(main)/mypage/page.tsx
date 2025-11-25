import Link from "next/link";

export default function Mypage() {
  return (
    <>
      <h1 className="text-[22px] text-ex-purple font-medium text-center mt-7">
        돌봄온
      </h1>
      <main className="p-6">
        <div>
          <h2 className="text-xl">마이페이지</h2>
          <hr className="border-t border-bg-purple w-[350px]" />
        </div>
        <div className="flex flex-col space-y-6 pt-10">
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
      </main>
    </>
  );
}

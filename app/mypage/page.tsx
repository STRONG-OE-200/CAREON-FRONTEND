import Link from "next/link";

export default function Mypage() {
  return (
    <>
      <div>
        <h3>마이페이지</h3>
      </div>
      <main className="flex flex-col">
        <Link href="/mypage/room-info">우리 방 정보</Link>
        <Link href="">개인정보 수정</Link>
        <Link href="">로그아웃</Link>
      </main>
    </>
  );
}

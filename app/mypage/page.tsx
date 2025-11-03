import Link from "next/link";

export default function Mypage() {
  return (
    <>
      <div>
        <h3>마이페이지</h3>
      </div>
      <main className="flex flex-col">
        <Link href="">우리 방 정보</Link>
        <Link href="">환자코드 보기</Link>
        <Link href="">새로운 방 만들기</Link>
        <Link href="">방 추가하기</Link>
        <Link href="">방 나가기</Link>
        <Link href="">팀원 내보내기</Link>
      </main>
    </>
  );
}

"use client";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">care on!</h1>
        <Link href="/login">로그인하러 가기</Link>
      </div>
    </>
  );
}

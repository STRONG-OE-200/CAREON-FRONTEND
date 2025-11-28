"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";

export default function LoginSuccess() {
  const router = useRouter();

  return (
    <>
      <div>
        <h1 className="text-[22px] text-ex-purple font-medium text-center mt-7">
          돌봄온
        </h1>
      </div>
      <main className="flex flex-col gap-5 items-center mt-10">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            router.push("/room/join");
          }}
          className="w-40"
        >
          방 입장하기
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            router.push("/room/create");
          }}
          className="w-40"
        >
          방 생성하기
        </Button>
        <Link
          href="https://youtu.be/qNl_GKSqA28?si=jvFDCIPzJBUZCo7e"
          className="hover:text-main-purple cursor-pointer pt-7"
        >
          방 생성 및 방 입장 안내 영상 보러가기
        </Link>
      </main>
    </>
  );
}

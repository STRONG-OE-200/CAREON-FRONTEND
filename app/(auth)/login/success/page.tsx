"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

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
      </main>
    </>
  );
}

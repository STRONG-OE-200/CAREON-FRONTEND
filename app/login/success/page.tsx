"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function LoginSuccess() {
  const router = useRouter();

  return (
    <>
      <div>
        <h3>돌봄온</h3>
      </div>
      <main className="flex flex-col gap-5 items-center">
        <Button
          type="button"
          onClick={() => {
            router.push("/room/join");
          }}
          className="w-3/4"
        >
          방 입장하기
        </Button>
        <Button
          type="button"
          onClick={() => {
            router.push("/room/create");
          }}
          className="w-3/4"
        >
          방 생성하기
        </Button>
      </main>
    </>
  );
}

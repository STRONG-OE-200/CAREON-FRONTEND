"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Image from "next/image";

export default function SignupSuccess() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-7 mt-[152px]">
        <Image src="/logo.svg" alt="logo" height={73} width={130} />
        <h1 className="text-main-purple text-[50px] font-extrabold">돌봄온</h1>
      </div>
      <p className="text-lg mt-10 mb-7 text-center">
        돌봄온의 회원가입이 완료되었습니다
        <br />
        환영합니다
      </p>
      <Button
        onClick={() => {
          router.push("/login");
        }}
        className="bg-white border border-bg-purple rounded-4xl w-[180px] text-gray-400"
      >
        로그인화면으로 가기
      </Button>
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function SignupSuccess() {
  const router = useRouter();
  return (
    <div>
      <p>돌봄온의 회원가입이 완료되었습니다</p>
      <Button
        onClick={() => {
          router.push("/login");
        }}
      >
        로그인
      </Button>
    </div>
  );
}

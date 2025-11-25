"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-bd-purple min-h-screen">
      <div className="flex flex-col items-center gap-7 mt-[152px]">
        <p className="text-[20px] font-medium">돌봄의 불을 켜다,</p>
        <Image src="/logo.svg" alt="logo" height={73} width={130} />
        <h1 className="text-main-purple text-[50px] font-extrabold">돌봄온</h1>
      </div>
    </div>
  );
}

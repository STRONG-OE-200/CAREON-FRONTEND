"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api";
import axios from "axios";
import { useAlert } from "@/lib/AlertContext";

export default function LogoutPage() {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [name, setName] = useState("로딩 중...");
  const [email, setEmail] = useState("로딩 중...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");

    if (!storedName || !storedEmail) {
      showAlert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    setName(storedName);
    setEmail(storedEmail);
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout/");
      showAlert("정상적으로 로그아웃되었습니다.");
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      if (axios.isAxiosError(error)) {
        showAlert(
          "로그아웃 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      } else {
        showAlert("알 수 없는 오류로 로그아웃에 실패했습니다.");
      }
      setIsLoading(false); // 실패 시에만 로딩 상태를 해제
    }
  };

  return (
    <div>
      <div className="p-6 md:p-8 space-y-10 max-w-sm">
        <h1 className="text-[22px] text-ex-purple font-medium text-center">
          돌봄온
        </h1>
        <div className="">
          <h2 className="text-xl">로그아웃</h2>
          <hr className="border-t border-bg-purple w-[350px]" />
        </div>
        <div className="space-y-2 pl-2">
          <label className="text-lg font-semibold text-gray-700">이름</label>
          <p className="text-xl font-medium text-gray-900">{name}</p>
        </div>

        <div className="space-y-2 pl-2">
          <label className="text-lg font-semibold text-gray-700">메일</label>
          <p className="text-xl font-medium text-gray-900">{email}</p>
        </div>

        <Button
          onClick={handleLogout}
          disabled={isLoading || name === "로딩 중..."}
          variant="secondary"
          className="mt-20 w-[340px]"
        >
          {isLoading ? "로그아웃 중..." : "로그아웃하기"}
        </Button>
      </div>
    </div>
  );
}

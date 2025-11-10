"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

export default function LogoutPage() {
  const router = useRouter();

  const [name, setName] = useState("로딩 중...");
  const [email, setEmail] = useState("로딩 중...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");

    if (!storedName || !storedEmail) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
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
      alert("정상적으로 로그아웃되었습니다.");
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      if (axios.isAxiosError(error)) {
        alert(
          "로그아웃 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      } else {
        alert("알 수 없는 오류로 로그아웃에 실패했습니다.");
      }
      setIsLoading(false); // 실패 시에만 로딩 상태를 해제
    }
    // 성공 시에는 router.push로 페이지가 이동되므로 finally에서 로딩을 풀 필요가 없습니다.
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 md:p-8 space-y-10 max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">로그아웃</h1>

        <div className="space-y-2 pl-2">
          <label className="text-lg font-semibold text-gray-700">이름</label>
          <p className="text-xl font-medium text-gray-900">{name}</p>
        </div>

        <div className="space-y-2 pl-2">
          <label className="text-lg font-semibold text-gray-700">메일</label>
          <p className="text-xl font-medium text-gray-900">{email}</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoading || name === "로딩 중..."}
          className="mt-10 px-8 py-3 border border-gray-300 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "로그아웃 중..." : "로그아웃하기"}
        </button>
      </div>
    </div>
  );
}

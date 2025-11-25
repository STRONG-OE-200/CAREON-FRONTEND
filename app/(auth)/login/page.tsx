"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Image from "next/image";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //폼 제출 시 새로고침 방지
    setError("");

    try {
      const response = await api.post("/auth/login/", {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        const data = response.data;
        console.log("로그인 성공", data);

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("email", data.email);
        localStorage.setItem("name", data.name);
        localStorage.setItem("myUserId", data.user_id);

        if (data.rooms && data.rooms.length > 0 && data.rooms[0]) {
          const firstRoom = data.rooms[0];
          localStorage.setItem("isOwner", firstRoom.isOwner);
          localStorage.setItem("currentRoomId", firstRoom.room_id);
          localStorage.setItem("myIndex", firstRoom.membership_index);
          router.push(`/room/${firstRoom.room_id}`);
        } else {
          localStorage.removeItem("isOwner");
          localStorage.removeItem("currentRoomId");
          localStorage.removeItem("myIndex");
          router.push("/login/success");
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          setError("로그인에 실패했습니다.");
        }
      } else {
        console.error("로그인 중 네트워크 오류", error);
        setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="bg-bd-purple min-h-screen">
      <div className="flex flex-col items-center gap-7 mt-[152px] mb-[35px]">
        <p className="text-[20px] font-medium">돌봄의 불을 켜다,</p>
        <Image src="/logo.svg" alt="logo" height={73} width={130} />
        <h1 className="text-main-purple text-[50px] font-extrabold">돌봄온</h1>
      </div>
      <main>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <Input
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-[265px]"
          />
          <Input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-[265px]"
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button
            type="submit"
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-[90px] text-gray-400"
          >
            로그인
          </Button>
        </form>
      </main>
      <div className="pl-[260px]">
        <p
          onClick={() => {
            router.push("/signup");
          }}
        >
          회원가입
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
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
    <>
      <div>
        <p>안녕하세요, 여러분의 도우미 돌봄온 입니다</p>
        <p>로고 이미지</p>
      </div>
      <main>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit">로그인</Button>
        </form>
      </main>
      <div>
        <p
          onClick={() => {
            router.push("/signup");
          }}
        >
          회원가입하러가기
        </p>
      </div>
    </>
  );
}

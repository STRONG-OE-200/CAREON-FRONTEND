"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import api from "@/lib/api"; // 1. (★수정★) fetch 대신 api.ts를 import

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 2. (★수정★) handleSubmit 함수를 axios에 맞게 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //폼 제출 시 새로고침 방지
    setError("");

    try {
      // 3. (★수정★) api.post(URL, body) 호출
      // headers, credentials, method는 api.ts가 자동으로 처리해줍니다.
      const response = await api.post("/auth/login/", {
        email: email,
        password: password,
      });

      // 4. (★수정★) axios는 성공(200) 시 .data에 JSON을 바로 담아줍니다.
      if (response.status === 200) {
        const data = response.data; // .json() 호출 필요 없음!
        console.log("로그인 성공", data);

        // access 토큰 저장 (이하 로직은 동일)
        localStorage.setItem("accessToken", data.access);

        if (data.rooms && data.rooms.length > 0 && data.rooms[0]) {
          const firstRoom = data.rooms[0];
          localStorage.setItem("isOwner", firstRoom.isOwner);
          localStorage.setItem("currentRoomId", firstRoom.room_id);
          router.push(`/room/${firstRoom.room_id}`);
        } else {
          localStorage.removeItem("isOwner");
          localStorage.removeItem("currentRoomId");
          router.push("/login/success");
        }
      }
    } catch (error: any) {
      // 5. (★수정★) axios는 4xx, 5xx 에러를 'catch'로 보냅니다.
      // error.response가 있는지 확인
      if (error.response && error.response.data) {
        // (이전 'else' 블록의 로직이 여기로 이동)
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          setError("로그인에 실패했습니다.");
        }
      } else {
        // (이전 'catch' 블록의 로직)
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
            // (★참고★) type="text"를 "password"로 수정하는 것을 권장합니다.
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

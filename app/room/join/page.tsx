"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import api from "@/lib/api"; // 1. (★수정★) fetch 대신 api.ts를 import

export default function RoomJoinPage() {
  const router = useRouter();

  const [patient, setPatient] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [relation, setRelation] = useState("");
  const [error, setError] = useState("");

  // 2. (★수정★) handleSubmit 함수를 axios에 맞게 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // (localStorage.getItem("token") 및 !token 체크 로직 삭제 -> api.ts가 자동 처리)

    try {
      // 3. (★수정★) api.post() 호출
      // (headers, credentials, method, Authorization이 자동으로 포함됨)
      const response = await api.post("/rooms/join/", {
        patient: patient,
        invite_code: inviteCode,
        relation: relation,
      });

      // 4. (★수정★) axios는 2xx (성공) 응답만 'try'로 받습니다.
      if (response.status === 201) {
        //성공
        const data = response.data; // .json() 필요 없음
        router.push(`/room/${data.room}/schedule`);
      } else {
        // (혹시 201이 아닌 다른 2xx 코드가 올 경우)
        setError("방 입장에 성공했으나, 알 수 없는 응답입니다.");
      }
    } catch (error: any) {
      // 5. (★수정★) axios는 4xx, 5xx 에러 및 네트워크 에러를 'catch'에서 처리
      console.error("방 입장 오류:", error);

      if (error.response) {
        // 5-A. 서버가 응답을 하긴 함 (4xx, 5xx)
        // (이전 'else' 블록의 로직이 여기로 이동)
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          setError("방 입장에 실패했습니다.");
        }
      } else {
        // 5-B. 서버가 응답을 안 함 (네트워크 오류)
        // (이전 'catch' 블록의 로직)
        console.error("네트워크 오류:", error);
        setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  // (return JSX 부분은 요청하신 대로 수정하지 않았습니다)
  return (
    <>
      <div>
        <h3>방 입장하기</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <p>환자 이름</p>
        <Input
          type="text"
          placeholder="환자분의 이름을 입력해주세요"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
          required
        />
        <p>환자 코드</p>
        <Input
          type="text"
          placeholder="환자 코드를 입력해주세요"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />
        <p>환자와의 관계</p>
        <Input
          type="text"
          placeholder="환자와의 관계를 입력해주세요"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit">방 입장하기</Button>
      </form>
    </>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import api from "@/lib/api";

export default function RoomJoinPage() {
  const router = useRouter();

  const [patient, setPatient] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [relation, setRelation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/rooms/join/", {
        patient: patient,
        invite_code: inviteCode,
        relation: relation,
      });

      if (response.status === 201) {
        const data = response.data;
        router.push(`/room/${data.room}/schedule`);
      } else {
        setError("방 입장에 성공했으나, 알 수 없는 응답입니다.");
      }
    } catch (error: any) {
      console.error("방 입장 오류:", error);

      if (error.response) {
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          setError("방 입장에 실패했습니다.");
        }
      } else {
        console.error("네트워크 오류:", error);
        setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

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

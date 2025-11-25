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
      <h1 className="text-[22px] text-ex-purple font-medium text-center mt-7">
        돌봄온
      </h1>
      <div className="mx-5 my-9">
        <h2 className="text-xl">방 입장하기</h2>
        <hr className="border-t border-bg-purple w-[350px]" />
      </div>
      <form onSubmit={handleSubmit} className="mx-5 flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <p>환자 이름</p>
          <Input
            type="text"
            placeholder="환자분의 이름을 입력해주세요"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            required
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-85 text-gray-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p>환자 코드</p>
          <Input
            type="text"
            placeholder="환자 코드를 입력해주세요"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-85 text-gray-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p>환자와의 관계</p>
          <Input
            type="text"
            placeholder="환자와의 관계를 입력해주세요"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            required
            className="bg-white border border-bd-purple shadow-lg rounded-4xl w-85 text-gray-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          variant="secondary"
          className="border border-bg-purple w-85 rounded-[30px] mt-[150px]"
        >
          방 입장하기
        </Button>
      </form>
    </>
  );
}

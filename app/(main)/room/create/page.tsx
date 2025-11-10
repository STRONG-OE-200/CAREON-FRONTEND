"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import api from "@/lib/api";

export default function CreateRoomPage() {
  const router = useRouter();
  const [patient, setPatient] = useState("");
  const [relation, setRelation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/rooms/", {
        patient: patient,
        relation: relation,
      });

      if (response.status === 201) {
        const data = response.data;
        console.log("방 생성 성공", data);
        localStorage.setItem("isOwner", "true");
        localStorage.setItem("currentRoomId", data.id);
        router.push(
          `/room/create/success?code=${data.invite_code}&id=${data.id}`
        );
      } else {
        setError("방 생성에 성공했으나, 알 수 없는 응답입니다.");
      }
    } catch (error: any) {
      console.error("방 생성 오류:", error);

      if (error.response) {
        const errorData = error.response.data;
        console.error("백엔드 에러 메세지 ", errorData);
        if (errorData.patient) {
          //400 에러
          setError(`환자 이름: ${errorData.patient[0]}`);
        } else if (errorData.detail) {
          //401 에러
          setError(errorData.detail);
        } else {
          setError("알 수 없는 서버 오류입니다.");
        }
      } else {
        console.error("네트워크 오류", error);
        setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <>
      <div>
        <h3>방 생성하기</h3>
      </div>
      <main>
        <form onSubmit={handleSubmit}>
          <p>환자 이름</p>
          <Input
            type="text"
            placeholder="환자분의 이름을 입력해주세요"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            required
          />
          <p>환자와의 관계</p>
          <Input
            type="text"
            placeholder="간병하는 환자분과의 관계를 알려주세요 (예: 첫째 딸, 남편)"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            required
          />
          <div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit">방 생성하기</Button>
          </div>
        </form>
      </main>
    </>
  );
}

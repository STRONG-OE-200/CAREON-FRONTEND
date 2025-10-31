"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function CreateRoomPage() {
  const router = useRouter();
  const [patient, setPatient] = useState("");
  const [relation, setRelation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    //로그인 시 저장한 토큰으로 회원인지 확인
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("로그인이 필요합니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patient: patient,
            relation: relation,
          }),
        }
      );

      if (response.status === 201) {
        //성공
        const data = await response.json();
        console.log("방 생성 성공", data);
        router.push(
          `/room/create/success?code=${data.invite_code}&id=${data.id}`
        );
      } else {
        //실패
        console.error("HTTP 에러", response.status);
        const errorData = await response.json();
        console.error("백엔드 에러 메세지 ", errorData);
        if (errorData.patient) {
          //400 에러
          setError(`환자 이름: ${errorData.patient[0]}`);
        } else if (errorData.detail) {
          //401 에러
          setError(errorData.detail);
        }
      }
    } catch (error) {
      //오류
      console.error("네트워크 오류", error);
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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

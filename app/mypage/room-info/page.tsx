"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api"; // 1. (★수정★) fetch 대신 api.ts를 import

// (RoomInfo, Member 타입 정의는 동일)
type RoomInfo = {
  patient: string;
  inviteCode: string;
  owner: Member | null;
  members: Member[];
};

type Member = {
  user_id: number;
  user_name: string;
  relation: string;
  role: "OWNER" | "MEMBER";
};

// (LoadingSpinner 함수는 동일)
function LoadingSpinner() {
  return <div className="p-8 text-center">방 정보를 불러오는 중...</div>;
}

export default function RoomInfoPage() {
  const router = useRouter();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const roomId = localStorage.getItem("currentRoomId");

    // (로그인/방 ID 체크 로직은 동일)
    if (!token || !roomId) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const fetchRoomData = async () => {
      try {
        // 2. (★수정★) Promise.all로 api.get 2개 동시 호출
        // (Authorization 헤더는 api.ts가 자동으로 넣어줌)
        const [roomDetailRes, membersRes] = await Promise.all([
          api.get(`/rooms/${roomId}/`),
          api.get(`/rooms/${roomId}/members/`),
        ]);

        // 3. (★수정★) axios는 .data로 바로 JSON 객체를 반환
        const roomDetail = roomDetailRes.data;
        const membersList: Member[] = membersRes.data;

        // (데이터 조합 로직은 동일)
        const owner = membersList.find((m) => m.role === "OWNER") || null;
        const members = membersList.filter((m) => m.role === "MEMBER");

        setRoomInfo({
          patient: roomDetail.patient,
          inviteCode: roomDetail.invite_code,
          owner: owner,
          members: members,
        });
      } catch (err: any) {
        // 4. (★수정★) axios의 에러 핸들링
        // (4xx, 5xx 에러가 모두 catch로 잡힘)
        if (err.response && err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError(err.message || "오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [router]);

  //(방 나가기, 멤버 내보내기 함수 주석 - 동일)

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // (return JSX 부분은 Button/Link import가 없으므로 동일)
  return (
    <div>
      <h1>우리 방 정보</h1>

      {roomInfo ? (
        <div>
          {/* 환자명, 환자코드 */}
          <div>
            <label>환자명</label>
            <p>{roomInfo.patient}</p>
          </div>
          <div>
            <label>환자코드</label>
            <p>{roomInfo.inviteCode}</p>
          </div>

          {/* 방장 */}
          {roomInfo.owner && (
            <div>
              <label>방장</label>
              <p>
                {roomInfo.owner.relation} {roomInfo.owner.user_name}
              </p>
            </div>
          )}

          {/* 멤버 */}
          <div>
            <label>팀원</label>
            {roomInfo.members.length > 0 ? (
              roomInfo.members.map((member) => (
                <div key={member.user_id}>
                  <p>
                    {member.relation} {member.user_name}
                  </p>
                </div>
              ))
            ) : (
              <p>참여한 팀원이 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <p>방 정보를 불러오지 못했습니다.</p>
      )}
    </div>
  );
}

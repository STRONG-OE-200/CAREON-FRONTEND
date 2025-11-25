"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAlert } from "@/lib/AlertContext";

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

function LoadingSpinner() {
  return <div className="p-8 text-center">방 정보를 불러오는 중...</div>;
}

export default function RoomInfoPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const roomId = localStorage.getItem("currentRoomId");

    if (!token || !roomId) {
      showAlert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const fetchRoomData = async () => {
      try {
        const [roomDetailRes, membersRes] = await Promise.all([
          api.get(`/rooms/${roomId}/`),
          api.get(`/rooms/${roomId}/members/`),
        ]);

        const roomDetail = roomDetailRes.data;
        const membersList: Member[] = membersRes.data;

        const owner = membersList.find((m) => m.role === "OWNER") || null;
        const members = membersList.filter((m) => m.role === "MEMBER");

        const currentUserId = localStorage.getItem("myUserId");

        if (
          owner &&
          currentUserId &&
          owner.user_id.toString() === currentUserId
        ) {
          setIsOwner(true);
        }

        setRoomInfo({
          patient: roomDetail.patient,
          inviteCode: roomDetail.invite_code,
          owner: owner,
          members: members,
        });
      } catch (err: any) {
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <h1 className="text-[22px] text-ex-purple font-medium text-center mt-7">
        돌봄온
      </h1>
      <div className="px-5 pt-5">
        <h2 className="text-xl">우리 방 정보</h2>
        <hr className="border-t border-bg-purple w-[350px] pb-5" />
        {roomInfo ? (
          <div className="p-5 m-5 gap-y-5 gap-x-8 rounded-2xl grid grid-cols-3 items-center bg-btn-white shadow shadow-bg-purple">
            <label className="text-base">환자명</label>
            <p className="text-base col-span-2">{roomInfo.patient}</p>
            <label className="text-base">환자코드</label>
            <p className="text-base col-span-2">{roomInfo.inviteCode}</p>
            {roomInfo.owner && (
              <>
                <label className="text-base">방장</label>
                <p className="text-base col-span-2">
                  {roomInfo.owner.relation} {roomInfo.owner.user_name}
                </p>
              </>
            )}
            <label className="text-base self-start">구성원</label>
            <div className="col-span-2">
              {roomInfo.members.length > 0 ? (
                roomInfo.members.map((member) => (
                  <div key={member.user_id}>
                    <p className="text-base">
                      {member.relation} {member.user_name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-base">참여한 구성원이 없습니다.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-base">방 정보를 불러오지 못했습니다.</p>
        )}
      </div>
      <div className="flex flex-col mx-10 my-7 gap-5 text-base">
        {isOwner ? (
          <>
            <Link href="/mypage/sendout/" className="text-lg">
              구성원 내보내기
            </Link>
            <Link href="/mypage/delete-room/" className="text-red-500 text-lg">
              방 삭제하기
            </Link>
          </>
        ) : (
          <>
            <Link href="/mypage/leave-room/" className="text-lg">
              방 나가기
            </Link>
          </>
        )}
      </div>
    </>
  );
}

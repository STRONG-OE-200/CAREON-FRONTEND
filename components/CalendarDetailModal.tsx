"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import api from "@/lib/api";
import { format } from "date-fns";
import Image from "next/image";
import { MEMBER_COLORS } from "@/lib/colors";
import { useAlert } from "@/lib/AlertContext";

const MEMBER_COLOR_ARRAY = Object.values(MEMBER_COLORS);

type Props = {
  eventId: number | null;
  onClose: (didSubmit: boolean) => void;
  roomId: string;
};

type Member = { user_id: number; user_name: string };

export default function CalendarDetailModal({
  eventId,
  onClose,
  roomId,
}: Props) {
  const { showAlert } = useAlert();
  const [event, setEvent] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]); // 수정 시 담당자 선택용

  // --- 수정용 State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [memberColorMap, setMemberColorMap] = useState<Record<number, string>>(
    {}
  );

  // 데이터 로드
  useEffect(() => {
    if (eventId) {
      setIsEdit(false);
      const fetchData = async () => {
        try {
          // 1) 상세 정보
          const res = await api.get(`/calendar/events/${eventId}/`);
          const data = res.data;
          console.log("상세 조회 데이터:", data);
          console.log("첨부파일 목록:", data.attachments);
          setEvent(data);

          // State 초기화
          setTitle(data.title);
          setDescription(data.description || "");
          setDate(data.date); // "2025-11-05"
          setIsAllDay(data.is_all_day);
          setAssigneeId(data.assignee ? data.assignee.id : null);

          // 시간 파싱 (ISO -> "09:00")
          if (data.start_at)
            setStartTime(format(new Date(data.start_at), "HH:mm"));
          if (data.end_at) setEndTime(format(new Date(data.end_at), "HH:mm"));

          // 멤버 목록 (수정 대비)
          const memRes = await api.get(`/rooms/${roomId}/members/`);
          setMembers(memRes.data);

          const colorMap: Record<number, string> = {};
          memRes.data.forEach((member: any, index: number) => {
            const colorIndex = member.membership_index ?? index;
            colorMap[member.user_id] = `#${
              MEMBER_COLOR_ARRAY[colorIndex % MEMBER_COLOR_ARRAY.length]
            }`;
          });
          setMemberColorMap(colorMap);
        } catch (err) {
          console.error("상세 로드 실패:", err);
        }
      };
      fetchData();
    }
  }, [eventId, roomId]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/calendar/events/${eventId}`);
      showAlert("삭제되었습니다.");
      onClose(true);
    } catch (err) {
      showAlert("삭제 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      // 시간 재조립
      const startAt = new Date(`${date}T${startTime}:00`).toISOString();
      const endAt = new Date(`${date}T${endTime}:00`).toISOString();

      await api.patch(`/calendar/events/${eventId}`, {
        title,
        description,
        date,
        start_at: startAt,
        end_at: endAt,
        is_all_day: isAllDay,
        assignee_id: assigneeId,
      });
      showAlert("수정되었습니다.");
      onClose(true);
    } catch (err) {
      console.error(err);
      showAlert("수정 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  return (
    <Modal isOpen={!!eventId} onClose={() => onClose(false)}>
      <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* --- 상단 헤더 (제목/날짜/버튼) --- */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEdit ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium mb-2"
              />
            ) : (
              <h2 className="text-xl font-medium text-gray-900">
                {event.title}
              </h2>
            )}

            {/* 날짜/시간 표시 or 수정 */}
            {isEdit ? (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="p-1 border rounded"
                  />
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                    />{" "}
                    종일
                  </label>
                </div>
                {!isAllDay && (
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="p-1 border rounded"
                    />
                    ~
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="p-1 border rounded"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray mt-1">
                {event.is_all_day ? (
                  // 1. 종일일 때: "11월 5일 (종일)"
                  <span>
                    {format(new Date(event.start_at), "M월 d일")}
                    <span className="font-medium">(종일)</span>
                  </span>
                ) : (
                  // 2. 시간 지정일 때: "11월 5일 09:00 ~ 10:00"
                  <span>
                    {format(new Date(event.start_at), "M월 d일 HH:mm")}~
                    {format(new Date(event.end_at), "HH:mm")}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* --- 설명 (메모) --- */}
        <div>
          {isEdit ? (
            <textarea
              className="w-full bg-transparent focus:outline-none resize-none h-10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={50}
              placeholder="메모를 입력해주세요 (선택)"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {event.description || "메모가 없습니다."}
            </p>
          )}
        </div>

        {/* --- 담당자 --- */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">담당자</span>
          {isEdit ? (
            <select
              value={assigneeId || ""}
              onChange={(e) => setAssigneeId(Number(e.target.value) || null)}
              className="border p-1 rounded"
            >
              <option value="">지정 안 함</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.user_name}
                </option>
              ))}
            </select>
          ) : // [수정] 읽기 모드 - 색상 뱃지 적용
          event.assignee ? (
            <span
              className="px-2 py-0.5 rounded-full text-gray-900 font-medium"
              style={{
                backgroundColor: memberColorMap[event.assignee.id] || "#E0E0E0",
              }}
            >
              {event.assignee.name}
            </span>
          ) : (
            <span className="text-sm text-gray">미지정</span>
          )}
        </div>

        {/* --- 첨부 파일 (이미지/오디오 구분) --- */}
        {event.attachments && event.attachments.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-gray-600 mb-2">첨부 파일</p>
            <div className="flex flex-col gap-3">
              {event.attachments.map((file: any) => {
                // 1. 이미지인 경우
                if (file.type === "IMAGE") {
                  return (
                    <div
                      key={file.id}
                      className="relative w-full h-48 border rounded-lg overflow-hidden"
                    >
                      <a href={file.url} target="_blank" rel="noreferrer">
                        <Image
                          src={file.url}
                          alt="첨부 이미지"
                          fill
                          className="object-cover"
                        />
                      </a>
                    </div>
                  );
                }
                // 2. 오디오인 경우 (플레이어 표시)
                else if (file.type === "AUDIO") {
                  return (
                    <div key={file.id} className="w-full">
                      <audio controls className="w-full">
                        <source src={file.url} />
                        브라우저가 오디오 재생을 지원하지 않습니다.
                      </audio>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
        {/* 버튼 그룹 */}
        <div className="flex gap-2 justify-end shrink-0">
          {isEdit ? (
            <button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="text-ex-purple font-bold"
            >
              저장
            </button>
          ) : (
            <>
              <button onClick={() => setIsEdit(true)} className="text-gray">
                수정
              </button>
              <button onClick={handleDelete} className="text-red-500">
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

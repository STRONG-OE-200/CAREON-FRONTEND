"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { format } from "date-fns";
import Image from "next/image";
import { ko } from "date-fns/locale/ko";
import { useAlert } from "@/lib/AlertContext";

type Props = {
  isOpen: boolean;
  onClose: (didSubmit: boolean) => void;
  roomId: string;
  selectedDate: Date;
};

type Member = {
  user_id: number;
  user_name: string;
};

export default function CalendarCreateModal({
  isOpen,
  onClose,
  roomId,
  selectedDate,
}: Props) {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [date, setDate] = useState(
    selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [repeatRule, setRepeatRule] = useState("NONE");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(format(selectedDate, "yyyy-MM-dd"));
      setTitle("");
      setDescription("");
      setIsAllDay(false);
      setStartTime("09:00");
      setEndTime("10:00");
      setRepeatRule("NONE");
      setRepeatUntil("");
      setAssigneeId(null);
      setSelectedFile(null);

      const fetchMembers = async () => {
        try {
          const res = await api.get(`/rooms/${roomId}/members/`);
          setMembers(res.data);
        } catch (err) {
          console.error("멤버 로드 실패", err);
        }
      };
      fetchMembers();
    }
  }, [isOpen, selectedDate, roomId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title) return showAlert("제목을 입력해주세요.");
    setIsSubmitting(true);

    try {
      // 1. 파일 업로드 (파일이 있는 경우만)
      let attachmentId = null;
      let fileType = "IMAGE"; // 기본값

      if (selectedFile) {
        const formData = new FormData();
        // [확인사항 1] Key 이름: "file"
        formData.append("file", selectedFile);

        // 파일 타입 판별 (MIME type 기반)
        if (selectedFile.type.startsWith("audio")) {
          fileType = "AUDIO";
        }

        // [확인사항 3] URL: "/files/upload/"
        const uploadRes = await api.post("/files/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // [확인사항 2] 응답 ID: "file_id"
        attachmentId = uploadRes.data.file_id;
      }

      //일정생성
      const startAt = new Date(`${date}T${startTime}:00`).toISOString();
      const endAt = new Date(`${date}T${endTime}:00`).toISOString();

      const payload = {
        date,
        title,
        description,
        is_all_day: isAllDay,
        start_at: startAt,
        end_at: endAt,
        repeat_rule: repeatRule,
        repeat_until: repeatRule !== "NONE" ? repeatUntil : null,
        assignee_id: assigneeId,
        attachments: attachmentId
          ? [{ file_id: attachmentId, type: fileType }]
          : [],
        room_id: roomId,
      };

      await api.post(`/rooms/${roomId}/calendar/events/`, payload);
      showAlert("일정이 등록되었습니다.");
      onClose(true);
    } catch (err: any) {
      console.error(err);
      showAlert(err.response?.data?.message || "일정 등록 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 날짜 포맷 (11월 5일 수요일)
  const formattedDateHeader = format(new Date(date), "M월 d일 EEEE", {
    locale: ko,
  });

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <div className="p-5 space-y-6">
        {/* 1. 헤더: 날짜 & 제목 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            {formattedDateHeader}
          </h2>

          <div className="flex items-center gap-3 pl-1">
            {/* 제목 아이콘 (보라색 바) */}
            <div className="w-1 h-6 bg-sub-purple rounded-full"></div>
            <input
              type="text"
              placeholder="일정 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 2. 시간 설정 (종일 토글 & 시간 입력) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/log-time.svg"
                alt="시간"
                width={20}
                height={20}
                className="opacity-50"
              />
              <span className="text-gray-600 font-medium">종일</span>
            </div>
            {/* 토글 스위치 UI */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
            </label>
          </div>

          {!isAllDay && (
            <div className="flex justify-between items-center pl-7 text-gray-800">
              <div className="flex flex-col">
                <span className="text-xs text-gray mb-1">시작</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="font-medium focus:outline-none"
                />
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray mb-1">종료</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="font-medium focus:outline-none text-right"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. 반복 설정 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/cal-repeat.svg"
              alt="반복"
              width={20}
              height={20}
              className="opacity-50"
            />
            <span className="text-gray-600 font-medium">반복하기</span>
          </div>
          <select
            value={repeatRule}
            onChange={(e) => setRepeatRule(e.target.value)}
            className="text-gray-500 bg-transparent focus:outline-none text-right cursor-pointer"
          >
            <option value="NONE">반복 안 함</option>
            <option value="WEEKLY">매주</option>
            <option value="MONTHLY">매월</option>
          </select>
        </div>

        <hr className="border-gray-100" />

        {/* 4. 설명 & 파일 */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Image
              src="/log-memo.svg"
              alt="메모"
              width={20}
              height={20}
              className="opacity-50 mt-1"
            />
            <div className="flex-1">
              <span className="text-gray-600 font-medium block mb-2">
                설명 추가
              </span>
              <textarea
                placeholder="50자 이내의 설명을 작성하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={50}
                className="w-full text-sm text-gray placeholder-gray bg-transparent resize-none focus:outline-none h-16"
              />
              {/* 파일 업로드 버튼 */}
              <div className="flex justify-end mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray">
                  <span>파일 업로드</span>
                  <span>사진</span>
                  <span>녹음</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,audio/*"
                  />
                </label>
              </div>
              {selectedFile && (
                <p className="text-xs text-blue-500 text-right mt-1">
                  {selectedFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 5. 담당자 */}
        <div className="flex items-center gap-2">
          <Image
            src="/cal-person.svg"
            alt="담당자"
            width={20}
            height={20}
            className="opacity-50"
          />
          <span className="text-gray-600 font-medium mr-auto">담당자</span>

          <select
            value={assigneeId || ""}
            onChange={(e) => setAssigneeId(Number(e.target.value) || null)}
            className="text-gray-500 bg-transparent focus:outline-none text-right cursor-pointer max-w-[150px]"
          >
            <option value="">지정 안 함</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.user_name}
              </option>
            ))}
          </select>
        </div>

        {/* 하단 저장 버튼 */}
        <div className="pt-4 flex justify-end gap-4 text-sm font-medium">
          <button
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            수정
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-gray-900 hover:text-black"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import api from "@/lib/api";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import Image from "next/image";

// "08:30:00" -> "오전 8:30"
const formatLogTime = (timeOnly: string | null | undefined) => {
  if (!timeOnly) {
    return "시간 없음";
  }
  try {
    const [hour, minute] = timeOnly.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return format(date, "aaa h:mm", { locale: ko });
  } catch {
    return "시간 오류";
  }
};

type LogDetail = {
  id: number;
  room_id: number;
  metric: number;
  metric_label: string;
  author_id: number;
  content: string;
  memo: string | null;
  time_only: string;
  date_only: string;
  created_at: string;
};

type ModalProps = {
  logId: number | null; //
  onClose: (didSubmit: boolean) => void;
  metricMap: Record<number, string>; //
  roomId: string; //
};

export default function LogDetailModal({
  logId,
  onClose,
  metricMap,
  roomId,
}: ModalProps) {
  const [logData, setLogData] = useState<LogDetail | null>(null);
  const [loggerName, setLoggerName] = useState("로딩 중..."); //
  const [isEditMode, setIsEditMode] = useState(false);
  const [logTime, setLogTime] = useState("");
  const [logDate, setLogDate] = useState("");
  const [logContent, setLogContent] = useState("");
  const [logMemo, setLogMemo] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. logId가 바뀌면 상세 데이터 + 로그 기록자 이름(Assumption) 가져오기
  useEffect(() => {
    const name = localStorage.getItem("name");
    setLoggerName(name || "사용자");

    if (logId) {
      const fetchLogDetail = async () => {
        setIsSubmitting(true);
        setError("");
        setIsEditMode(false); //
        try {
          const response = await api.get<LogDetail>(`/logs/${logId}/`);
          const data = response.data;
          setLogData(data);
          setLogDate(data.date_only);
          setLogTime(data.time_only.substring(0, 5)); // "08:30:00" -> "08:30"
          setLogContent(data.content);
          setLogMemo(data.memo || "");
        } catch (err) {
          setError("로그 상세 정보를 불러오는 데 실패했습니다.");
        } finally {
          setIsSubmitting(false);
        }
      };
      fetchLogDetail();
    }
  }, [logId]);

  // 2. "저장" (수정) 버튼 클릭
  const handleUpdate = async () => {
    if (!logId) return;

    const payload = {
      // [API 가정] 'PATCH /logs/{id}/'
      content: logContent,
      memo: logMemo || null,
      time_only: `${logTime}:00`,
      date_only: logDate,
    };

    setIsSubmitting(true);
    setError("");
    try {
      await api.patch(`/logs/${logId}/`, payload);
      onClose(true); // 성공 (새로고침)
    } catch (err: any) {
      console.error("로그 수정 실패:", err);
      setError(err.response?.data?.detail || "수정에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  // 3. "삭제" 버튼 클릭
  const handleDelete = async () => {
    if (!logId) return;
    if (!window.confirm("이 로그를 정말 삭제하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      // [API 가정] 'DELETE /logs/{id}/'
      await api.delete(`/logs/${logId}/`);
      onClose(true); // 성공 (새로고침)
    } catch (err: any) {
      console.error("로그 삭제 실패:", err);
      setError(err.response?.data?.detail || "삭제에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  if (!logId || !logData) return null; //

  // '11월 5일 수요일' 형식
  const displayDate = format(new Date(logDate), "M월 d일 EEEE", { locale: ko });
  // '체온', '혈압' 등
  const metricLabel =
    metricMap[logData.metric] || logData.metric_label || "알 수 없음";
  return (
    <Modal isOpen={!!logId} onClose={() => onClose(false)}>
      <div className="flex flex-col space-y-6 p-4">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-6 bg-sub-purple rounded-full"></span>
          <h2 className="text-xl font-medium">{metricLabel}</h2>
        </div>

        <div className="flex items-start space-x-3">
          <Image src="/log-time.svg" height={16} width={16} alt="time" />
          <div className="w-full">
            <p className="font-semibold">시간</p>
            {isEditMode ? (
              <>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="text-gray-700"
                  />
                  <input
                    type="time"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="font-semibold text-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{displayDate}</p>
              </>
            ) : (
              <p className="text-lg text-gray-800">
                {displayDate} {formatLogTime(logData.time_only)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Image src="/log-person.svg" height={16} width={16} alt="data" />
          <div className="w-full">
            <p className="font-semibold">값</p>
            {isEditMode ? (
              <Input
                type="text"
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                required
                className="mt-1"
              />
            ) : (
              <p className="text-lg text-gray-800">{logData.content}</p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Image src="/log-memo.svg" height={16} width={16} alt="memo" />
          <div className="w-full">
            <p className="font-semibold">메모</p>
            {isEditMode ? (
              <Input
                type="text"
                value={logMemo}
                onChange={(e) => setLogMemo(e.target.value)}
                maxLength={50}
                className="mt-1"
              />
            ) : (
              <p className="text-lg text-gray-800">
                {logData.memo || "(메모 없음)"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Image src="/log-person.svg" height={16} width={16} alt="user" />
          <div className="flex justify-between items-center w-full">
            <p className="font-semibold">로그기록자</p>
            <span className="px-4 py-1 bg-gray-200 rounded-full text-sm font-medium">
              {loggerName}
            </span>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-2 justify-end shrink-0">
          {isEditMode ? (
            <button onClick={handleUpdate} disabled={isSubmitting}>
              저장
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditMode(true)} className="text-gray">
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

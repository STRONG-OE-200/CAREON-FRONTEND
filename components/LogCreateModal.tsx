"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import api from "@/lib/api";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";

// 아이콘 (임시)
const TimeIcon = () => <span className="text-gray-400">⊙</span>;
const MemoIcon = () => <span className="text-gray-400">□</span>;
const ContentIcon = () => <span className="text-gray-400">■</span>;
const UserIcon = () => <span className="text-gray-400">○</span>;

type Metric = { id: number; label: string };
type ModalProps = {
  isOpen: boolean;
  onClose: (didSubmit: boolean) => void;
  metric: Metric;
  roomId: string;
};

export default function LogCreateModal({
  isOpen,
  onClose,
  metric,
  roomId,
}: ModalProps) {
  const [logTime, setLogTime] = useState(format(new Date(), "HH:mm"));
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [logContent, setLogContent] = useState("");
  const [logMemo, setLogMemo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggerName, setLoggerName] = useState("로딩 중...");

  useEffect(() => {
    if (isOpen) {
      // 1. State 초기화
      setLogTime(format(new Date(), "HH:mm"));
      setLogDate(format(new Date(), "yyyy-MM-dd"));
      setLogContent("");
      setLogMemo("");
      setError("");

      const name = localStorage.getItem("name"); // 로그인 시 저장한 'name'
      setLoggerName(name || "사용자");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const timeOnly = `${logTime}:00`;
    const payload = {
      metric: metric.id,
      content: logContent,
      memo: logMemo || null,
      time_only: timeOnly,
      date_only: logDate,
    };

    setIsSubmitting(true);
    setError("");
    try {
      await api.post(`/rooms/${roomId}/logs/`, payload);
      onClose(true);
    } catch (err: any) {
      console.error("로그 저장 실패:", err);
      setError(err.response?.data?.detail || "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDate = format(new Date(logDate), "M월 d일 EEEE", { locale: ko });
  if (!metric) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <div className="flex flex-col space-y-6 p-4">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>
          <h2 className="text-2xl font-bold">{metric.label}</h2>
        </div>

        <div className="flex items-start space-x-3">
          <TimeIcon />
          <div className="w-full">
            <p className="font-semibold">시간</p>
            {/* ... (input date, time) ... */}
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
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <ContentIcon />
          <div className="w-full">
            <p className="font-semibold">
              값 (필수)
              {metric.label === "체온" && " (예: 37.5)"}
              {metric.label === "혈압" && " (예: 120/80)"}
            </p>
            <Input
              type="text"
              placeholder="측정값 또는 내용을 입력하세요"
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <MemoIcon />
          <div className="w-full">
            <p className="font-semibold">메모 (선택)</p>
            <Input
              type="text"
              placeholder="부가 설명을 입력하세요 (50자 이내)"
              value={logMemo}
              onChange={(e) => setLogMemo(e.target.value)}
              maxLength={50}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <UserIcon />
          <div className="flex justify-between items-center w-full">
            <p className="font-semibold">로그기록자</p>
            <span className="px-4 py-1 bg-gray-200 rounded-full text-sm font-medium">
              {loggerName}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={() => onClose(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !logContent}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </Modal>
  );
}

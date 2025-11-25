"use client";
import React, { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import api from "@/lib/api";

type ModalProps = {
  isOpen: boolean;
  onClose: (didSubmit: boolean) => void; //
  roomId: string;
};

const PREDEFINED_METRICS = {
  일반: [
    "세면/목욕",
    "배변",
    "혈당",
    "맥박",
    "산소포화도",
    "체중",
    "식사량",
    "수분섭취",
    "피로도",
    "수면 패턴",
    "구토/메스꺼움",
    "운동",
    "근력",
  ],
  "수술 후": ["상처 드레싱", "출혈", "통증", "보행", "회복 상태"],
  치매: ["인지 상태", "행동 변화", "언어 표현", "위생 관리", "안전 관리"],
};

export default function AddMetricModal({
  isOpen,
  onClose,
  roomId,
}: ModalProps) {
  const [customLabel, setCustomLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddMetric = async (label: string) => {
    if (!label) return;

    setIsSubmitting(true);
    setError("");

    try {
      await api.post(`/rooms/${roomId}/metrics/`, {
        label: label,
        // sort_order는 nullable(Y)이므로 생략
      });
      onClose(true); // 성공 (true를 반환하여 LogPage가 새로고침)
    } catch (err: any) {
      console.error("항목 추가 실패:", err);
      // 409 (중복 라벨) 에러 등
      setError(err.response?.data?.detail || "항목 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // "직접 입력" 폼 제출
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddMetric(customLabel);
  };

  // 모달이 닫힐 때 state 초기화
  const handleClose = () => {
    setCustomLabel("");
    setError("");
    onClose(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col space-y-4 p-4">
        <h2 className="text-xl font-bold text-center">항목 추가</h2>

        {Object.entries(PREDEFINED_METRICS).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-lg mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Button
                  key={item}
                  variant="secondary"
                  className="rounded-full !px-3 !py-1.5 text-sm" //
                  onClick={() => handleAddMetric(item)}
                  disabled={isSubmitting}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        ))}

        {/* 기타 - 직접 입력 */}
        <div>
          <h3 className="font-semibold text-lg mb-2">기타</h3>
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="직접 입력"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              추가
            </Button>
          </form>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </div>
    </Modal>
  );
}

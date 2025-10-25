"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type ModalProps = {
  isOpen: boolean; // 모달이 열려있는지 여부
  onClose: () => void; // 모달을 닫는 함수
  children: React.ReactNode; // 모달 안에 들어갈 내용
  className?: string; // 모달 박스에 추가할 스타일
};

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  // isOpen이 false면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  // 모달 박스 기본 스타일
  const modalBoxStyle = "bg-white rounded-lg shadow-xl p-6 w-full max-w-md";

  // props로 받은 className과 기본 스타일을 충돌 없이 합칩니다.
  const mergedModalClassName = twMerge(modalBoxStyle, className);

  return (
    // 1. 검은색 반투명 배경 (Overlay)
    //    클릭하면 onClose 함수가 실행됩니다.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* 2. 실제 모달 콘텐츠 박스 */}
      {/* 이 박스를 클릭해도 모달이 닫히지 않도록 이벤트 전파를 막습니다. */}
      <div
        className={mergedModalClassName}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  const modalBoxStyle = "bg-white rounded-lg shadow-xl p-6 w-full max-w-md";

  // props로 받은 className과 기본 스타일을 충돌 없이 합칩니다
  const mergedModalClassName = twMerge(modalBoxStyle, className);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={mergedModalClassName}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

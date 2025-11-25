"use client";
import React from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

type Props = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
};

export default function AlertModal({ isOpen, message, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 flex flex-col items-center space-y-6 min-w-[300px]">
        {/* 메시지 */}
        <p className="text-main-purple text-md text-center whitespace-pre-wrap">
          {message}
        </p>

        {/* 확인 버튼 */}
        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full !rounded-full"
        >
          확인
        </Button>
      </div>
    </Modal>
  );
}

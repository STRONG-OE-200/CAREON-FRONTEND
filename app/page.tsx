"use client";
import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import ScheduleGrid from "@/components/ScheduleGrid";

export default function Home() {
  const [text, setText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logText, setLogText] = useState("");

  //폼 제출 함수
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      content: logText,
      createdAt: new Date(),
    };

    //fetch나 axios로 백엔드 API에 보내는 걸로 수정
    console.log("백엔드로 보낼 데이터:", formData);
    setLogText("");
  };

  return (
    <>
      <Card>
        <p>let's get this</p>
        <Button variant="primary" onClick={() => alert("확인!")}>
          확인
        </Button>
        <Button variant="secondary" onClick={() => alert("취소!")}>
          취소
        </Button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="간병일지를 입력하세요..."
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
          />
          {/* 8. type="submit"으로 이 버튼이 폼을 제출하는 버튼임을 명시합니다. */}
          <Button type="submit" variant="primary">
            일지 등록하기
          </Button>
        </form>
      </Card>
      <div>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          일지 삭제
        </Button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg font-bold">정말 삭제하시겠습니까?</h3>
          <p className="mt-2">삭제된 데이터는 복구할 수 없습니다.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => alert("삭제됨!")}>
              삭제
            </Button>
          </div>
        </Modal>
      </div>
      <ScheduleGrid />
    </>
  );
}

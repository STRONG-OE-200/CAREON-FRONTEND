"use client";
import React, { useState } from "react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // [0, 1, 2, ... 23]

// --- (★핵심 1★) 부모(page.tsx)로부터 받을 데이터의 타입 정의 ---
// 백엔드가 보내줄 '한 칸'의 정보입니다.
type CellData = {
  isCareNeeded: boolean; // 방장이 설정한 시간인가? (회색)
  availableMembers: { id: string; name: string }[]; // 누가 가능한가? (겹침 확인)
  confirmedMember: { id: string; name: string } | null; // 방장이 확정했는가? (초록색)
};

// '마스터 그리드'는 이 CellData의 7x24 배열입니다.
type ScheduleGridProps = {
  masterGrid: CellData[][]; // 7x24 '마스터 그리드' 데이터
  myUserId: string; // "나"의 ID (내 시간을 파란색으로 칠하기 위해)
  onCellClick: (dayIndex: number, hourIndex: number) => void; // 클릭 알림 함수
};

// --- ScheduleGrid 컴포넌트 시작 ---
// (★핵심 2★) useState가 없고, props로 모든 것을 받습니다.
export default function ScheduleGrid({
  masterGrid,
  myUserId,
  onCellClick,
}: ScheduleGridProps) {
  // (방어 코드) masterGrid 데이터가 없으면 로딩 중을 표시
  if (!masterGrid) {
    return <div className="p-8 text-center">스케줄을 불러오는 중입니다...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="grid grid-cols-8 gap-1">
        {/* --- 헤더 (요일) --- */}
        <div />
        {DAYS.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}

        {/* --- 본문 (★핵심 3★: 렌더링 로직) --- */}
        {HOURS.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            {/* 시간 표시 */}
            <div className="text-xs text-right text-gray-500 pr-1 h-8">
              {hour}
            </div>

            {/* 실제 클릭될 셀 (7일) */}
            {DAYS.map((day, dayIndex) => {
              // props로 받은 '마스터 그리드'에서 현재 칸의 데이터를 꺼냅니다.
              // (방어 코드: cell이 없을 경우 대비)
              const cell = masterGrid[dayIndex]?.[hourIndex];

              if (!cell) {
                // 데이터가 비정상적일 경우 빈 칸으로 렌더링
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="border h-8 w-full bg-red-100"
                  />
                );
              }

              // 이 칸을 클릭할 수 있는지 결정 (방장이 설정한 시간일 때만)
              const isClickable = cell.isCareNeeded;

              // (★핵심 4★) 기획 1~5번에 맞춘 배경색 로직
              let bgColor = "bg-white"; // 기본
              if (cell.isCareNeeded) bgColor = "bg-gray-200"; // F1: 방장 설정 (회색)
              if (cell.availableMembers.length === 1) bgColor = "bg-yellow-300"; // F3: 1명 (노랑)
              if (cell.availableMembers.length >= 2) bgColor = "bg-pink-300"; // F3: 겹침 (분홍)

              // F5: '내'가 선택한 시간인지 확인
              const isMySlot = cell.availableMembers.some(
                (member) => member.id === myUserId
              );
              if (isMySlot) bgColor = "bg-blue-500"; // F2/F5: 내 시간 (파랑)

              if (cell.confirmedMember) bgColor = "bg-green-500"; // F4: 방장 확정 (초록)

              return (
                <div
                  key={`${day}-${hour}`}
                  // (★핵심 5★) 클릭하면 부모(page.tsx)에게 알림
                  onClick={() =>
                    isClickable && onCellClick(dayIndex, hourIndex)
                  }
                  className={`
                    border h-8 w-full
                    transition-colors duration-100
                    ${bgColor}
                    ${
                      isClickable
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-70"
                    }
                  `}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRoom } from "@/lib/RoomContext";
import api from "@/lib/api";
import Button from "@/components/Button";
import CalendarCreateModal from "@/components/CalendarCreateModal";
import CalendarDetailModal from "@/components/CalendarDetailModal";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { MEMBER_COLORS } from "@/lib/colors";

const MEMBER_COLOR_ARRAY = Object.values(MEMBER_COLORS);

// API 응답 타입 (EventSummary)
type CalendarEvent = {
  id: number;
  date: string; // "2025-11-05"
  title: string;
  start_at: string; // ISO String
  end_at: string;
  assignee: { id: number; name: string } | null;
};

export default function CalendarPage() {
  const { roomId } = useRoom();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeMonth, setActiveMonth] = useState(new Date());

  const [dailyEvents, setDailyEvents] = useState<CalendarEvent[]>([]);
  const [monthlyMarkers, setMonthlyMarkers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 모달 State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [memberColorMap, setMemberColorMap] = useState<Record<number, string>>(
    {}
  );

  // 멤버 목록 불러오기 & 색상 맵핑
  useEffect(() => {
    if (!roomId) return;
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}/members/`);
        const members: any[] = res.data;

        const colorMap: Record<number, string> = {};
        members.forEach((member, index) => {
          // API에 membership_index가 없으면 배열 순서(index) 사용
          const colorIndex = member.membership_index ?? index;
          colorMap[member.user_id] = `#${
            MEMBER_COLOR_ARRAY[colorIndex % MEMBER_COLOR_ARRAY.length]
          }`;
        });
        setMemberColorMap(colorMap);
      } catch (err) {
        console.error("멤버 로드 실패:", err);
      }
    };
    fetchMembers();
  }, [roomId]);

  // 1. 월(Month) 변경 시: 한달치 일정을 가져와서 '점(Mark)' 찍을 날짜 계산
  const fetchMonthlyMarkers = useCallback(async () => {
    if (!roomId) return;
    try {
      const startDate = format(startOfMonth(activeMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(activeMonth), "yyyy-MM-dd");

      const response = await api.get(
        `/rooms/${roomId}/calendar/events/?start_date=${startDate}&end_date=${endDate}`
      );

      const events: CalendarEvent[] = response.data.events;
      const datesWithEvents = new Set(events.map((e) => e.date));
      setMonthlyMarkers(datesWithEvents);
    } catch (err) {
      console.error("월간 일정 로드 실패:", err);
    }
  }, [roomId, activeMonth]);

  // 일간 일정 가져오기
  const fetchDailyEvents = useCallback(async () => {
    if (!roomId) return;
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await api.get(
        `/rooms/${roomId}/calendar/events/?date=${dateStr}&include_time=true`
      );
      setDailyEvents(response.data.events);
    } catch (err) {
      console.error("일간 일정 로드 실패:", err);
      setDailyEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, selectedDate]);

  useEffect(() => {
    fetchMonthlyMarkers();
  }, [fetchMonthlyMarkers]);

  useEffect(() => {
    fetchDailyEvents();
  }, [fetchDailyEvents]);

  //모달 닫힐 때 모두 새로고침
  const handleCloseCreate = (didSubmit: boolean) => {
    setIsCreateModalOpen(false);
    if (didSubmit) {
      fetchDailyEvents(); // 오늘 목록 갱신
      fetchMonthlyMarkers(); // 월간 점 갱신 (반복 일정 포함 여부 확인)
    }
  };

  const handleCloseDetail = (didSubmit: boolean) => {
    setSelectedEventId(null);
    if (didSubmit) {
      fetchDailyEvents();
      fetchMonthlyMarkers();
    }
  };

  return (
    <>
      <div className="p-4 mt-8">
        {/* 캘린더 */}
        <div className="p-2">
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) setActiveMonth(activeStartDate);
            }}
            locale="ko-KR"
            calendarType="gregory"
            formatDay={(locale, date) => format(date, "d")}
            // 점(Mark) 찍기
            tileContent={({ date, view }) => {
              if (view === "month") {
                const dateStr = format(date, "yyyy-MM-dd");
                if (monthlyMarkers.has(dateStr)) {
                  return (
                    <div className="flex justify-center w-full mt-1">
                      {/* 굵은 밑줄 스타일 */}
                      <div className="w-8 h-1.5 bg-sub-purple rounded-full opacity-80"></div>
                    </div>
                  );
                }
              }
              return null;
            }}
          />
        </div>

        {/* 일정 추가 버튼 */}
        <Button
          variant="secondary"
          className="w-full rounded-full h-12 text-lg mb-6"
          onClick={() => setIsCreateModalOpen(true)}
        >
          {format(selectedDate, "M월 d일")} 일정 생성하기
        </Button>

        {/* 일간 리스트 */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500 py-4">
              일정을 불러오는 중...
            </p>
          ) : dailyEvents.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400 mb-2">예정된 일정이 없습니다</p>
            </div>
          ) : (
            dailyEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 p-4 rounded-xl shadow-sm border border-gray-100"
                onClick={() => setSelectedEventId(event.id)}
              >
                {/* 시간 표시 */}
                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-gray-100 pr-4">
                  {event.is_all_day ? (
                    // 1. 종일일 때
                    <span className="text-sm font-medium">종일</span>
                  ) : (
                    // 2. 시간 지정일 때
                    <>
                      <span className="text-sm font-bold text-gray-800">
                        {format(new Date(event.start_at), "HH:mm")}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {format(new Date(event.end_at), "HH:mm")}
                      </span>
                    </>
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1">
                  <h3 className="text-lg text-gray-800 mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2">
                    {event.assignee && (
                      <span
                        className="text-sm px-2 py-0.5 rounded-full text-gray-900 font-medium"
                        style={{
                          backgroundColor:
                            memberColorMap[event.assignee.id] || "#E0E0E0",
                        }}
                      >
                        {event.assignee.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 모달들 */}
      <CalendarCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        roomId={roomId}
        selectedDate={selectedDate}
      />
      <CalendarDetailModal
        eventId={selectedEventId}
        onClose={handleCloseDetail}
        roomId={roomId}
      />
    </>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useRoom } from "@/lib/RoomContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import LogCreateModal from "@/components/LogCreateModal";
import AddMetricModal from "@/components/AddMetricModal";
import LogDetailModal from "@/components/LogDetailModal";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { useAlert } from "@/lib/AlertContext";

type Metric = {
  id: number;
  label: string;
  sort_order: number;
};
type Log = {
  id: number;
  metric: number;
  metric_label: string;
  author_id: number;
  content: string;
  memo: string | null;
  time_only: string;
  date_only: string;
};

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

// new Date() -> "2025년 11월 5일"
const formatCurrentDate = (date: Date) => {
  return format(date, "yyyy년 M월 d일", { locale: ko });
};

//메인 컴포넌트
export default function LogPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const { roomId } = useRoom();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
  const [trackedMetrics, setTrackedMetrics] = useState<Metric[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [metricMap, setMetricMap] = useState<Record<number, string>>({});
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterMetricId, setFilterMetricId] = useState<number | null>(null);

  const fetchAllData = async () => {
    if (!roomId) return;
    setIsLoading(true);
    try {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const [logsRes, metricsRes] = await Promise.all([
        api.get(`/rooms/${roomId}/logs?date=${dateStr}`),
        api.get(`/rooms/${roomId}/metrics/`),
      ]);

      setLogs(logsRes.data.items);

      const metrics: Metric[] = metricsRes.data.items;
      const sortedMetrics = metrics.sort((a, b) => a.sort_order - b.sort_order);
      setTrackedMetrics(sortedMetrics);
    } catch (err) {
      console.error("로그/항목 로드 실패:", err);
      setLogs([]);
      setTrackedMetrics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [roomId, currentDate]);

  // "로그 생성" 모달 열기 (상단 항목 버튼 클릭 시)
  const handleOpenLogModal = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsLogModalOpen(true);
  };

  // "항목 추가" 모달 열기 (상단 '+' 버튼 클릭 시)
  const handleOpenAddMetricModal = () => {
    setIsAddMetricModalOpen(true);
  };

  // "로그 생성" 모달 닫기
  const handleCloseLogModal = (didSubmit: boolean) => {
    setIsLogModalOpen(false);
    if (didSubmit) {
      fetchAllData(); // (새로고침)
    }
  };

  // "항목 추가" 모달 닫기
  const handleCloseAddMetricModal = (didSubmit: boolean) => {
    setIsAddMetricModalOpen(false);
    if (didSubmit) {
      fetchAllData(); // (새로고침)
    }
  };

  // 하단 보라색 '+' 버튼 클릭 핸들러
  const handlePlusClick = () => {
    if (filterMetricId) {
      const metric = trackedMetrics.find((m) => m.id === filterMetricId);
      if (metric) {
        handleOpenLogModal(metric);
      }
    } else {
      showAlert(
        "상단에서 로그를 등록할 항목(예: 체온, 혈압)을 먼저 선택해주세요."
      );
    }
  };

  const handleCloseDetailModal = (didSubmit: boolean) => {
    setSelectedLogId(null);
    if (didSubmit) {
      fetchAllData(); // (수정/삭제가 발생했으므로 새로고침)
    }
  };

  const handleDateChange = (daysToAdd: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + daysToAdd);
      return newDate;
    });
  };

  const filteredLogs = logs.filter(
    (log) => filterMetricId === null || log.metric === filterMetricId
  );

  return (
    <>
      <h1 className="text-center text-ex-purple text-[22px] font-semibold mt-4 mb-2">
        돌봄온
      </h1>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <button onClick={() => handleDateChange(-1)}>
            <Image src="/log-left.svg" width={12} height={12} alt="yesterday" />
          </button>
          <h1 className="text-xl font-medium mb-4 text-main-purple">
            {formatCurrentDate(currentDate)}
          </h1>
          <button
            onClick={() => handleDateChange(1)} //
          >
            <Image src="/log-right.svg" width={12} height={12} alt="tomorrow" />
          </button>
        </div>

        <div className="flex space-x-2 mb-6">
          <Button
            variant={filterMetricId === null ? "primary" : "secondary"}
            onClick={() => setFilterMetricId(null)}
            className={
              filterMetricId === null
                ? "text-main-purple rounded-full font-medium"
                : "text-gray rounded-full font-medium"
            }
          >
            전체
          </Button>

          {/* 동적 항목 버튼 (필터 기능) */}
          {trackedMetrics.map((metric) => (
            <Button
              key={metric.id}
              variant={filterMetricId === metric.id ? "primary" : "secondary"}
              onClick={() => setFilterMetricId(metric.id)}
              className={
                filterMetricId === metric.id
                  ? "text-main-purple rounded-full font-medium"
                  : "text-gray rounded-full font-medium"
              }
            >
              {metric.label}
            </Button>
          ))}

          {/* '항목 추가' (+) 버튼 */}
          {trackedMetrics.length < 4 && (
            <Button
              variant="secondary"
              onClick={handleOpenAddMetricModal}
              className="rounded-full w-12 h-12 flex-shrink-0 text-gray font-medium"
            >
              +
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-gray-500">로그를 불러오는 중...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-gray-500">기록된 로그가 없습니다.</p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center border-b border-bg-purple pt-2 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedLogId(log.id)}
              >
                <div className="border-l-2 border-main-purple h-7 mr-4"></div>

                <div className="flex gap-2 items-center w-20">
                  <span className="font-medium text-gray">
                    {formatLogTime(log.time_only).split(" ")[0]}
                  </span>
                  <span className="font-medium text-gray">
                    {formatLogTime(log.time_only).split(" ")[1]}
                  </span>
                </div>
                <div className="flex-1 pl-16">
                  <p>{log.metric_label || "알 수 없음"}</p>
                  {/* {log.memo && (
                    <p className="text-sm text-gray-500">{log.memo}</p>
                  )} */}
                </div>
                <div className="flex pr-5">
                  <p>{log.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* '로그 추가' (+) 버튼 */}
        <div className="flex justify-center my-6">
          <button
            onClick={handlePlusClick}
            className="w-12 h-12 flex items-center justify-center rounded-full text-3xl"
          >
            <Image src="/log-plus.svg" width={24} height={24} alt="add" />
          </button>
        </div>

        <Button
          variant="secondary"
          onClick={() => setIsChartModalOpen(true)}
          className="fixed bottom-28 w-88"
        >
          체온, 혈압 기록 차트로 보기
        </Button>
      </div>

      {/* --- 모달 렌더링 --- */}
      <LogCreateModal
        isOpen={isLogModalOpen && selectedMetric != null}
        onClose={handleCloseLogModal}
        metric={selectedMetric!}
        roomId={roomId}
      />
      <AddMetricModal
        isOpen={isAddMetricModalOpen}
        onClose={handleCloseAddMetricModal}
        roomId={roomId}
      />
      <LogDetailModal
        logId={selectedLogId}
        onClose={handleCloseDetailModal}
        metricMap={metricMap}
        roomId={roomId}
      />

      <Modal
        isOpen={isChartModalOpen}
        onClose={() => {
          setIsChartModalOpen(false);
        }}
      >
        <div className="flex justify-between px-5">
          <Button
            onClick={() => {
              router.push(`/room/${roomId}/log/chart/temperature`);
            }}
          >
            체온 차트 보기
          </Button>
          <Button
            onClick={() => {
              router.push(`/room/${roomId}/log/chart/bloodpressure`);
            }}
          >
            혈압 차트 보기
          </Button>
        </div>
      </Modal>
    </>
  );
}

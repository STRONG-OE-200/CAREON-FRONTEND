"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "@/lib/RoomContext";
import api from "@/lib/api";
import { format, subDays, startOfDay } from "date-fns";
import ko from "date-fns/locale/ko";
import Button from "@/components/Button";
import "@/lib/chartConfig";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

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

type Metric = { id: number; label: string; sort_order: number };

//헬퍼 함수
const formatLogTime = (timeOnly: string) => {
  try {
    const [hour, minute] = timeOnly.split(":");
    return `${hour}:${minute}`; // "HH:mm"
  } catch {
    return "오류";
  }
};

const formatDateShort = (date: Date) => {
  return format(date, "M.d(EEE)", { locale: ko }); // "11.2(일)"
};

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        stepSize: 0.5, // 0.5도 단위
      },
    },
  },
  plugins: {
    legend: {
      display: false, // 범례 숨기기
    },
  },
};

//메인 컴포넌트
export default function TemperatureChartPage() {
  const router = useRouter();

  const { roomId } = useRoom();
  const [dailyData, setDailyData] = useState<Log[]>([]);
  const [weeklyAvg, setWeeklyAvg] = useState<{
    labels: string[];
    data: number[];
  }>({
    labels: [],
    data: [],
  });
  const [tempMetricId, setTempMetricId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // 1. "체온" 항목의 metric_id 찾기
        const metricsRes = await api.get(`/rooms/${roomId}/metrics/`);
        const metrics: Metric[] = metricsRes.data.items;
        const tempMetric = metrics.find((m) => m.label === "체온");

        if (!tempMetric) {
          setIsLoading(false);
          return;
        }
        setTempMetricId(tempMetric.id);

        // 일간 차트용
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const dailyRes = await api.get(
          `/rooms/${roomId}/logs?date=${todayStr}&metric_id=${tempMetric.id}`
        );
        const todayLogs: Log[] = dailyRes.data.items;
        setDailyData(
          todayLogs.sort((a, b) => a.time_only.localeCompare(b.time_only))
        );

        //주간 차트용
        const datePromises = [];
        const labels: string[] = [];
        const today = startOfDay(new Date());

        for (let i = 6; i >= 0; i--) {
          // 어제(i=6)부터 7일 전(i=0)까지
          const date = subDays(today, i);
          labels.push(formatDateShort(date));
          const dateStr = format(date, "yyyy-MM-dd");
          datePromises.push(
            api.get(
              `/rooms/${roomId}/logs?date=${dateStr}&metric_id=${tempMetric.id}`
            )
          );
        }

        const results = await Promise.all(datePromises);

        //주간 평균 계산
        const averages: number[] = results.map((res) => {
          const logs: Log[] = res.data.items;
          if (logs.length === 0) return NaN; //
          const sum = logs.reduce(
            (acc, log) => acc + parseFloat(log.content),
            0
          );
          return sum / logs.length;
        });

        setWeeklyAvg({ labels, data: averages });
      } catch (err) {
        console.error("차트 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [roomId]);

  //차트 데이터 가공

  // 일간 차트 데이터
  const dailyChartData = {
    labels: dailyData.map((log) => formatLogTime(log.time_only)),
    datasets: [
      {
        label: "체온",
        data: dailyData.map((log) => parseFloat(log.content)),
        borderColor: "#767AF0",
        backgroundColor: "#767AF0",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // 주간 차트 데이터
  const weeklyChartData = {
    labels: weeklyAvg.labels,
    datasets: [
      {
        label: "주간 평균 체온",
        data: weeklyAvg.data,
        borderColor: "#9CA0F5",
        backgroundColor: "#9CA0F5",
        fill: false,
        tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  if (isLoading) {
    return <div className="p-8 text-center">차트 데이터 로딩 중...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-center">기록 차트 보기</h1>

      <div>
        <h2 className="text-lg font-semibold mb-2">
          오늘의 시간대별 체온 차트
        </h2>
        <div className="h-64 bg-white p-2 rounded-lg shadow-md">
          {dailyData.length > 1 ? (
            <Line options={chartOptions} data={dailyChartData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              체온 측정 횟수가 1번 이하라
              <br />
              그래프를 그릴 수 없어요
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">주간 체온 차트 (평균)</h2>
        <div className="h-64 bg-white p-2 rounded-lg shadow-md">
          <Line options={chartOptions} data={weeklyChartData} />
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => router.push(`/room/${roomId}/log`)}
        className="w-full"
      >
        오늘의 로그 보러가기
      </Button>
    </div>
  );
}

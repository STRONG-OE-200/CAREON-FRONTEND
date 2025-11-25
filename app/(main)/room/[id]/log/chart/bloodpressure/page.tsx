"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "@/lib/RoomContext";
import api from "@/lib/api";
import { format, subDays, startOfDay } from "date-fns";
import { ko } from "date-fns/locale/ko";
import Button from "@/components/Button";
import "@/lib/chartConfig";
import { Line } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";

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
const formatDateShort = (date: Date) => {
  return format(date, "M.d(EEE)", { locale: ko }); // "11.2(일)"
};

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      // (예시) 혈압 범위
      min: 60,
      max: 180,
    },
  },
  plugins: {
    legend: {
      position: "bottom", // 범례를 하단에 표시
      labels: {
        padding: 20,
      },
    },
  },
};

type ChartJsData = ChartData<"line", (number | null)[], string>;

//메인 컴포넌트
export default function BloodPressureChartPage() {
  const router = useRouter();
  const { roomId } = useRoom();
  const [chartData, setChartData] = useState<ChartJsData[]>([]);
  const [bpMetricId, setBpMetricId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const metricsRes = await api.get(`/rooms/${roomId}/metrics/`);
        const metrics: Metric[] = metricsRes.data.items;
        const bpMetric = metrics.find((m) => m.label === "혈압");

        if (!bpMetric) {
          setIsLoading(false);
          return;
        }
        setBpMetricId(bpMetric.id);

        // 지난 7일간의 '혈압' 로그 가져오기
        const datePromises: Promise<any>[] = [];
        const labels: string[] = [];
        const today = startOfDay(new Date());

        for (let i = 6; i >= 0; i--) {
          const date = subDays(today, i);
          labels.push(formatDateShort(date));
          const dateStr = format(date, "yyyy-MM-dd");
          datePromises.push(
            api.get(
              `/rooms/${roomId}/logs?date=${dateStr}&metric_id=${bpMetric.id}`
            )
          );
        }

        const results = await Promise.all(datePromises);
        const dailyLogs: Log[][] = results.map((res) => res.data.items);

        //차트 데이터로 가공
        const newChartData = processLogsForCharts(dailyLogs, labels);
        setChartData(newChartData);
      } catch (err) {
        console.error("차트 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [roomId]);

  if (isLoading) {
    return <div className="p-8 text-center">차트 데이터 로딩 중...</div>;
  }

  if (!bpMetricId) {
    return (
      <div className="p-8 text-center">"혈압" 항목을 찾을 수 없습니다.</div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <h1 className="text-xl text-main-purple text-center">
          주간 혈압 차트 (시간대별 평균)
        </h1>

        {/* 4개의 차트 렌더링 */}
        {chartData.map((data, index) => (
          <div key={index}>
            <h2 className="text-lg mb-2">
              {
                [
                  "오전 (0-6시)",
                  "오전 (6-12시)",
                  "오후 (12-18시)",
                  "저녁 (18-24시)",
                ][index]
              }
            </h2>
            <div className="h-64 bg-white p-2 rounded-lg shadow-md">
              <Line options={chartOptions} data={data} />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        onClick={() => router.push(`/room/${roomId}/log`)}
        className="w-full"
      >
        오늘의 로그 보러가기
      </Button>
    </>
  );
}

//데이터 가공 함수
function processLogsForCharts(
  dailyLogs: Log[][],
  labels: string[]
): ChartJsData[] {
  const buckets = Array.from({ length: 4 }, () => ({
    systolic: Array(7).fill(NaN),
    diastolic: Array(7).fill(NaN),
  }));

  dailyLogs.forEach((logs, dayIndex) => {
    const tempBuckets: { sys: number[]; dia: number[] }[] = [
      { sys: [], dia: [] }, // 0-6
      { sys: [], dia: [] }, // 6-12
      { sys: [], dia: [] }, // 12-18
      { sys: [], dia: [] }, // 18-24
    ];

    logs.forEach((log) => {
      const hour = parseInt(log.time_only.split(":")[0]);
      const [sys, dia] = log.content.split("/").map(Number);

      // "120/80" 형식이 아닌 로그(예: "아침")는 건너뜀
      if (isNaN(sys) || isNaN(dia)) return;

      if (hour < 6) {
        tempBuckets[0].sys.push(sys);
        tempBuckets[0].dia.push(dia);
      } else if (hour < 12) {
        tempBuckets[1].sys.push(sys);
        tempBuckets[1].dia.push(dia);
      } else if (hour < 18) {
        tempBuckets[2].sys.push(sys);
        tempBuckets[2].dia.push(dia);
      } else {
        tempBuckets[3].sys.push(sys);
        tempBuckets[3].dia.push(dia);
      }
    });

    // 4개 구간별로 평균을 계산하여 최종 데이터 배열에 저장
    for (let i = 0; i < 4; i++) {
      if (tempBuckets[i].sys.length > 0) {
        const sysAvg =
          tempBuckets[i].sys.reduce((a, b) => a + b, 0) /
          tempBuckets[i].sys.length;
        const diaAvg =
          tempBuckets[i].dia.reduce((a, b) => a + b, 0) /
          tempBuckets[i].dia.length;

        buckets[i].systolic[dayIndex] = Math.round(sysAvg); // 반올림
        buckets[i].diastolic[dayIndex] = Math.round(diaAvg);
      }
    }
  });

  // 4개의 Chart.js 데이터 객체로 변환
  return buckets.map((bucket) => ({
    labels: labels,
    datasets: [
      {
        label: "수축기 (최고)",
        data: bucket.systolic,
        borderColor: "#9CA0F5BF",
        backgroundColor: "#9CA0F5BF",
        fill: false,
        tension: 0.1,
        spanGaps: true,
      },
      {
        label: "이완기 (최저)",
        data: bucket.diastolic,
        borderColor: "#FFDB69BF",
        backgroundColor: "#FFDB69BF",
        fill: false,
        tension: 0.1,
        spanGaps: true,
      },
    ],
  }));
}

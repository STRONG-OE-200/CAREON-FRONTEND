"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import api from "@/lib/api";
import { useRoom } from "@/lib/RoomContext";
import {
  convertApiGridToBlocks,
  convertNumericGridToSummary,
  NeededBlock,
} from "@/lib/scheduleUtils";
import { useAlert } from "@/lib/AlertContext";

const DAY_MAP = ["일", "월", "화", "수", "목", "금", "토"];

type CellData = {
  isCareNeeded: boolean;
  availableMembers: any[];
  confirmedMember: any | null;
};

type Selections = Record<string, { start: number; end: number }>;

//메인 컴포넌트
export default function ParticipatePage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useParams();
  const { roomId } = useRoom();
  const weekId = params.week_id as string;

  const [neededBlocks, setNeededBlocks] = useState<NeededBlock[]>([]); //
  const [selections, setSelections] = useState<Selections>({}); //
  const [neededSummary, setNeededSummary] = useState<string[]>([]); //
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  //필요 시간 블록
  useEffect(() => {
    if (!roomId || !weekId) return;

    const fetchNeededData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `/schedules/?room_id=${roomId}&week_id=${weekId}`
        );
        const apiGrid: CellData[][] = response.data.masterGrid;

        if (!Array.isArray(apiGrid)) {
          throw new Error("API 응답이 그리드 형식이 아닙니다.");
        }

        const blocks = convertApiGridToBlocks(apiGrid);
        setNeededBlocks(blocks);

        const numericGrid = apiGrid.map(
          (
            day: CellData[] //
          ) => day.map((cell: CellData) => (cell.isCareNeeded ? 1 : 0)) //
        );
        setNeededSummary(convertNumericGridToSummary(numericGrid, DAY_MAP));

        const initialSelections: Selections = {};
        blocks.forEach((block) => {
          initialSelections[block.key] = { start: -1, end: -1 };
        });
        setSelections(initialSelections);
      } catch (err: any) {
        console.error("필요 시간 로드 실패:", err);
        setError("방장이 등록한 '필요 시간'을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNeededData();
  }, [roomId, weekId]);

  const handleSubmit = async () => {
    setError("");

    const cellsToSubmit: { day: number; hour: number }[] = [];
    neededBlocks.forEach((block) => {
      const selection = selections[block.key];
      // '선택 안 함'(-1)이 아닌 경우
      if (selection && selection.start !== -1 && selection.end !== -1) {
        for (let hour = selection.start; hour < selection.end; hour++) {
          cellsToSubmit.push({ day: block.day, hour: hour });
        }
      }
    });

    if (cellsToSubmit.length === 0) {
      setError("간병 가능한 시간대를 1칸 이상 선택해야 합니다.");
      return;
    }

    try {
      await api.post(`/schedules/${weekId}/availability/`, {
        slots: cellsToSubmit,
      });
      showAlert("내 시간이 저장되었습니다.");
      router.push(`/room/${roomId}/schedule`);
    } catch (err: any) {
      console.error("저장 API 오류:", err);
      setError(err.response?.data?.detail || "저장에 실패했습니다.");
    }
  };

  //렌더링
  if (isLoading) {
    return <div className="p-8 text-center">필요 시간 로딩 중...</div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6">
          <p className="text-center text-lg font-semibold mb-2">
            간병 필요 시간
          </p>
          <div className="p-3 bg-btn-white rounded-2xl space-y-1">
            {neededSummary.length > 0 ? (
              neededSummary.map((line) => (
                <p key={line} className="text-gray-700 font-medium">
                  {line}
                  <hr className="text-bg-purple" />
                </p>
              ))
            ) : (
              <p className="text-gray-500 text-center">
                방장이 등록한 '필요 시간'이 없습니다.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-center text-lg font-semibold mb-4">
            내가 가능한 시간 선택
          </p>
          {neededBlocks.length === 0 && !isLoading && (
            <p className="text-gray-400 text-center mt-10">
              선택할 수 있는 '필요 시간'이 없습니다.
            </p>
          )}

          {neededBlocks.map((block) => (
            <TimeBlockInput
              key={block.key}
              block={block}
              selection={selections[block.key]}
              onChange={(newSelection) => {
                setSelections((prev) => ({
                  ...prev,
                  [block.key]: newSelection,
                }));
              }}
            />
          ))}
        </div>
      </div>

      <div className="p-4 sticky mb-20 flex-shrink-0">
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <Button variant="primary" onClick={handleSubmit} className="w-full">
          내 시간 저장하기
        </Button>
      </div>
    </div>
  );
}

type BlockInputProps = {
  block: NeededBlock;
  selection: { start: number; end: number };
  onChange: (selection: { start: number; end: number }) => void;
};

function TimeBlockInput({ block, selection, onChange }: BlockInputProps) {
  // 드롭다운 옵션 생성
  const startOptions = [];
  for (let i = block.start; i < block.end; i++) {
    startOptions.push(i);
  }

  const endOptions = [];
  // (선택된 시작 시간 ~ 블록 종료 시간)
  const startRange =
    selection?.start !== -1 ? selection.start + 1 : block.start + 1;
  for (let i = startRange; i <= block.end; i++) {
    endOptions.push(i);
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = Number(e.target.value);
    // (시작 시간이 종료 시간보다 늦으면, 종료 시간을 시작 시간+1로 맞춤)
    if (newStart !== -1 && newStart >= selection.end && selection.end !== -1) {
      onChange({ start: newStart, end: newStart + 1 });
    } else {
      onChange({ ...selection, start: newStart });
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnd = Number(e.target.value);
    onChange({ ...selection, end: newEnd });
  };

  if (!selection) return null; //

  return (
    <div className="p-3 rounded-lg shadow-md">
      <p className="font-semibold text-gray-800 mb-2">
        {`${DAY_MAP[block.day]}요일 ${block.start}:00 - ${block.end}:00`}
      </p>
      <div className="flex items-center gap-2">
        <select
          value={selection.start}
          onChange={handleStartChange}
          className="p-2 border rounded-md flex-1"
        >
          <option value={-1}>선택 안 함</option>
          {startOptions.map((hour) => (
            <option key={hour} value={hour}>{`${hour}:00`}</option>
          ))}
        </select>

        <span>~</span>

        <select
          value={selection.end}
          onChange={handleEndChange}
          className="p-2 border rounded-md flex-1"
          disabled={selection.start === -1} //
        >
          <option value={-1}>선택 안 함</option>
          {endOptions.map((hour) => (
            <option key={hour} value={hour}>{`${hour}:00`}</option>
          ))}
        </select>
      </div>
      {selection.start !== -1 &&
        selection.end !== -1 &&
        selection.start >= selection.end && (
          <p className="text-red-500 text-sm mt-1">
            종료 시간은 시작 시간보다 늦어야 합니다.
          </p>
        )}
    </div>
  );
}

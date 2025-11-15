// lib/scheduleUtils.ts

// API 응답(masterGrid)의 각 셀 타입
type CellData = {
  isCareNeeded: boolean;
  availableMembers: any[];
  confirmedMember: any | null;
};

// "연속된 시간 블록"을 나타내는 타입
export type NeededBlock = {
  key: string; // 예: "1-9" (월요일 9시 블록)
  day: number;
  start: number; // 9 (시작 시간)
  end: number; // 12 (종료 시간 + 1)
};

// 7x24 숫자 그리드 -> "월: 9:00 - 17:00" 텍스트 요약
export const convertNumericGridToSummary = (
  grid: number[][],
  DAY_MAP: string[]
) => {
  const summary: string[] = [];
  grid.forEach((hours, dayIndex) => {
    let daySummary = `${DAY_MAP[dayIndex]}: `;
    let ranges: string[] = [];
    let startHour: number | null = null;

    hours.forEach((value, hour) => {
      if (value === 1 && startHour === null) {
        startHour = hour;
      }
      if (value === 0 && startHour !== null) {
        ranges.push(`${startHour}:00 - ${hour}:00`);
        startHour = null;
      }
    });
    if (startHour !== null) {
      ranges.push(`${startHour}:00 - 24:00`);
    }

    if (ranges.length > 0) {
      summary.push(daySummary + ranges.join(", "));
    }
  });
  return summary;
};

// API 응답 그리드 -> 'NeededBlock' 배열로 변환
export const convertApiGridToBlocks = (
  apiGrid: CellData[][]
): NeededBlock[] => {
  if (!Array.isArray(apiGrid)) return [];

  const blocks: NeededBlock[] = [];

  apiGrid.forEach((day, dayIndex) => {
    let currentBlock: NeededBlock | null = null;

    day.forEach((cell, hour) => {
      if (cell.isCareNeeded) {
        if (currentBlock === null) {
          // 새 블록 시작
          currentBlock = {
            key: `${dayIndex}-${hour}`,
            day: dayIndex,
            start: hour,
            end: hour + 1,
          };
        } else {
          // 기존 블록 연장
          currentBlock.end = hour + 1;
        }
      } else {
        if (currentBlock !== null) {
          // 블록이 끝남
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
    });
    //
    if (currentBlock !== null) {
      blocks.push(currentBlock);
    }
  });
  return blocks;
};

"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useParams, usePathname } from "next/navigation";
import api from "@/lib/api";

function getWeekData() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(new Date().setDate(today.getDate() - dayOfWeek));
  const y = startOfWeek.getFullYear();
  const m = (startOfWeek.getMonth() + 1).toString().padStart(2, "0");
  const d = startOfWeek.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type ScheduleStatus = {
  week_id: number | null;
  is_finalized: boolean;
};
type RoomContextType = {
  roomId: string;
  isOwner: boolean;
  scheduleStatus: ScheduleStatus;
  isLoading: boolean;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();

  const [roomId, setRoomId] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatus>({
    week_id: null,
    is_finalized: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const ownerStatus = localStorage.getItem("isOwner") === "true";
    setRoomId(id || "");
    setIsOwner(ownerStatus);

    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const currentWeekStartDate = getWeekData();
        const cacheBuster = `_t=${new Date().getTime()}`;

        const response = await api.get(
          `/schedules/?room_id=${id}&week=${currentWeekStartDate}&${cacheBuster}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        const apiData = response.data;
        setScheduleStatus({
          week_id: apiData.week_id,
          is_finalized: apiData.status === "finalized", // 'finalized' 문자열이면 true
        });
      } catch (error: any) {
        console.error(
          "[RoomContext] API 요청 실패:",
          error.message,
          error.response?.data
        );
        if (error.response && error.response.status === 404) {
          setScheduleStatus({ week_id: null, is_finalized: false });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [params.id, pathname]); // URL이 바뀔 때마다 재호출

  return (
    <RoomContext.Provider
      value={{ roomId, isOwner, scheduleStatus, isLoading }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}

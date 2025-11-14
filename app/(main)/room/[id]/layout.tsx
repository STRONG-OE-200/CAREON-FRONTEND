"use client";
import { RoomProvider } from "@/lib/RoomContext";

export default function RoomIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoomProvider>{children}</RoomProvider>;
}

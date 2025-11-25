"use client";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideBottomNav =
    pathname.includes("/room/create") || pathname.includes("/room/join");
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      {!hideBottomNav && <BottomNav />}{" "}
    </div>
  );
}

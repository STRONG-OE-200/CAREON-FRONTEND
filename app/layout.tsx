import type { Metadata } from "next";
import "./globals.css";
import { AlertProvider } from "@/lib/AlertContext";

export const metadata: Metadata = {
  title: "Care On",
  description: "가족 간병인을 위한 협업 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      {/* 5. (비워둠) <body>에 폰트 클래스를 적용하지 않습니다.
           나중에 폰트가 정해지면 tailwind.config.ts에 등록하고
           여기에 className="font-sans" 등을 추가하면 됩니다.
      */}
      <body>
        <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}

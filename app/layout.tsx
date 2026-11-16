import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MondayClass 健康檔案",
  description: "設定健康檔案、每日營養目標與健身目標。",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mondayclass",
  description: "健身教練與學員的專業平台",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Robot Archive",
  description: "소아 소셜로봇 상호작용 연구를 위한 데이터 중심 아카이브"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

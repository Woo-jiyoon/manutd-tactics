import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 👈 방금 만든 나브바 가져오기

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Man Utd Pro Clubs Hub",
  description: "Tactical analysis platform for Manchester United Pro Clubs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 👇 여기에 Navbar를 넣으면 모든 페이지 상단에 고정됩니다 */}
        <Navbar /> 
        
        {/* children이 바로 우리가 만든 page.tsx 내용들이 들어가는 곳입니다 */}
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import AuthWrapper from "@/components/AuthWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPC-S 1.2 HEV 모델 정적검증 업무 포탈",
  description: "VPC-S 1.2 HEV 모델 정적검증 현황 UI 웹사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light">
      <body>
        <div className="flex h-screen overflow-hidden">
          <AuthWrapper>
            <Sidebar />
            <main className="flex-1 p-6 overflow-hidden flex flex-col">
              {children}
            </main>
          </AuthWrapper>
        </div>
      </body>
    </html>
  );
}
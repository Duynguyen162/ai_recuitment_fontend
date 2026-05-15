import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSync from "@/components/auth/AuthSync";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Việc làm AI",
  description: "Tìm kiếm công việc tốt nhất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthSync />
        {children}
      </body>
    </html>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import CandidateSidebar from "@/components/layout/CandidateSidebar";
import TopHeader from "@/components/layout/TopHeader";
import styles from "./candidateLayout.module.scss";
import apiClient from "@/lib/apiClient";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        setUserName(res.data.data.name);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // chạy lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className={styles.layoutWrapper}>
      <CandidateSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`${styles.mainArea} ${
          !isSidebarOpen ? styles.collapsed : ""
        }`}
      >
        <TopHeader role="candidate" userName={userName} />

        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}

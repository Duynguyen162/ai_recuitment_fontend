"use client";

import React, { useEffect, useState } from "react";
import CandidateSidebar from "@/components/layout/CandidateSidebar";
import TopHeader from "@/components/layout/TopHeader";
import styles from "./candidateLayout.module.scss";
import { useAuthStore } from "@/store/authStore";

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
                className={`${styles.mainArea} ${!isSidebarOpen ? styles.collapsed : ""
                    }`}
            >
                <TopHeader role="candidate" userName={user?.name || ""} />

                <main className={styles.contentArea}>{children}</main>
            </div>
        </div>
    );
}

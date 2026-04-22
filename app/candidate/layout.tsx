import React from "react";
import CandidateSidebar from "@/components/layout/CandidateSidebar";
import TopHeader from "@/components/layout/TopHeader";

import styles from "./candidateLayout.module.scss";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutWrapper}>
      <CandidateSidebar />
      <div className={styles.mainArea}>
        <TopHeader role="candidate" userName="Nguyễn Văn A" />
        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}

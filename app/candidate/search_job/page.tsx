"use client";

import { Suspense } from "react";
import JobListContainer from "@/components/jobs/JobListContainer";
import styles from "./search_job.module.scss";

export default function JobsPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Đang tải danh sách công việc...</div>}>
        <JobListContainer />
      </Suspense>
    </div>
  );
}

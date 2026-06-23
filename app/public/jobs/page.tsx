"use client";

import { Suspense } from "react";
import JobListContainer from "@/components/jobs/JobListContainer";

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Đang tải danh sách công việc...</div>}>
      <JobListContainer />
    </Suspense>
  );
}

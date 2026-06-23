"use client";

import { Suspense } from "react";
import JobDetailPage from "@/components/jobs/JobDetail";

export default function JobsDetail() {
    return (
        <Suspense fallback={<div>Đang tải chi tiết công việc...</div>}>
            <JobDetailPage />
        </Suspense>
    );
}
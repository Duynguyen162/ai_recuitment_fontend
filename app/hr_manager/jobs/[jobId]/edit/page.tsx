"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Toaster } from "react-hot-toast";

import JobForm, { JobFormValues } from "../../_components/JobForm";
import apiClient from "@/lib/apiClient";

interface HrJob extends Partial<JobFormValues> {
  id: number;
  expired_at: string;
}

export default function EditJobPage() {
  const params = useParams<{ jobId: string }>();
  const [job, setJob] = useState<HrJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get("/job/get_jobs_create_by_hr");
        const jobs = Array.isArray(res.data?.data) ? res.data.data : [];
        const matchedJob = jobs.find(
          (item: HrJob) => String(item.id) === String(params.jobId),
        );
        setJob(matchedJob ?? null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.jobId]);

  if (loading) {
    return <div>Đang tải form chỉnh sửa...</div>;
  }

  if (!job) {
    return <div>Không tìm thấy job cần chỉnh sửa.</div>;
  }

  return (
    <>
      <JobForm
        mode="edit"
        jobId={job.id}
        initialValues={{
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          location: job.location,
          tags: job.tags ?? [],
          salary_min: job.salary_min ?? 0,
          salary_max: job.salary_max ?? 0,
          years_of_experience: job.years_of_experience ?? 0,
          job_type: job.job_type,
          expired_at: job.expired_at,
        }}
      />
      <Toaster />
    </>
  );
}

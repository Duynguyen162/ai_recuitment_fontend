"use client";

import React, { useEffect, useState } from "react";
import styles from "./CompanyJobs.module.scss";
import apiClient from "@/lib/apiClient";
import JobCard from "@/components/jobs/JobCard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface CompanyJobsProps {
  companyId: number;
}

export default function CompanyJobs({ companyId }: CompanyJobsProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/public/companies/${companyId}/jobs`, {
          params: { page, page_size: limit },
        });
        if (res.data?.success) {
          setJobs(res.data.data);
          setTotal(res.data.meta?.total || 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách việc làm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [companyId, page]);

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Tin tuyển dụng ({total})</h2>
      
      <div className={styles.jobGrid}>
        {loading ? (
          <p className={styles.loadingText}>Đang tải việc làm...</p>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              companyName={job.company?.name || "Đang cập nhật"}
              logoUrl={job.company?.logo_url !== "string" ? job.company?.logo_url : undefined}
              location={job.location}
              yearsOfExperience={job.years_of_experience}
              salaryRange={
                job.salary_max
                  ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                  : "Thỏa thuận"
              }
              jobType={job.job_type}
              postedDate={dayjs(job.created_at).fromNow()}
            />
          ))
        ) : (
          <p className={styles.emptyState}>Công ty hiện chưa có tin tuyển dụng nào.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
            Trang trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={page === i + 1 ? styles.activePage : ""}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import styles from "./jobsManagement.module.scss";
import ConfirmModal from "@/components/ui/ConfirmModal";
import apiClient from "@/lib/apiClient";
import JobsHeader from "./_components/JobsHeader";
import JobsSummaryGrid from "./_components/JobsSummaryGrid";
import JobsToolbar from "./_components/JobsToolbar";
import JobsTable from "./_components/JobsTable";
import JobsPagination from "./_components/JobsPagination";
import JobPreviewModal from "./_components/JobPreviewModal";
import type {
  HrJob,
  JobStatus,
  PaginationMeta,
} from "./_lib/jobManagement";

export default function JobsManagementPage() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [jobs, setJobs] = useState<HrJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  });
  const [filterStatus, setFilterStatus] = useState<JobStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deletingJob, setDeletingJob] = useState<HrJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewJob, setPreviewJob] = useState<HrJob | null>(null);

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchJobs = async (
    page: number,
    pageSize: number,
    status: string,
    search: string,
  ) => {
    setLoading(true);
    try {
      const res = await apiClient.get("/job/get_jobs_create_by_hr", {
        params: {
          page,
          page_size: pageSize,
          status: status === "all" ? undefined : status,
          search: search.trim() || undefined,
        },
      });

      const total = Number(res.data?.meta?.total ?? 0);
      const normalizedPageSize = Number(res.data?.meta?.page_size ?? pageSize);
      const computedTotalPages = Math.max(
        Math.ceil(total / Math.max(normalizedPageSize, 1)),
        1,
      );

      setJobs(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination({
        page: Number(res.data?.meta?.page ?? page),
        page_size: normalizedPageSize,
        total,
        total_pages: computedTotalPages,
      });
    } catch {
      toast.error("Không thể tải danh sách công việc");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(
      pagination.page,
      pagination.page_size,
      filterStatus,
      debouncedSearch,
    );
  }, [pagination.page, pagination.page_size, filterStatus, debouncedSearch]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest("[data-action-menu-root='true']")) {
        return;
      }

      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!previewJob) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewJob(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [previewJob]);

  const counts = useMemo(
    () => ({
      all: pagination.total,
      published: jobs.filter((job) => job.status === "published").length,
      draft: jobs.filter((job) => job.status === "draft").length,
      paused: jobs.filter((job) => job.status === "paused").length,
      closed: jobs.filter((job) => job.status === "closed").length,
    }),
    [jobs, pagination.total],
  );

  const summary = useMemo(
    () => ({
      publishedJobs: counts.published,
      draftJobs: counts.draft,
      totalJobs: pagination.total,
      expiringSoon: jobs.filter((job) => {
        const expiredAt = new Date(job.expired_at).getTime();
        const today = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return expiredAt >= today && expiredAt - today <= sevenDays;
      }).length,
    }),
    [counts, jobs, pagination.total],
  );

  const visibleFrom =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.page_size + 1;
  const visibleTo = Math.min(
    pagination.page * pagination.page_size,
    pagination.total,
  );

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.total_pages) return;
    setOpenMenuId(null);
    setPagination((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setOpenMenuId(null);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      page_size: nextPageSize,
    }));
  };

  const handleFilterChange = (status: JobStatus) => {
    setFilterStatus(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleChangeStatus = async (job: HrJob, status: string) => {
    setOpenMenuId(null);
    try {
      await apiClient.put(`/job/${job.id}/status?status=${status}`);
      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? { ...item, status: status as HrJob["status"] }
            : item,
        ),
      );

      toast.success("Cập nhật trạng thái thành công");
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!deletingJob) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/job/delete_jobs?job_id=${jobId}`, {
        data: {
          job_id: deletingJob.id,
        },
      });

      setJobs((prev) => prev.filter((job) => job.id !== deletingJob.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(prev.total - 1, 0),
      }));
      toast.success("Đã xóa tin tuyển dụng");
      setDeletingJob(null);
    } catch {
      toast.error("Không thể xóa tin tuyển dụng");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenPreview = (job: HrJob) => {
    setOpenMenuId(null);
    setPreviewJob(job);
  };

  return (
    <div ref={pageRef} className={styles.pageContainer}>
      <JobsHeader />
      <JobsSummaryGrid summary={summary} />
      <JobsToolbar
        counts={counts}
        filterStatus={filterStatus}
        searchQuery={searchQuery}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      <div className={styles.tableContainer}>
        <JobsTable
          jobs={jobs}
          loading={loading}
          openMenuId={openMenuId}
          onToggleMenu={setOpenMenuId}
          onOpenPreview={handleOpenPreview}
          onChangeStatus={handleChangeStatus}
          onDeleteJob={setDeletingJob}
        />

        {!loading && pagination.total > 0 && (
          <JobsPagination
            pagination={pagination}
            visibleFrom={visibleFrom}
            visibleTo={visibleTo}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!deletingJob}
        title="Xóa tin tuyển dụng"
        message={
          deletingJob
            ? `Bạn có chắc muốn xóa "${deletingJob.title}" không?`
            : ""
        }
        confirmText="Xóa tin"
        cancelText="Hủy"
        onConfirm={() => handleDelete(deletingJob!.id)}
        onCancel={() => setDeletingJob(null)}
        isLoading={isDeleting}
      />
      <JobPreviewModal job={previewJob} onClose={() => setPreviewJob(null)} />
      <Toaster />
    </div>
  );
}

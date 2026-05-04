"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Eye,
  X,
  MapPin,
  Calendar,
  Clock3,
  FileText,
  Trash2,
  Building2,
  Loader2,
  BadgeDollarSign,
} from "lucide-react";
import cx from "classnames";
import toast, { Toaster } from "react-hot-toast";

import styles from "./jobsManagement.module.scss";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import apiClient from "@/lib/apiClient";
import { formatSalary } from "@/utils/formatSalary";

type JobStatus = "all" | "published" | "draft" | "closed" | "paused";
type JobType = "full_time" | "part_time" | "contract" | "internship" | string;

interface CompanyInfo {
  id: number;
  name: string;
  logo_url: string;
}

interface HrJob {
  id: number;
  company_id: number;
  created_by: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  tags: string[];
  salary_min: number;
  salary_max: number;
  years_of_experience: number;
  job_type: JobType;
  expired_at: string;
  status: Exclude<JobStatus, "all">;
  created_at: string;
  company?: CompanyInfo;
}

interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

const STATUS_LABELS: Record<Exclude<JobStatus, "all">, string> = {
  published: "Đang hoạt động",
  draft: "Bản nháp",
  paused: "Tạm dừng",
  closed: "Đã đóng",
};

function formatJobType(jobType: JobType) {
  if (jobType === "full_time") return "Toàn thời gian";
  if (jobType === "part_time") return "Bán thời gian";
  if (jobType === "contract") return "Hợp đồng";
  if (jobType === "internship") return "Thực tập";
  return jobType;
}

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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deletingJob, setDeletingJob] = useState<HrJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewJob, setPreviewJob] = useState<HrJob | null>(null);

  const fetchJobs = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get("/job/get_jobs_create_by_hr", {
        params: {
          page,
          page_size: pageSize,
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
    fetchJobs(pagination.page, pagination.page_size);
  }, [pagination.page, pagination.page_size]);

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

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchStatus =
        filterStatus === "all" ? true : job.status === filterStatus;
      const matchSearch =
        normalizedQuery.length === 0
          ? true
          : [
              job.title,
              job.location,
              job.company?.name ?? "",
              ...(job.tags ?? []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);

      return matchStatus && matchSearch;
    });
  }, [jobs, filterStatus, searchQuery]);

  const counts = useMemo(
    () => ({
      all: jobs.length,
      published: jobs.filter((job) => job.status === "published").length,
      draft: jobs.filter((job) => job.status === "draft").length,
      paused: jobs.filter((job) => job.status === "paused").length,
      closed: jobs.filter((job) => job.status === "closed").length,
    }),
    [jobs],
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

  const handleChangeStatus = async (job: HrJob, status: string) => {
    setOpenMenuId(null);
    try {
      await apiClient.put(`/job/${job.id}/status?status=${status}`);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, status: status as HrJob["status"] } : j,
        ),
      );

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (job_id: number) => {
    if (!deletingJob) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/job/delete_jobs?job_id=${job_id}`, {
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
      <div className={styles.pageHeader}>
        <div>
          <h1>Quản lý việc làm</h1>
          <p>
            Theo dõi danh sách tin đã tạo, mở trang chi tiết, vào form chỉnh sửa
            và xóa job từ giao diện quản trị.
          </p>
        </div>
        <Link href="/hr_manager/jobs/create">
          <Button variant="primary">
            <Plus size={18} /> Đăng tin mới
          </Button>
        </Link>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Đang hoạt động trang này</span>
          <strong>{summary.publishedJobs}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Bản nháp trang này</span>
          <strong>{summary.draftJobs}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Tổng tin đã tạo</span>
          <strong>{summary.totalJobs}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Sắp hết hạn 7 ngày</span>
          <strong>{summary.expiringSoon}</strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {(
            [
              ["all", "Tất cả"],
              ["published", "Đang hoạt động"],
              ["draft", "Bản nháp"],
              ["paused", "Tạm dừng"],
              ["closed", "Đã đóng"],
            ] as const
          ).map(([status, label]) => (
            <button
              key={status}
              className={cx(styles.filterBtn, {
                [styles.active]: filterStatus === status,
              })}
              onClick={() => setFilterStatus(status)}
            >
              {label}
              <span className={styles.countBadge}>
                {counts[status as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, địa điểm, tag..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 size={20} className={styles.spin} />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.iconWrapper}>
              <FileText size={32} />
            </div>
            <h3>Không tìm thấy tin tuyển dụng nào</h3>
            <p>Thử thay đổi bộ lọc hoặc tạo job mới để bắt đầu.</p>
            <Link href="/hr_manager/jobs/create">
              <Button variant="outline">Tạo job mới</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Vị trí tuyển dụng</th>
                  <th>Trạng thái</th>
                  <th>Mức lương và kinh nghiệm</th>
                  <th>Thời gian</th>
                  <th style={{ width: "92px", textAlign: "right" }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className={styles.jobMain}>
                        <button
                          type="button"
                          className={styles.title}
                          onClick={() => handleOpenPreview(job)}
                        >
                          {job.title}
                        </button>
                        <div className={styles.meta}>
                          <span>
                            <MapPin size={12} />{" "}
                            {job.location || "Đang cập nhật"}
                          </span>
                          <span>
                            <Clock3 size={12} /> {formatJobType(job.job_type)}
                          </span>
                          <span>
                            <Building2 size={12} />{" "}
                            {job.company?.name || "Công ty của bạn"}
                          </span>
                        </div>
                        {!!job.tags?.length && (
                          <div className={styles.tagRow}>
                            {job.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={cx(styles.statusBadge, styles[job.status])}
                      >
                        {STATUS_LABELS[job.status]}
                      </span>
                    </td>

                    <td>
                      <div className={styles.statsCol}>
                        <span>
                          <BadgeDollarSign size={12} />
                          {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                        <span>{job.years_of_experience} năm kinh nghiệm</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.statsCol}>
                        <span>
                          <Calendar size={12} /> Tạo:{" "}
                          {new Date(job.created_at).toLocaleDateString("vi-VN")}
                        </span>
                        <span>
                          <Calendar size={12} /> Hạn:{" "}
                          {new Date(job.expired_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div
                        className={styles.actionDropdown}
                        data-action-menu-root="true"
                      >
                        <button
                          className={styles.moreBtn}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId(
                              openMenuId === job.id ? null : job.id,
                            );
                          }}
                        >
                          <MoreVertical size={20} />
                        </button>

                        {openMenuId === job.id && (
                          <div
                            className={styles.menu}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button onClick={() => handleOpenPreview(job)}>
                              <Eye size={16} /> Xem chi tiết
                            </button>
                            {!(job.status === "closed") &&
                              !(job.status === "published") &&
                              !(job.status === "paused") && (
                                <Link href={`/hr_manager/jobs/${job.id}/edit`}>
                                  <Edit2 size={16} /> Sửa tin
                                </Link>
                              )}
                            {job.status === "published" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleChangeStatus(job, "paused")
                                  }
                                >
                                  <Clock3 size={16} /> Tạm dừng tuyển dụng
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeStatus(job, "closed")
                                  }
                                >
                                  <Clock3 size={16} /> Đóng tin tuyển dụng
                                </button>
                              </>
                            )}
                            {/* {job.status === "draft" && (
                              <button onClick={() => handleChangeStatus(job,"published")}>
                                <Clock3 size={16} /> Đăng tuyển
                              </button>
                            )} */}
                            {job.status === "paused" && (
                              <button
                                onClick={() =>
                                  handleChangeStatus(job, "published")
                                }
                              >
                                <Clock3 size={16} /> Mở lại tuyển dụng
                              </button>
                            )}
                            {/* {job.status === "closed" && (
                              <button
                                onClick={() => handleChangeStatus(job, "")}
                              >
                                <Clock3 size={16} /> Mở lại tin
                              </button>
                            )} */}
                            <button
                              className={styles.danger}
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeletingJob(job);
                              }}
                            >
                              <Trash2 size={16} /> Xóa bài đăng
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.total > 0 && (
          <div className={styles.paginationBar}>
            <div className={styles.paginationInfo}>
              <span>
                Hiển thị {visibleFrom}-{visibleTo} trên {pagination.total} tin
              </span>
              <label className={styles.pageSizeBox}>
                <span>Mỗi trang</span>
                <select
                  value={pagination.page_size}
                  onChange={(event) =>
                    handlePageSizeChange(Number(event.target.value))
                  }
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.paginationActions}>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Trang trước
              </Button>
              <span className={styles.pageIndicator}>
                Trang {pagination.page}/{pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Trang sau
              </Button>
            </div>
          </div>
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
      {previewJob && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreviewJob(null)}
          role="presentation"
        >
          <div
            className={styles.modalCard}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-preview-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span
                  className={cx(
                    styles.statusBadge,
                    styles[previewJob.status],
                    styles.modalStatus,
                  )}
                >
                  {STATUS_LABELS[previewJob.status]}
                </span>
                <h3 id="job-preview-title">{previewJob.title}</h3>
                <p>Xem nhanh thông tin job mà không cần rời khỏi danh sách.</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPreviewJob(null)}
                aria-label="Đóng xem chi tiết"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.previewMetaGrid}>
              <div className={styles.previewMetaCard}>
                <span className={styles.previewLabel}>Địa điểm</span>
                <strong>{previewJob.location || "Đang cập nhật"}</strong>
              </div>
              <div className={styles.previewMetaCard}>
                <span className={styles.previewLabel}>Loại công việc</span>
                <strong>{formatJobType(previewJob.job_type)}</strong>
              </div>
              <div className={styles.previewMetaCard}>
                <span className={styles.previewLabel}>Mức lương</span>
                <strong>
                  {formatSalary(previewJob.salary_min, previewJob.salary_max)}
                </strong>
              </div>
              <div className={styles.previewMetaCard}>
                <span className={styles.previewLabel}>Kinh nghiệm</span>
                <strong>{previewJob.years_of_experience} năm</strong>
              </div>
              <div className={styles.previewMetaCard}>
                <span className={styles.previewLabel}>Ngày tạo</span>
                <strong>
                  {new Date(previewJob.created_at).toLocaleDateString("vi-VN")}
                </strong>
              </div>
              <div className={styles.previewMetaCard}>
                <span className={styles.previewLabel}>Hạn ứng tuyển</span>
                <strong>
                  {new Date(previewJob.expired_at).toLocaleDateString("vi-VN")}
                </strong>
              </div>
            </div>

            {!!previewJob.tags?.length && (
              <div className={styles.previewTagRow}>
                {previewJob.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.previewContentGrid}>
              <section className={styles.previewSection}>
                <div className={styles.previewSectionTitle}>
                  <FileText size={16} />
                  Mô tả công việc
                </div>
                <p>{previewJob.description}</p>
              </section>

              <section className={styles.previewSection}>
                <div className={styles.previewSectionTitle}>
                  <FileText size={16} />
                  Yêu cầu ứng viên
                </div>
                <p>{previewJob.requirements}</p>
              </section>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.btnClose}>
                <Button variant="ghost" onClick={() => setPreviewJob(null)}>
                  Đóng
                </Button>
              </div>
              <Link href={`/hr_manager/jobs/${previewJob.id}/edit`}>
                <Button>
                  <Edit2 size={16} /> Mở trang chỉnh sửa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}

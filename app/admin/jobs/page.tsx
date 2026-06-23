"use client";

import React, { useEffect, useState, useCallback } from "react";
import cx from "classnames";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import {
  JobReport, AdminAction, PAGE_SIZE,
  STATUS_TABS, ACTION_TABS,
} from "./_components/types";
import ReportsTable from "./_components/ReportsTable";
import JobDetailPopup from "./_components/JobDetailPopup";

export default function AdminJobsPage() {
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "resolved" | "dismissed">("");
  const [actionFilter, setActionFilter] = useState<"" | AdminAction>("");
  const [selectedReport, setSelectedReport] = useState<JobReport | null>(null);

  /* ── Fetch ── */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/job-reports", {
        params: {
          page,
          page_size: PAGE_SIZE,
          status: statusFilter || undefined,
          // Lọc admin_action — chỉ có ý nghĩa khi status=resolved
          admin_action: (statusFilter === "resolved" && actionFilter) ? actionFilter : undefined,
        },
      });
      if (res.data?.success) setReports(res.data.data ?? []);
    } catch {
      toast.error("Không thể tải báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, actionFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  /* ── Actions ── */

  /**
   * Gửi resolve/dismiss lên backend.
   * Bắt buộc truyền adminAction để backend lưu vào job_reports.admin_action.
   * Body: { status, admin_action, admin_note? }
   */
  const resolveReport = async (
    jobId: number,
    status: "resolved" | "dismissed",
    adminAction: AdminAction,
    adminNote?: string,
  ) => {
    await apiClient.put(`/admin/job-reports/${jobId}/resolve`, {
      status,
      admin_action: adminAction,
      admin_note: adminNote,
    });
    toast.success(status === "resolved" ? "Đã đánh dấu xử lý." : "Đã bỏ qua báo cáo.");
    setSelectedReport(null);
    fetchReports();
  };

  const jobAction = async (jobId: number, action: "allow" | "close") => {
    await apiClient.post(`/admin/jobs/${jobId}/action`, { action });
    const msg = { allow: "Đã mở lại tin.",close: "Đã đóng & khóa tin." };
    toast.success(msg[action]);
  };

  const handleStatusFilter = (s: typeof statusFilter) => {
    setStatusFilter(s);
    setActionFilter(""); 
    setPage(1);
  };

  const handleActionFilter = (a: typeof actionFilter) => {
    setActionFilter(a);
    setPage(1);
  };

  /* ── Render ── */
  return (
    <div>
      <Toaster />

      <div className={styles.card}>
        {/* Tab lọc trạng thái báo cáo */}
        <div className={styles.tabs}>
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              className={cx(styles.tabBtn, { [styles.activeTab]: statusFilter === key })}
              onClick={() => handleStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab lọc hình thức xử lý — chỉ hiện khi đang xem tab "Đã xử lý" */}
        {statusFilter === "resolved" && (
          <div className={styles.tabs} style={{ borderTop: "1px solid #f1f5f9", background: "#fafafa" }}>
            {ACTION_TABS.map(({ key, label }) => (
              <button
                key={key}
                className={cx(styles.tabBtn, { [styles.activeTab]: actionFilter === key })}
                onClick={() => handleActionFilter(key)}
                style={{ fontSize: "0.78rem" }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Bảng báo cáo */}
        <ReportsTable
          reports={reports}
          loading={loading}
          page={page}
          onViewJob={(r) => setSelectedReport(r)}
          onResolve={resolveReport}
        />

        {/* Phân trang */}
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
          <span style={{ fontSize: "0.8rem", color: "#64748b", padding: "0 0.5rem" }}>Trang {page}</span>
          <button disabled={reports.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>Tiếp →</button>
        </div>
      </div>

      {/* Popup xem chi tiết job */}
      {selectedReport && (
        <JobDetailPopup
          jobId={selectedReport.job_id}
          reportStatus={selectedReport.status}
          onClose={() => setSelectedReport(null)}
          onReportAction={resolveReport}
          onJobAction={jobAction}
        />
      )}
    </div>
  );
}

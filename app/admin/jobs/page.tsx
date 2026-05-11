"use client";

import React, { useEffect, useState, useCallback } from "react";
import cx from "classnames";
import { CheckCircle, EyeOff, Trash2, Eye, CheckSquare, XSquare } from "lucide-react";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface FlaggedJob {
  id: number;
  title: string;
  company_name: string;
  status: string;
  ai_flag_reason?: string;
  created_at: string;
}

interface JobReport {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  reporter_email: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

type Tab = "flagged" | "reports";

export default function AdminJobsPage() {
  const [tab, setTab] = useState<Tab>("flagged");
  const [flaggedJobs, setFlaggedJobs] = useState<FlaggedJob[]>([]);
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchFlagged = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/jobs/flagged", { params: { page, page_size: PAGE_SIZE } });
      if (res.data?.success) setFlaggedJobs(res.data.data ?? []);
    } catch { toast.error("Không thể tải danh sách job bị flag."); }
    finally { setLoading(false); }
  }, [page]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/job-reports", { params: { page, page_size: PAGE_SIZE } });
      if (res.data?.success) setReports(res.data.data ?? []);
    } catch { toast.error("Không thể tải báo cáo."); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    setPage(1);
    if (tab === "flagged") fetchFlagged();
    else fetchReports();
  }, [tab]);

  useEffect(() => {
    if (tab === "flagged") fetchFlagged();
    else fetchReports();
  }, [page]);

  const jobAction = async (jobId: number, action: "allow" | "pause" | "close") => {
    try {
      await apiClient.post(`/admin/jobs/${jobId}/action`, { action });
      toast.success(`Đã ${action === "allow" ? "duyệt" : action === "pause" ? "ẩn" : "xóa"} job.`);
      fetchFlagged();
    } catch { toast.error("Thao tác thất bại."); }
  };

  const resolveReport = async (reportId: number, action: "resolve" | "dismiss") => {
    try {
      await apiClient.put(`/admin/job-reports/${reportId}/resolve`, { action });
      toast.success(action === "resolve" ? "Đã xử lý báo cáo." : "Đã bỏ qua báo cáo.");
      fetchReports();
    } catch { toast.error("Thao tác thất bại."); }
  };

  const REPORT_STATUS: Record<string, string> = {
    pending: "pending", resolved: "approved", dismissed: "gray",
  };

  return (
    <div>
      <Toaster />

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={cx(styles.tabBtn, { [styles.activeTab]: tab === "flagged" })} onClick={() => setTab("flagged")}>
            AI Flagged
          </button>
          <button className={cx(styles.tabBtn, { [styles.activeTab]: tab === "reports" })} onClick={() => setTab("reports")}>
            Báo cáo từ ứng viên
          </button>
        </div>

        {/* ── Tab: Flagged Jobs ── */}
        {tab === "flagged" && (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề Job</th>
                  <th>Công ty</th>
                  <th>Lý do AI gắn cờ</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}><div className={styles.emptyState}>Đang tải...</div></td></tr>
                ) : flaggedJobs.length === 0 ? (
                  <tr><td colSpan={5}><div className={styles.emptyState}>Không có job nào bị flag.</div></td></tr>
                ) : flaggedJobs.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{job.title}</td>
                    <td>{job.company_name}</td>
                    <td>
                      <span className={cx(styles.badge, styles.flagged)} style={{ maxWidth: "280px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.ai_flag_reason ?? "Không có lý do"}
                      </span>
                    </td>
                    <td><span className={cx(styles.badge, styles.info)}>{job.status}</span></td>
                    <td>
                      <div className={styles.actionGroup} style={{ justifyContent: "flex-end" }}>
                        <button className={cx(styles.btnSm, styles.green)} onClick={() => jobAction(job.id, "allow")}>
                          <CheckCircle size={13} /> Duyệt
                        </button>
                        <button className={cx(styles.btnSm, styles.amber)} onClick={() => jobAction(job.id, "pause")}>
                          <EyeOff size={13} /> Ẩn
                        </button>
                        <button className={cx(styles.btnSm, styles.red)} onClick={() => jobAction(job.id, "close")}>
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab: Reports ── */}
        {tab === "reports" && (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Job title</th>
                  <th>Công ty</th>
                  <th>Người báo cáo</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}><div className={styles.emptyState}>Đang tải...</div></td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={6}><div className={styles.emptyState}>Không có báo cáo nào.</div></td></tr>
                ) : reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{r.job_title}</td>
                    <td>{r.company_name}</td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{r.reporter_email}</td>
                    <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</td>
                    <td>
                      <span className={cx(styles.badge, styles[REPORT_STATUS[r.status] ?? "gray"])}>
                        {r.status === "pending" ? "Chờ" : r.status === "resolved" ? "Đã xử lý" : "Bỏ qua"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionGroup} style={{ justifyContent: "flex-end" }}>
                        <Link href={`/admin/companies`}>
                          <button className={cx(styles.btnSm, styles.blue)}><Eye size={13} /> Xem Job</button>
                        </Link>
                        {r.status === "pending" && (
                          <>
                            <button className={cx(styles.btnSm, styles.green)} onClick={() => resolveReport(r.id, "resolve")}>
                              <CheckSquare size={13} /> Xử lý
                            </button>
                            <button className={cx(styles.btnSm, styles.gray)} onClick={() => resolveReport(r.id, "dismiss")}>
                              <XSquare size={13} /> Bỏ qua
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
          <span style={{ fontSize: "0.8rem", color: "#64748b", padding: "0 0.5rem" }}>Trang {page}</span>
          <button disabled={(tab === "flagged" ? flaggedJobs : reports).length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Tiếp →</button>
        </div>
      </div>
    </div>
  );
}

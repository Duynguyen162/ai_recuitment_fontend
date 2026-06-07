"use client";

import React, { useEffect, useState } from "react";
import cx from "classnames";
import {
  X, MapPin, DollarSign, Calendar, Building,
  EyeOff, Trash2, Tag, ShieldAlert, CheckCircle,
  AlertTriangle, MinusCircle,
} from "lucide-react";
import adminStyles from "../../AdminLayout.module.scss";
import s from "./JobDetailPopup.module.scss";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";
import { JobDetail, AdminAction, formatSalary, formatDate } from "./types";

/* ─── Props ─── */
interface Props {
  jobId: number;
  reportId: number;
  reportStatus: "pending" | "resolved" | "dismissed";
  onClose: () => void;
  onReportAction: (
    reportId: number,
    status: "resolved" | "dismissed",
    adminAction: AdminAction,
  ) => Promise<void>;
  onJobAction: (jobId: number, action: "allow" | "close") => Promise<void>;
}

export default function JobDetailPopup({
  jobId, reportId, reportStatus, onClose, onReportAction, onJobAction,
}: Props) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"desc" | "req">("desc");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get(`/job/job_detail/${jobId}`);
        if (res.data?.success) setJob(res.data.data);
      } catch {
        toast.error("Không thể tải chi tiết job.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  /**
   * Hành động với job:
   *  - pause → API job action "pause" + auto resolve báo cáo với admin_action = "paused_job"
   *  - close → API job action "close" + auto resolve báo cáo với admin_action = "closed_job"
   *  - allow → chỉ mở lại tin, KHÔNG tự động resolve báo cáo
   */
  const handleJobAction = async (action: "allow"  | "close") => {
    if (!job) return;
    setActionLoading(true);
    try {
      await onJobAction(job.id, action);

      // Cập nhật local state
      const statusMap = { allow: "published", close: "closed" };
      setJob((prev) => prev ? {
        ...prev,
        status: statusMap[action],
        locked_by_admin: action === "close" ? true : action === "allow" ? false : prev.locked_by_admin,
      } : prev);

      if (reportStatus === "pending" && action !== "allow") {
        const actionMap: Record<"close", AdminAction> = {
          close: "closed_job",
        };
        await onReportAction(reportId, "resolved", actionMap[action]);
        return; 
      }
      onClose();
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const jobStatusClass = (status: string, locked?: boolean) => {
    if (locked && status === "closed") return adminStyles.rejected;
    if (status === "published") return adminStyles.approved;
    return adminStyles.gray;
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={s.header}>
          <span className={s.headerTitle}>Chi tiết tin tuyển dụng</span>
          <button className={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div className={adminStyles.emptyState}>Đang tải...</div>
        ) : !job ? (
          <div className={adminStyles.emptyState}>Không tải được thông tin job.</div>
        ) : (
          <>
            <div className={s.body}>
              {/* Job header */}
              <div className={s.jobHeader}>
                <div className={adminStyles.companyLogoMini}>
                  {job.company.logo_url && job.company.logo_url !== "string"
                    ? <img src={job.company.logo_url} alt={job.company.name} />
                    : <Building size={16} />}
                </div>
                <div className={s.jobInfo}>
                  <div className={s.companyName}>{job.company.name}</div>
                  <div className={s.jobTitle}>{job.title}</div>
                </div>
                <div className={s.badges}>
                  <span className={cx(adminStyles.badge, jobStatusClass(job.status, job.locked_by_admin))}>
                    {job.status}
                  </span>
                  {job.locked_by_admin && (
                    <span className={cx(adminStyles.badge, adminStyles.flagged, s.lockedBadge)}>
                      <ShieldAlert size={10} /> Admin đã khóa
                    </span>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className={s.metaRow}>
                <span className={s.metaItem}><MapPin size={13} />{job.location}</span>
                <span className={cx(s.metaItem, s.salary)}><DollarSign size={13} />{formatSalary(job.salary_min, job.salary_max)}</span>
                <span className={s.metaItem}><Calendar size={13} />Hạn: {formatDate(job.expired_at)}</span>
              </div>

              {/* Tags */}
              <div className={s.tagsRow}>
                {job.tags.map((t) => (
                  <span key={t} className={s.tag}><Tag size={10} />{t}</span>
                ))}
              </div>

              {/* Content tabs */}
              <div className={s.contentTabs}>
                {(["desc", "req"] as const).map((t) => (
                  <button
                    key={t}
                    className={cx(s.contentTabBtn, { [s.active]: activeTab === t })}
                    onClick={() => setActiveTab(t)}
                  >
                    {t === "desc" ? "Mô tả công việc" : "Yêu cầu ứng viên"}
                  </button>
                ))}
              </div>
              <div className={s.tabContent}>
                {activeTab === "desc"
                  ? <div className={s.tabContentInner} dangerouslySetInnerHTML={{ __html: job.description }} />
                  : <div className={s.tabContentInner} dangerouslySetInnerHTML={{ __html: job.requirements }} />}
              </div>
            </div>

            {/* Footer actions — chỉ hiển thị khi báo cáo chưa xử lý */}
            {reportStatus === "pending" && (
              <div className={s.footer}>

                {/* ── Hành động với job (kèm auto-resolve báo cáo) ── */}
                <div className={s.actionSection}>
                  <p className={s.actionSectionTitle}>
                    Xử lý tin tuyển dụng
                    <span className={s.autoResolveHint}>→ tự động đánh dấu báo cáo đã xử lý</span>
                  </p>
                  <div className={s.actionBtns}>
                    {/* close: Đóng & khóa + admin_action=closed_job */}
                    <button
                      className={cx(adminStyles.btnSm, adminStyles.red)}
                      disabled={actionLoading || (job.status === "closed" && !!job.locked_by_admin)}
                      onClick={() => handleJobAction("close")}
                    >
                      <Trash2 size={13} /> Đóng & Khóa tin
                    </button>
                  </div>
                  <p className={s.actionHint}>"Đóng & Khóa" ngăn HR tự mở lại. Chỉ Admin mới gỡ được.</p>
                </div>

                <hr className={s.divider} />

                 <div className={s.actionSection}>
                  <p className={s.actionSectionTitle}>Chỉ xử lý báo cáo (không tác động tin)</p>
                  <div className={s.actionBtns}>
                    {/* no_action: Bỏ qua hoàn toàn (dismissed) */}
                    <button
                      className={cx(adminStyles.btnSm, adminStyles.gray)}
                      disabled={actionLoading}
                      onClick={() => onReportAction(reportId, "dismissed", "no_action")}
                    >
                      <MinusCircle size={13} /> Bỏ qua báo cáo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

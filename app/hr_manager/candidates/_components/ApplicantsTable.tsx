"use client";

import Link from "next/link";
import { Eye, FileText, Lock, Mail, RefreshCw, Sparkles, StickyNote, User } from "lucide-react";
import cx from "classnames";

import Button from "@/components/ui/Button";

import { getAvailableActions, STATUS_LABELS } from "../_lib/constants";
import {
    canEditInterviewNotes,
    getInterviewSummary,
    getScoreTone,
    shouldShowActionControls,
} from "../_lib/helpers";
import { Applicant, AppStatus, CandidatesTab } from "../_lib/types";
import styles from "../candidates.module.scss";

interface ApplicantsTableProps {
    applicants: Applicant[];
    jobsLoading: boolean;
    applicantsLoading: boolean;
    loadingCompany: boolean;
    activeTab: CandidatesTab;
    isVip: boolean;
    page: number;
    pageSize: number;
    totalApplicants: number;
    isFetchingBackground: boolean;
    onPageChange: (newPage: number) => void;
    onPreviewCv: (applicationId: number) => void;
    onViewProfile: (applicant: Applicant) => void;
    onOpenAiReview: (applicant: Applicant) => void;
    onSelectAction: (applicant: Applicant, nextStatus: AppStatus) => void;
    onOpenNotes: (applicant: Applicant) => void;
}

function getActionLabel(status: AppStatus) {
    switch (status) {
        case "interviewing":
            return "Phỏng vấn";
        case "hired":
            return "Tuyển dụng";
        case "rejected":
            return "Từ chối";
        case "applied":
            return "Chờ duyệt";
        case "withdrawn":
            return "Hủy/Rút lui";
        case "left_company":
            return "Đã nghỉ việc";
    }
}

export default function ApplicantsTable({
    applicants,
    jobsLoading,
    applicantsLoading,
    loadingCompany,
    activeTab,
    isVip,
    page,
    pageSize,
    totalApplicants,
    isFetchingBackground,
    onPageChange,
    onPreviewCv,
    onViewProfile,
    onOpenAiReview,
    onSelectAction,
    onOpenNotes,
}: ApplicantsTableProps) {
    const availableActions = getAvailableActions(activeTab);
    const showActionControls = shouldShowActionControls(activeTab);
    const totalPages = Math.max(1, Math.ceil(totalApplicants / pageSize));

    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        <th>Ứng viên</th>
                        <th>Vị trí ứng tuyển (Job)</th>
                        {activeTab !== "interviewing" && <th>Ngày nộp</th>}
                        {activeTab !== "interviewing" && <th>CV</th>}
                        {activeTab !== "interviewing" && (
                            <th>
                                <div className={styles.aiHeading}>
                                    AI Match <Sparkles size={14} color="#3b82f6" />
                                </div>
                            </th>
                        )}
                        {activeTab !== "interviewing" && <th>Trạng thái</th>}
                        <th style={{ textAlign: "right" }}>Hành động</th>
                    </tr>
                </thead>
                <tbody style={{ opacity: isFetchingBackground ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    {jobsLoading || (applicantsLoading && applicants.length === 0) || loadingCompany ? (
                        <tr>
                            <td colSpan={7} className={styles.tableMessage}>
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    ) : applicants.length === 0 ? (
                        <tr>
                            <td colSpan={7} className={styles.tableMessage}>
                                Chưa có ứng viên phù hợp với bộ lọc hiện tại.
                            </td>
                        </tr>
                    ) : (
                        applicants.map((app) => {
                            const interviewSummary = getInterviewSummary(app.interview);

                            return (
                                <tr key={app.id}>
                                    <td>
                                        <div className={styles.candidateInfo}>
                                            <div className={styles.avatar}>
                                                {app.candidate_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={styles.name}>{app.candidate_name}</div>
                                                <div className={styles.email}>
                                                    <Mail size={12} />
                                                    {app.email}
                                                </div>
                                                {activeTab === "interviewing" && interviewSummary && (
                                                    <div className={styles.interviewCard} style={{ marginTop: "0.5rem" }}>
                                                        <div className={styles.interviewHeader}>
                                                            {interviewSummary}
                                                        </div>
                                                        {(app.interview?.meeting_link || app.interview?.location) && (
                                                            <div className={styles.interviewDetail}>
                                                                {app.interview.meeting_link?.trim()
                                                                    ? "Link: " + app.interview.meeting_link
                                                                    : "Địa chỉ: " + app.interview.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: "#334155", fontSize: "0.875rem" }}>
                                            {app.job_title || "Chưa cập nhật"}
                                        </div>
                                    </td>
                                    {activeTab !== "interviewing" && (
                                        <td>
                                            <div className={styles.dateApply}>
                                                {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                                            </div>
                                        </td>
                                    )}
                                    {activeTab !== "interviewing" && (
                                        <td>
                                            {app.cv_type === "profile" ? (
                                                <button
                                                    type="button"
                                                    className={styles.cvPreviewBtn}
                                                    style={{ background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" }}
                                                    onClick={() => onViewProfile(app)}
                                                >
                                                    <User size={14} />
                                                    Xem hồ sơ
                                                </button>
                                            ) : app.cv_id ? (
                                                <button
                                                    type="button"
                                                    className={styles.cvPreviewBtn}
                                                    onClick={() => onPreviewCv(app.application_id)}
                                                >
                                                    <FileText size={14} />
                                                    {app.cv_name ?? "Xem CV"}
                                                </button>
                                            ) : (
                                                <span className={styles.cvMissing}>Chưa có CV</span>
                                            )}
                                        </td>
                                    )}
                                    {activeTab !== "interviewing" && (
                                        <td>
                                            {isVip ? (
                                                app.ai_status === "done" || app.ai_score > 0 ? (
                                                    <div
                                                        className={cx(
                                                            styles.aiScore,
                                                            styles[getScoreTone(app.ai_score)],
                                                        )}
                                                    >
                                                        {app.ai_score}
                                                    </div>
                                                ) : app.ai_status === "dead" ? (
                                                    <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }} title="AI phân tích thất bại hoàn toàn.">
                                                        Thất bại
                                                    </span>
                                                ) : app.ai_status === "failed" ? (
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "#f59e0b",
                                                            fontWeight: 600,
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "0.25rem",
                                                            whiteSpace: "nowrap"
                                                        }}
                                                        title="Hệ thống đang tự động thử chấm điểm lại..."
                                                    >
                                                        <RefreshCw size={12} className="animate-spin" />
                                                        Đang thử lại...
                                                    </div>
                                                ) : app.ai_status === "processing" || app.ai_status === "queued" || app.ai_status === "not_queued" ? (
                                                    <div
                                                        style={{
                                                            background: "#f8fafc",
                                                            color: "#64748b",
                                                            border: "1px dashed #cbd5e1",
                                                            fontSize: "0.75rem",
                                                            padding: "0.4rem 0.6rem",
                                                            borderRadius: "999px",
                                                            fontWeight: 600,
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "0.25rem",
                                                            whiteSpace: "nowrap"
                                                        }}
                                                        title="Đang phân tích AI..."
                                                    >
                                                        <Sparkles size={12} className="animate-pulse" color="#3b82f6" />
                                                        Đang quét...
                                                    </div>
                                                ) : (
                                                    // "pending" hoặc không xác định: chưa có dữ liệu từ AI
                                                    <span style={{ color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600 }} title="Chưa có điểm AI">–</span>
                                                )
                                            ) : (
                                                <Link
                                                    href="/hr_manager/pricing"
                                                    className={styles.lockedAi}
                                                    title="Nâng cấp VIP để xem điểm"
                                                >
                                                    <Lock size={14} />
                                                    VIP
                                                </Link>
                                            )}
                                        </td>
                                    )}
                                    {activeTab !== "interviewing" && (
                                        <td>
                                            <div className={styles.statusCell}>
                                                <span
                                                    className={cx(styles.statusBadge, styles[app.status])}
                                                >
                                                    {STATUS_LABELS[app.status]}
                                                </span>
                                                {interviewSummary && (
                                                    <div className={styles.interviewCard}>
                                                        <div className={styles.interviewHeader}>
                                                            {interviewSummary}
                                                        </div>
                                                        {(app.interview?.meeting_link || app.interview?.location) && (
                                                            <div className={styles.interviewDetail}>
                                                                {app.interview.meeting_link?.trim()
                                                                    ? "Link: " + app.interview.meeting_link
                                                                    : "Địa chỉ: " + app.interview.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td style={{ textAlign: "right" }}>
                                        <div className={styles.actionGroup}>
                                            {showActionControls && availableActions.length > 0 && (
                                                <select
                                                    className={styles.actionSelect}
                                                    value=""
                                                    onChange={(event) => {
                                                        const value = event.target.value as AppStatus | "";
                                                        if (!value) return;
                                                        onSelectAction(app, value);
                                                    }}
                                                >
                                                    <option value="">Chọn xử lý</option>
                                                    {availableActions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {getActionLabel(status)}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {canEditInterviewNotes(app.status, activeTab) && (
                                                <Button
                                                    variant={app.notes ? "primary" : "outline"}
                                                    className={styles.noteBtnSmall}
                                                    onClick={() => onOpenNotes(app)}
                                                    title="Chi tiết & Ghi chú phỏng vấn"
                                                >
                                                    <StickyNote size={14} />
                                                    Chi tiết & Ghi chú
                                                </Button>
                                            )}

                                            {activeTab !== "interviewing" && (
                                                <button
                                                    className={styles.btnEye}
                                                    title={
                                                        isVip ? "Xem nhận xét AI" : "Tính năng dành cho VIP"
                                                    }
                                                    onClick={() => onOpenAiReview(app)}
                                                >
                                                    {isVip ? <Eye size={18} /> : <Lock size={18} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalApplicants > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalApplicants)} trong số {totalApplicants} ứng viên
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '40%' }}>
                        <Button
                            variant="outline"
                            disabled={page <= 1 || isFetchingBackground}
                            onClick={() => onPageChange(page - 1)}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                            Trước
                        </Button>
                        <span style={{ display: 'flex', alignItems: 'center', color: "#334155", padding: '0 0.5rem', fontSize: '0.875rem', fontWeight: 500, width: '100%', justifyContent: 'center' }}>
                            Trang {page} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={page >= totalPages || isFetchingBackground}
                            onClick={() => onPageChange(page + 1)}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

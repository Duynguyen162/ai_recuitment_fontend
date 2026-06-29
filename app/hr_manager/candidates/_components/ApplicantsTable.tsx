"use client";

import Link from "next/link";
import { Eye, FileText, Lock, Mail, RefreshCw, Sparkles, StickyNote, User, Clock, Video, MapPin, Edit3 } from "lucide-react";
import cx from "classnames";

import Button from "@/components/ui/Button";

import { getAvailableActions, STATUS_LABELS } from "../_lib/constants";
import {
    canEditInterviewNotes,
    getInterviewSummary,
    getScoreTone,
} from "../_lib/helpers";
import { Applicant, AppStatus, CandidatesTab } from "../_lib/types";
import styles from "../candidates.module.scss";

function getAvatarUrl(url: string | null | undefined) {
    if (!url) return undefined;
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/${url}`;
}

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
    onReschedule?: (applicant: Applicant) => void;
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
    onReschedule,
}: ApplicantsTableProps) {
    const totalPages = Math.max(1, Math.ceil(totalApplicants / pageSize));

    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        <th>Ứng viên</th>
                        {/* <th>Vị trí ứng tuyển (Job)</th> */}
                        {activeTab !== "interviewing" ? (
                            <>
                                <th>Ngày nộp</th>
                                <th>CV</th>
                                <th>
                                    <div className={styles.aiHeading}>
                                        AI Match <Sparkles size={14} color="#3b82f6" />
                                    </div>
                                </th>
                                <th>Trạng thái</th>
                            </>
                        ) : (
                            <>
                                <th>CV & AI Score</th>
                                <th>Lịch phỏng vấn</th>
                                <th>Hình thức</th>
                            </>
                        )}
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
                                            <div className={styles.avatar} style={app.avatar_url ? { padding: 0, overflow: "hidden" } : {}}>
                                                {app.avatar_url ? (
                                                    <img src={getAvatarUrl(app.avatar_url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    app.candidate_name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className={styles.name}>{app.candidate_name}</div>
                                                <div className={styles.email}>
                                                    <Mail size={12} />
                                                    {app.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {/* <td>
                                        <div style={{ fontWeight: 600, color: "#334155", fontSize: "0.875rem" }}>
                                            {app.job_title || "Chưa cập nhật"}
                                        </div>
                                    </td> */}
                                    {activeTab !== "interviewing" ? (
                                        <>
                                            <td>
                                                <div className={styles.dateApply}>
                                                    {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                                                </div>
                                            </td>
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
                                        </>
                                    ) : (
                                        <>
                                            {/* CV & AI Match column for Interviewing Tab */}
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                                    {app.cv_type === "profile" ? (
                                                        <button
                                                            type="button"
                                                            className={styles.cvPreviewBtn}
                                                            style={{ background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe", padding: "0.25rem 0.5rem", width: "fit-content" }}
                                                            onClick={() => onViewProfile(app)}
                                                        >
                                                            <User size={12} />
                                                            Profile
                                                        </button>
                                                    ) : app.cv_id ? (
                                                        <button
                                                            type="button"
                                                            className={styles.cvPreviewBtn}
                                                            style={{ padding: "0.25rem 0.5rem", width: "fit-content" }}
                                                            onClick={() => onPreviewCv(app.application_id)}
                                                        >
                                                            <FileText size={12} />
                                                            CV File
                                                        </button>
                                                    ) : (
                                                        <span className={styles.cvMissing}>Chưa có CV</span>
                                                    )}

                                                    {isVip && (app.ai_status === "done" || app.ai_score > 0) && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                                                            <Sparkles size={11} color="#3b82f6" />
                                                            AI: <span className={cx(styles[getScoreTone(app.ai_score)])} style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", border: "1px solid" }}>{app.ai_score}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Interview schedule column */}
                                            <td>
                                                {app.interview ? (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700, color: "#1e293b", fontSize: "0.8rem" }}>
                                                            <Clock size={14} style={{ color: "#64748b" }} />
                                                            {new Date(app.interview.interview_time).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                                                        </div>
                                                        <div>
                                                            <span style={{
                                                                padding: "0.15rem 0.5rem",
                                                                borderRadius: "999px",
                                                                fontSize: "0.68rem",
                                                                fontWeight: 700,
                                                                background: new Date(app.interview.interview_time) > new Date() ? "#eff6ff" : "#f1f5f9",
                                                                color: new Date(app.interview.interview_time) > new Date() ? "#1d4ed8" : "#475569"
                                                            }}>
                                                                {new Date(app.interview.interview_time) > new Date() ? "Sắp diễn ra" : "Đã diễn ra"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Chưa có lịch hẹn</span>
                                                )}
                                            </td>

                                            {/* Interview mode / location column */}
                                            <td>
                                                {app.interview ? (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxWidth: "200px" }}>
                                                        {app.interview.meeting_link?.trim() ? (
                                                            <>
                                                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                                                    <Video size={12} />
                                                                    Trực tuyến
                                                                </span>
                                                                <a
                                                                    href={app.interview.meeting_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ fontSize: "0.72rem", color: "#2563eb", textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}
                                                                >
                                                                    Link họp trực tuyến
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#e11d48", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                                                    <MapPin size={12} />
                                                                    Trực tiếp (Offline)
                                                                </span>
                                                                <span
                                                                    style={{ fontSize: "0.72rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                                    title={app.interview.location}
                                                                >
                                                                    {app.interview.location || "Chưa có địa chỉ"}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>–</span>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    <td style={{ textAlign: "right" }}>
                                        <div className={styles.actionGroup}>
                                            {/* For interviewing tab, add "Đổi lịch" button directly */}
                                            {activeTab === "interviewing" && onReschedule && (
                                                <Button
                                                    variant="outline"
                                                    className={styles.noteBtnSmall}
                                                    style={{ borderColor: "#cbd5e1", padding: "0.25rem 0.5rem" }}
                                                    onClick={() => onReschedule(app)}
                                                >
                                                    <Edit3 size={12} />
                                                    Đổi lịch
                                                </Button>
                                            )}

                                            {getAvailableActions(app.status).length > 0 && (
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
                                                    {getAvailableActions(app.status).map((status) => (
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
                                                    Ghi chú
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

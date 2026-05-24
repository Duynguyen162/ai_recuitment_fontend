"use client";

import React, { useState, useEffect } from "react";
import cx from "classnames";
import JobAIChat from "./JobAIChat";
import {
    MapPin,
    DollarSign,
    Calendar,
    ShieldCheck,
    Bookmark,
    Sparkles,
    Flag,
    Building,
} from "lucide-react";
import axios from "axios";
import styles from "./JobDetail.module.scss";
import { useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import ApplyJobModal from "./ApplyJobModal";
import ConfirmModal from "../ui/ConfirmModal";
import { formatDate } from "@/utils/formatDate";
import { formatSalary } from "@/utils/formatSalary";
import { useAuthStore } from "@/store/authStore";

// Giao diện dữ liệu chuẩn theo API cung cấp
interface Company {
    id: number;
    name: string;
    logo_url: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}
interface JobData {
    id: number;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary_min: number;
    salary_max: number;
    years_of_experience: number;
    tags: string[];
    job_type: string;
    status: string;
    created_at: string;
    expired_at: string;
    company: Company;
    is_save: boolean;
    has_applied: boolean;
    application_status?: string; // TODO: Backend cần bổ sung trường này để Frontend biết trạng thái đơn ứng tuyển hiện tại (pending, review, interviewing, rejected...)
}

export default function JobDetailPage() {
    const [job, setJob] = useState<JobData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState("");
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [activeTab, setActiveTab] = useState<"desc" | "req">("desc");

    // Trạng thái (Thường lấy từ backend sau khi user đăng nhập)
    const [hasApplied, setHasApplied] = useState(false);
    const [aiScore, setAiScore] = useState<number | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: string | null;
    }>({
        isOpen: false,
        id: null,
    });
    const [confirmUnsave, setConfirmUnsave] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isReporting, setIsReporting] = useState(false);

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const res = await apiClient.get(`/job/job_detail/${id}`);
                if (res.data.success) {
                    setJob(res.data.data);
                    setHasApplied(res.data.data.has_applied);
                    setIsSaved(res.data.data.is_save);
                } else {
                    setError("Không thể tải thông tin việc làm.");
                }
            } catch (err) {
                console.error(err);
                setError("Đã xảy ra lỗi khi kết nối đến máy chủ.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [id]);
    const { user } = useAuthStore();

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.stateWrapper}>
                    <span className={styles.loadingText}>
                        Đang tải thông tin việc làm...
                    </span>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className={styles.container}>
                <div className={styles.stateWrapper}>
                    <div className={styles.errorBox}>
                        {error || "Việc làm không tồn tại hoặc đã bị xóa."}
                    </div>
                </div>
            </div>
        );
    }

    const openDeleteConfirm = (id: string) => {
        setConfirmModal({ isOpen: true, id: id });
    };
    const executeDelete = async (id: string) => {
        if (!confirmModal.id) return;

        setIsDeleting(true); // Bật loading của Modal
        try {
            await apiClient.delete("/application/delete_apply", {
                params: { job_id: Number(id) },
            });
            setHasApplied(false);
            toast.success("Đã xóa hủy ứng tuyển thành công");
        } catch (error) {
            toast.error("Lỗi khi xóa");
        } finally {
            setIsDeleting(false);
            setConfirmModal({ isOpen: false, id: null }); // Đóng modal và reset ID
        }
    };

    const handleSaveJob = async (jobId: number) => {
        try {
            await apiClient.post(`/job/save_job/${jobId}`);
            setIsSaved(true);
            toast.success("Đã lưu công việc");
        } catch (error) {
            toast.error("Lỗi khi lưu công việc");
        }
    };
    const handleUnsaveJob = async (jobId: number) => {
        try {
            await apiClient.delete(`/job/delete_saved_job`, {
                params: { job_id: jobId },
            });
            setIsSaved(false);
            toast.success("Đã bỏ lưu công việc");
        } catch (error) {
            toast.error("Lỗi khi bỏ lưu");
        }
    };

    const handleReportJob = async () => {
        if (!job || !reportReason.trim()) return;

        if (!user) {
            toast.error("Vui lòng đăng nhập để thực hiện tính năng này");
            return;
        }

        setIsReporting(true);
        try {
            await apiClient.post(`/job/report_job?job_id=${job.id}`, { reason: reportReason.trim() });
            toast.success("Đã gửi báo cáo thành công");
            setReportModal(false);
            setReportReason("");
        } catch (error) {
            toast.error("Lỗi khi gửi báo cáo");
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                <div className={styles.contentColumn}>
                    <div className={styles.headerCard}>
                        <div className={styles.companyInfo}>
                            <div className={styles.logoWrapper}>
                                {job.company.logo_url && job.company.logo_url !== "string" ? (
                                    <img src={job.company.logo_url} alt={job.company.name} />
                                ) : (
                                    <Building />
                                )}
                            </div>

                            <div>
                                <div className={styles.companyNameRow}>
                                    {job.company.name}
                                    <ShieldCheck className={styles.verifiedIcon} />
                                </div>
                                <h1 className={styles.jobTitle}>{job.title}</h1>
                            </div>
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <MapPin /> {job.location}
                            </div>
                            <div className={cx(styles.metaItem, styles.salary)}>
                                <DollarSign />
                                {formatSalary(job.salary_min, job.salary_max)}
                            </div>
                            <div className={styles.metaItem}>
                                <Calendar /> Hạn nộp: {formatDate(job.expired_at)}
                            </div>
                        </div>

                        <div className={styles.tagsRow}>
                            <span className={styles.tagType}>
                                {job.job_type === "full_time" ? "Toàn thời gian" : job.job_type}
                            </span>
                            {job.tags.map((tag) => (
                                <span key={tag} className={styles.tagSkill}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.tabSection}>
                        <div className={styles.tabHeaders}>
                            <button
                                className={cx(styles.tabBtn, {
                                    [styles.active]: activeTab === "desc",
                                })}
                                onClick={() => setActiveTab("desc")}
                            >
                                Mô tả công việc
                            </button>
                            <button
                                className={cx(styles.tabBtn, {
                                    [styles.active]: activeTab === "req",
                                })}
                                onClick={() => setActiveTab("req")}
                            >
                                Yêu cầu ứng viên
                            </button>
                        </div>

                        <div className={styles.tabContent}>
                            {activeTab === "desc" && (
                                <div dangerouslySetInnerHTML={{ __html: job.description }} />
                            )}
                            {activeTab === "req" && (
                                <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
                            )}
                        </div>
                    </div>

                    <button className={styles.reportBtn} onClick={() => setReportModal(true)}>
                        <Flag /> Báo cáo tin tuyển dụng lừa đảo
                    </button>
                </div>

                {/* CỘT PHẢI: ACTION PANEL */}
                <aside className={styles.actionColumn}>
                    <div className={styles.stickyPanel}>
                        <div className={styles.actionCard}>
                            <button
                                className={hasApplied ? styles.dltApplyBtn : styles.applyBtn}
                                disabled={job.status !== "published" || (hasApplied && !!job.application_status && !['pending', 'review', 'applied'].includes(job.application_status))}
                                onClick={() => {
                                    if (hasApplied) {
                                        openDeleteConfirm(job.id.toString());
                                    } else {
                                        setIsApplyModalOpen(true);
                                    }
                                }}
                            >
                                {hasApplied
                                    ? (job.application_status && !['pending', 'review', 'applied'].includes(job.application_status) ? "Đơn đã được xử lý" : "Hủy ứng tuyển")
                                    : job.status !== "published"
                                        ? "Tin đã đóng"
                                        : "Ứng tuyển ngay"}
                            </button>

                            {/* NHÚNG MODAL */}
                            {isApplyModalOpen && (
                                <ApplyJobModal
                                    jobId={job.id.toString()}
                                    jobTitle={job.title}
                                    onClose={() => setIsApplyModalOpen(false)}
                                    onSuccess={() => {
                                        setHasApplied(true);
                                    }}
                                />
                            )}
                            <button
                                className={cx(styles.saveBtn, { [styles.saved]: isSaved })}
                                onClick={() => {
                                    if (isSaved) {
                                        setConfirmUnsave(true);
                                    } else {
                                        handleSaveJob(job.id);
                                    }
                                }}
                            >
                                <Bookmark fill={isSaved ? "#0284c7" : "none"} />
                                {isSaved ? "Đã lưu" : "Lưu việc làm"}
                            </button>

                            {aiScore && (
                                <div className={styles.aiMatchCard}>
                                    <div className={styles.scoreHeader}>
                                        <Sparkles /> Phân tích AI: {aiScore}/100
                                    </div>
                                    <div className={styles.scoreText}>
                                        Đang chờ cập nhật API phân tích chi tiết...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.companySummaryCard}>
                            <h4>Thông tin công ty</h4>
                            <div className={styles.companyNameTxt}>{job.company.name}</div>
                            <a
                                href={`/candidate/companies/${job.company.id}`}
                                className={styles.viewProfileLink}
                            >
                                Xem trang công ty →
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Rút đơn ứng tuyển"
                message="Bạn có chắc chắn muốn rút đơn ứng tuyển này không? Hành động này không thể hoàn tác."
                confirmText="Rút đơn"
                cancelText="Giữ lại"
                onConfirm={() => executeDelete(confirmModal.id!)}
                onCancel={() => setConfirmModal({ isOpen: false, id: null })}
                isLoading={isDeleting}
            />
            <ConfirmModal
                isOpen={confirmUnsave}
                title="Bỏ lưu công việc"
                message="Bạn có chắc muốn bỏ lưu công việc này không?"
                confirmText="Bỏ lưu"
                cancelText="Hủy"
                onConfirm={async () => {
                    await handleUnsaveJob(job.id);
                    setConfirmUnsave(false);
                }}
                onCancel={() => setConfirmUnsave(false)}
            />
            {/* POPUP BÁO CÁO LỪA ĐẢO */}
            {reportModal && (
                <div className={styles.reportOverlay} onClick={() => setReportModal(false)}>
                    <div className={styles.reportPopup} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.reportPopupTitle}>
                            <Flag size={18} /> Báo cáo tin tuyển dụng lừa đảo
                        </h3>
                        <p className={styles.reportPopupDesc}>Vui lòng mô tả lý do bạn cho rằng tin này có dấu hiệu lừa đảo.</p>
                        <textarea
                            className={styles.reportTextarea}
                            placeholder="Nhập lý do báo cáo..."
                            rows={4}
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />
                        <div className={styles.reportActions}>
                            <button
                                className={styles.reportCancelBtn}
                                onClick={() => { setReportModal(false); setReportReason(""); }}
                                disabled={isReporting}
                            >
                                Hủy
                            </button>
                            <button
                                className={styles.reportSubmitBtn}
                                onClick={handleReportJob}
                                disabled={!reportReason.trim() || isReporting}
                            >
                                {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Toaster />
            {job.status === "published" && <JobAIChat companyName={job.company.name} jobId={job.id} />}
        </div>
    );
}

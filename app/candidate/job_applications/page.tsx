"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    Calendar,
    FileText,
    XCircle,
    Eye,
    Clock,
    CheckCircle,
    XSquare,
    Sparkles,
} from "lucide-react";
import cx from "classnames";
import styles from "./job_application.module.scss";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";
import Link from "next/link"; // Dùng để chuyển hướng sang trang xem Job
import { previewFileFromServer } from "@/utils/fileUtils";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

// 1. Định nghĩa các trạng thái chuẩn của ATS
type AppStatus =
    | "pending"
    | "review"
    | "interviewing"
    | "hired"
    | "rejected"
    | "withdrawn"
    | "left_company";

interface Application {
    id: string;
    job_id: string;
    job_title: string;
    company_name: string;
    status: AppStatus;
    applied_at: string;
    cv_id: string;
    cv_name: string; // Tên file CV ứng viên đã chọn nộp
    cv_url: string; // URL để preview file
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: string | null;
    }>({
        isOpen: false,
        id: null,
    });

    // Lấy danh sách đơn ứng tuyển
    const fetchApplications = async () => {
        try {
            const res = await apiClient.get("/application/get_apply_job");
            setApplications(res.data.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách ứng tuyển:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const openDeleteConfirm = (id: string) => {
        setConfirmModal({ isOpen: true, id: id });
    };
    const executeDelete = async (id: string) => {
        if (!confirmModal.id) return;

        setIsDeleting(true); // Bật loading của Modal
        try {
            await apiClient.delete("/application/delete_apply", {
                params: { job_id: id },
            });
            setApplications((prev) =>
                prev.filter((app) => app.job_id !== id)
            );
            toast.success("Đã rút đơn ứng tuyển thành công");
        } catch (error) {
            toast.error("Lỗi khi xóa");
        } finally {
            setIsDeleting(false);
            setConfirmModal({ isOpen: false, id: null }); // Đóng modal và reset ID
        }
    };

    const handlePreviewCV = async (cvUrl: string) => {
        if (!cvUrl) {
            toast.error("Không có file để xem");
            return;
        }
        try {
            await previewFileFromServer(cvUrl);
        } catch (error) {
            console.log(error);
            alert("Không thể xem file CV lúc này.");
        }
    };
    // Helper function để render Badge trạng thái
    const renderStatusBadge = (status: AppStatus) => {
        switch (status) {
            case "pending":
                return (
                    <span className={cx(styles.badge, styles.pending)}>
                        <Clock size={14} /> Chờ nhà tuyển dụng
                    </span>
                );
            case "review":
                return (
                    <span className={cx(styles.badge, styles.reviewed)}>
                        <Eye size={14} /> Đã xem hồ sơ
                    </span>
                );
            case "interviewing":
                return (
                    <span className={cx(styles.badge, styles.interview)}>
                        <CheckCircle size={14} /> Mời phỏng vấn
                    </span>
                );
            case "hired":
                return (
                    <span className={cx(styles.badge, styles.accepted)}>
                        <CheckCircle size={14} /> Đã trúng tuyển
                    </span>
                );
            case "rejected":
                return (
                    <span className={cx(styles.badge, styles.rejected)}>
                        <XSquare size={14} /> Không phù hợp
                    </span>
                );
            case "withdrawn":
                return (
                    <span className={cx(styles.badge, styles.cancelled)}>
                        <XCircle size={14} /> Đã rút đơn
                    </span>
                );
            case "left_company":
                return (
                    <span className={cx(styles.badge, styles.cancelled)}>
                        <XCircle size={14} /> Đã nghỉ việc
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <div style={{ height: '40px', width: '300px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '10px' }} />
                    <div style={{ height: '20px', width: '500px', background: '#f1f5f9', borderRadius: '6px' }} />
                </div>
                <div className={styles.appList}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '140px', background: '#f8fafc', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Đơn ứng tuyển của tôi</h1>
                <p>Theo dõi tiến độ và quản lý các công việc bạn đã nộp hồ sơ.</p>
            </div>

            <div className={styles.appList}>
                {applications.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "#fff",
                            borderRadius: "1.25rem",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Empty</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Chưa có đơn ứng tuyển nào</h3>
                        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                            Hãy bắt đầu tìm kiếm công việc mơ ước của bạn ngay hôm nay!
                        </p>
                        <Link href="/candidate/search_job">
                            <Button variant="primary">Khám phá việc làm</Button>
                        </Link>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app.id} className={styles.appCard}>
                            {/* Thông tin công việc */}
                            <div className={styles.jobInfo}>
                                <Link href={`/candidate/job_detail?id=${app.job_id}`} className={styles.jobTitle}>
                                    {app.job_title}
                                </Link>
                                <div className={styles.companyName}>
                                    <Building2 size={18} /> {app.company_name}
                                </div>

                                <div className={styles.metaInfo}>
                                    <div className={styles.metaItem}>
                                        <Calendar size={16} />
                                        <span>Nộp ngày: {new Date(app.applied_at).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <FileText size={16} />
                                        <span>CV: </span>
                                        <span
                                            className={styles.cvLink}
                                            onClick={() => handlePreviewCV(app.cv_url)}
                                        >
                                            {app.cv_name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái và Hành động */}
                            <div className={styles.statusSection}>
                                {renderStatusBadge(app.status)}

                                <div className={styles.actionButtons}>
                                    <Link href={`/candidate/job_detail?id=${app.job_id}`}>
                                        <button className={styles.viewBtn}>Chi tiết</button>
                                    </Link>

                                    {(app.status === "pending" || app.status === "review") && (
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={() => openDeleteConfirm(app.job_id)}
                                        >
                                            Rút đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Xác nhận rút đơn"
                message="Bạn có chắc chắn muốn rút đơn ứng tuyển này? Nhà tuyển dụng sẽ không còn thấy hồ sơ của bạn cho vị trí này nữa."
                confirmText="Xác nhận rút đơn"
                cancelText="Hủy bỏ"
                onConfirm={() => executeDelete(confirmModal.id!)}
                onCancel={() => setConfirmModal({ isOpen: false, id: null })}
                isLoading={isDeleting}
            />
            <Toaster />
        </div>
    );
}

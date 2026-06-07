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
    X,
    MapPin,
    Video,
    User,
    Phone,
    Mail,
    AlertCircle,
    ExternalLink,
    CalendarClock,
    Briefcase,
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

    // Trạng thái cho Popup chi tiết đơn ứng tuyển / lịch phỏng vấn
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [appDetailData, setAppDetailData] = useState<any>(null);

    const handleOpenDetailModal = async (app: Application) => {
        setSelectedApp(app);
        setIsDetailModalOpen(true);
        setDetailLoading(true);

        try {

            const res = await apiClient.get("/application/get_application_detail", {
                params: { job_id: app.job_id }
            });
            if (res.data.success) {
                setAppDetailData(res.data.data);
            }

        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn ứng tuyển:", error);
            toast.error("Không thể tải thông tin chi tiết lúc này.");
        } finally {
            setDetailLoading(false);
        }
    };

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
            toast.error("CV là Hồ sơ của bạn");
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

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Đơn ứng tuyển của tôi</h1>
                <p>Theo dõi tiến độ và quản lý các công việc bạn đã nộp hồ sơ.</p>
            </div>

            <div className={cx(styles.appListWrapper, { [styles.isLoading]: loading })}>
                {loading && <div className={styles.topLoader}></div>}

                <div className={styles.appList}>
                    {(!applications || applications.length === 0) && !loading ? (
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
                                                {app.cv_name == "Không có CV" ? "CV là hồ sơ" : app.cv_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trạng thái và Hành động */}
                                <div className={styles.statusSection}>
                                    {renderStatusBadge(app.status)}

                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.viewBtn}
                                            onClick={() => handleOpenDetailModal(app)}
                                        >
                                            Chi tiết
                                        </button>

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

            {/* POPUP CHI TIẾT ĐƠN ỨNG TUYỂN / LỊCH PHỎNG VẤN */}
            {isDetailModalOpen && selectedApp && (
                <div className={styles.modalOverlay} onClick={() => setIsDetailModalOpen(false)}>
                    <div style={{ border: "none", borderRadius: "1.5rem", overflow: "hidden" }}>
                        <div className={styles.detailModalCard} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>
                                    <Briefcase size={20} className={styles.headerIcon} />
                                    Thông tin chi tiết đơn ứng tuyển
                                </h3>
                                <button className={styles.closeBtn} onClick={() => setIsDetailModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                {/* Thông tin tóm tắt vị trí */}
                                <div className={styles.summaryBox}>
                                    <h4 className={styles.jobTitle}>{selectedApp.job_title}</h4>
                                    <div className={styles.companyName}>
                                        <Building2 size={16} /> {selectedApp.company_name}
                                    </div>
                                    <div className={styles.badgeRow}>
                                        {renderStatusBadge(selectedApp.status)}
                                        <span className={styles.appliedDate}>
                                            Nộp ngày: {new Date(selectedApp.applied_at).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                </div>

                                {detailLoading ? (
                                    <div className={styles.loadingBox}>
                                        <div className={styles.spinner}></div>
                                        <p>Đang tải thông tin chi tiết...</p>
                                    </div>
                                ) : appDetailData ? (
                                    <>
                                        {/* NẾU LÀ REJECTED */}
                                        {selectedApp.status === "rejected" && (
                                            <div className={styles.rejectionBox}>
                                                <div className={styles.rejectionTitle}>
                                                    <XCircle size={18} /> Thông báo từ Nhà tuyển dụng
                                                </div>
                                                <div className={styles.rejectionReason}>
                                                    {appDetailData.rejection_reason || "Hồ sơ của bạn chưa phù hợp với vị trí này trong đợt tuyển dụng hiện tại."}
                                                </div>
                                                {appDetailData.rejected_at && (
                                                    <div className={styles.metaTime}>
                                                        Thời gian phản hồi: {new Date(appDetailData.rejected_at).toLocaleString("vi-VN")}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* NẾU LÀ INTERVIEWING HOẶC HIRED */}
                                        {(selectedApp.status === "interviewing" || selectedApp.status === "hired") && (
                                            <div className={styles.interviewBox}>
                                                <div className={styles.interviewTitle}>
                                                    <CalendarClock size={18} /> Lịch hẹn phỏng vấn
                                                </div>

                                                <div className={styles.infoGrid}>
                                                    <div className={styles.infoItem}>
                                                        <span className={styles.infoLabel}>Hình thức</span>
                                                        <span className={styles.infoVal}>
                                                            {appDetailData.interview_mode === "online" ? (
                                                                <>
                                                                    <Video size={16} className={styles.onlineIcon} /> Phỏng vấn Online
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MapPin size={16} className={styles.offlineIcon} /> Phỏng vấn Offline
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className={styles.infoItem}>
                                                        <span className={styles.infoLabel}>Thời gian</span>
                                                        <span className={styles.infoVal}>
                                                            <Clock size={16} />
                                                            {appDetailData.interview_time ? new Date(appDetailData.interview_time).toLocaleString("vi-VN", {
                                                                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                                                            }) : "Chưa cập nhật"}
                                                        </span>
                                                    </div>

                                                    {appDetailData.interview_mode === "online" ? (
                                                        <div className={styles.infoItemFull}>
                                                            <span className={styles.infoLabel}>Link tham gia (Google Meet / Zoom)</span>
                                                            <span className={styles.infoVal}>
                                                                {appDetailData.meeting_link ? (
                                                                    <a href={appDetailData.meeting_link} target="_blank" rel="noopener noreferrer" className={styles.infoValLink}>
                                                                        <ExternalLink size={16} /> Tham gia phòng phỏng vấn
                                                                    </a>
                                                                ) : "Chưa cập nhật link"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.infoItemFull}>
                                                            <span className={styles.infoLabel}>Địa điểm phỏng vấn</span>
                                                            <span className={styles.infoVal}>
                                                                <MapPin size={16} /> {appDetailData.location || "Chưa cập nhật địa chỉ"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {appDetailData.notes && (
                                                    <div className={styles.notesBoxWrapper}>
                                                        <div className={styles.notesLabel}>Lời nhắn từ HR:</div>
                                                        <div className={styles.notesBox}>
                                                            {appDetailData.notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* NẾU LÀ CÁC TRẠNG THÁI KHÁC (PENDING, REVIEW, WITHDRAWN...) */}
                                        {selectedApp.status !== "rejected" && selectedApp.status !== "interviewing" && selectedApp.status !== "hired" && (
                                            <div className={styles.generalStatusBox}>
                                                <div className={styles.generalStatusTitle}>
                                                    <AlertCircle size={18} /> Trạng thái hồ sơ
                                                </div>
                                                <p className={styles.generalStatusDesc}>
                                                    {appDetailData.notes || "Hồ sơ của bạn đã được gửi đến nhà tuyển dụng và đang trong quá trình sàng lọc. Hãy thường xuyên kiểm tra email và hệ thống để cập nhật lịch phỏng vấn khi có thông báo mới."}
                                                </p>
                                            </div>
                                        )}

                                        {/* Thông liên hệ HR */}
                                        {(appDetailData.hr_contact_name || appDetailData.hr_contact_email || appDetailData.hr_contact_phone) && (
                                            <div className={styles.modalSection}>
                                                <div className={styles.sectionTitle}>
                                                    <User size={16} /> Thông tin liên hệ hỗ trợ
                                                </div>
                                                <div className={styles.infoGrid}>
                                                    {appDetailData.hr_contact_name && (
                                                        <div className={styles.infoItem}>
                                                            <span className={styles.infoLabel}>Người liên hệ</span>
                                                            <span className={styles.infoVal}>{appDetailData.hr_contact_name}</span>
                                                        </div>
                                                    )}
                                                    {appDetailData.hr_contact_email && (
                                                        <div className={styles.infoItem}>
                                                            <span className={styles.infoLabel}>Email</span>
                                                            <span className={styles.infoVal}>
                                                                <Mail size={14} /> {appDetailData.hr_contact_email}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {appDetailData.hr_contact_phone && (
                                                        <div className={styles.infoItem}>
                                                            <span className={styles.infoLabel}>Số điện thoại</span>
                                                            <span className={styles.infoVal}>
                                                                <Phone size={14} /> {appDetailData.hr_contact_phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.errorBox}>
                                        Không tải được thông tin chi tiết. Vui lòng thử lại sau.
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <Link href={`/candidate/job_detail?id=${selectedApp.job_id}`} onClick={() => setIsDetailModalOpen(false)}>
                                    <Button variant="outline">Xem chi tiết công việc</Button>
                                </Link>
                                <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                                    Đóng cửa sổ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toaster />
        </div>
    );
}

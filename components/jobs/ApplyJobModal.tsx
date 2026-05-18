"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, User, CheckCircle2, Loader2 } from "lucide-react";
import cx from "classnames";
import styles from "./ApplyJobModal.module.scss";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";

interface UploadedCV {
    id: string;
    file_name: string;
}

interface ApplyJobModalProps {
    jobId: string;
    jobTitle: string;
    onClose: () => void;
    onSuccess: () => void; // Hàm gọi lại khi ứng tuyển thành công để load lại trang
}

export default function ApplyJobModal({
    jobId,
    jobTitle,
    onClose,
    onSuccess,
}: ApplyJobModalProps) {
    const [cvList, setCvList] = useState<UploadedCV[]>([]);
    const [loadingCVs, setLoadingCVs] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // State lưu CV đang chọn:
    // Giá trị "PROFILE" nghĩa là dùng CV hệ thống tự tạo
    const [selectedCvId, setSelectedCvId] = useState<string>("PROFILE");

    // Lấy danh sách CV upload từ API của bạn
    useEffect(() => {
        const fetchCVs = async () => {
            try {
                const res = await apiClient.get("/profiles/cv_upload");
                setCvList(res.data.data);
            } catch (error) {
                console.error("chưa upload CV");
            } finally {
                setLoadingCVs(false);
            }
        };
        fetchCVs();
    }, []);

    // Hàm xử lý khi bấm Nộp đơn
    const handleApply = async () => {
        setIsSubmitting(true);

        // Chuẩn bị cục dữ liệu gửi xuống Backend
        const payload = {
            job_id: jobId,
            cv_type: selectedCvId === "PROFILE" ? "PROFILE" : "UPLOADED",
            cv_id: selectedCvId === "PROFILE" ? null : selectedCvId,
        };

        try {
            const res = await apiClient.post("/application/apply_job", payload);
            if (res.status === 200 || res.status === 201) {
                toast.success("Ứng tuyển thành công!");
                onSuccess(); // Báo cho Component cha biết
                onClose(); // Đóng Modal
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi nộp đơn.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2>Ứng tuyển công việc</h2>
                        <p className={styles.jobTitle}>{jobTitle}</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body: Lựa chọn CV */}
                <div className={styles.body}>
                    <h3>Chọn hồ sơ ứng tuyển</h3>

                    <div className={styles.cvOptions}>
                        {/* Lựa chọn 1: CV Hệ thống (Profile) */}
                        <div
                            className={cx(styles.cvCard, {
                                [styles.selected]: selectedCvId === "PROFILE",
                            })}
                            onClick={() => setSelectedCvId("PROFILE")}
                        >
                            <div className={styles.cvInfo}>
                                <div className={cx(styles.iconWrapper, styles.profileIcon)}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className={styles.cvName}>
                                        Hồ sơ trực tuyến Smart ATS
                                    </div>
                                    <div className={styles.cvDesc}>
                                        Tự động tạo từ thông tin cá nhân, kinh nghiệm và học vấn của
                                        bạn.
                                    </div>
                                </div>
                            </div>
                            {selectedCvId === "PROFILE" && (
                                <CheckCircle2 className={styles.checkIcon} size={20} />
                            )}
                        </div>

                        {/* Lựa chọn 2: Các CV đã Upload */}
                        {loadingCVs ? (
                            <div style={{ textAlign: "center", padding: "1rem" }}>
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : (
                            cvList.map((cv) => (
                                <div
                                    key={cv.id}
                                    className={cx(styles.cvCard, {
                                        [styles.selected]: selectedCvId === cv.id,
                                    })}
                                    onClick={() => setSelectedCvId(cv.id)}
                                >
                                    <div className={styles.cvInfo}>
                                        <div className={cx(styles.iconWrapper, styles.uploadIcon)}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className={styles.cvName}>{cv.file_name}</div>
                                            <div className={styles.cvDesc}>
                                                CV tải lên từ thiết bị của bạn.
                                            </div>
                                        </div>
                                    </div>
                                    {selectedCvId === cv.id && (
                                        <CheckCircle2 className={styles.checkIcon} size={20} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer: Nút hành động */}
                <div className={styles.footer}>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleApply}
                        loading={isSubmitting}
                    >
                        Xác nhận nộp đơn
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}

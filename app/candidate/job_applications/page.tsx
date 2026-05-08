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
  | "PENDING"
  | "REVIEWED"
  | "INTERVIEW"
  | "REJECTED"
  | "CANCELLED";

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: AppStatus;
  applied_at: string;
  cv_id: string;
  cv_name: string; // Tên file CV ứng viên đã chọn nộp
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
        prev.map((app) =>
          app.job_id === id ? { ...app, status: "CANCELLED" } : app,
        ),
      );
      toast.success("Đã xóa CV thành công");
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null }); // Đóng modal và reset ID
    }
  };

  const handlePreviewCV = async (cvId: string) => {
    try {
      await previewFileFromServer(cvId);
    } catch (error) {
      alert("Không thể xem file CV lúc này.");
    }
  };
  // Helper function để render Badge trạng thái
  const renderStatusBadge = (status: AppStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className={cx(styles.badge, styles.pending)}>
            <Clock size={14} /> Chờ nhà tuyển dụng
          </span>
        );
      case "REVIEWED":
        return (
          <span className={cx(styles.badge, styles.reviewed)}>
            <Eye size={14} /> Đã xem hồ sơ
          </span>
        );
      case "INTERVIEW":
        return (
          <span className={cx(styles.badge, styles.interview)}>
            <CheckCircle size={14} /> Được mời phỏng vấn
          </span>
        );
      case "REJECTED":
        return (
          <span className={cx(styles.badge, styles.rejected)}>
            <XSquare size={14} /> Không phù hợp
          </span>
        );
      case "CANCELLED":
        return (
          <span className={cx(styles.badge, styles.cancelled)}>
            <XCircle size={14} /> Đã rút đơn
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        Đang tải danh sách...
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Đơn ứng tuyển của tôi</h1>
        <p>Theo dõi trạng thái và quản lý các công việc bạn đã nộp hồ sơ.</p>
      </div>

      <div className={styles.appList}>
        {applications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "#fff",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
              Bạn chưa ứng tuyển công việc nào.
            </p>
            <Link href="/candidate/search_job">
              <Button variant="primary">Tìm việc ngay</Button>
            </Link>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className={styles.appCard}>
              {/* Thông tin công việc */}
              <div className={styles.jobInfo}>
                <Link href={`/jobs/${app.job_id}`} className={styles.jobTitle}>
                  {app.job_title}
                </Link>
                <div className={styles.companyName}>
                  <Building2 size={16} color="#6b7280" /> {app.company_name}
                </div>

                <div className={styles.metaInfo}>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    Nộp ngày:{" "}
                    {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                  </div>
                  <div className={styles.metaItem}>
                    <FileText size={14} />
                    CV:
                    <span
                      style={{ color: "#0369a1", fontWeight: 500 }}
                      onClick={() => handlePreviewCV(app.cv_id)}
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
                    <button className={styles.viewBtn}>Xem</button>
                  </Link>

                  {(app.status === "PENDING" || app.status === "REVIEWED") && (
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
        title="Rút đơn ứng tuyển"
        message="Bạn có chắc chắn muốn rút đơn ứng tuyển này không? Hành động này không thể hoàn tác."
        confirmText="Rút đơn"
        cancelText="Giữ lại"
        onConfirm={() => executeDelete(confirmModal.id!)}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />
      <Toaster />
    </div>
  );
}

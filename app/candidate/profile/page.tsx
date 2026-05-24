"use client";

import React, { useCallback, useState } from "react";
import cx from "classnames";
import { FileText, FileSpreadsheet } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import styles from "./profile.module.scss";
import BasicInfoForm from "./_components/BasicInfoForm";
import ExperienceSection from "./_components/ExperienceSection";
import EducationSection from "./_components/EducationSection";
import CertificationSection from "./_components/CertificationSection";
import CvUploadSection from "./_components/CvUploadSection";
import PdfPreviewModal from "./_components/PdfPreviewModal";
import ExcelImportModal from "./_components/ExcelImportModal";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";

export default function CandidateProfilePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImportExcel, setShowImportExcel] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Hàm fetch PDF – được truyền vào PdfPreviewModal.
   * Modal tự gọi lại khi cần retry, không cần lưu blob ở đây.
   */
  const fetchPdf = useCallback(async (): Promise<Blob> => {
    const response = await apiClient.get("/profiles/export_cv", {
      responseType: "blob",
    });
    return response.data as Blob;
  }, []);

  const handleOpenPreview = async () => {
    if (isLoadingPreview) return;
    try {
      setIsLoadingPreview(true);
      // Kiểm tra nhanh xem API có phản hồi không trước khi mở modal
      // (nếu muốn bỏ qua bước check này, xoá try/catch và gọi setShowPreview(true) trực tiếp)
      setShowPreview(true);
    } catch {
      toast.error("Không thể tải CV. Vui lòng thử lại!");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hồ sơ ứng viên</h1>
          <p className={styles.subtitle}>
            Hoàn thiện hồ sơ để tự động tạo CV và tăng độ chính xác của AI
            Matching.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setShowImportExcel(true)}
            className={styles.importBtn}
          >
            <FileSpreadsheet size={18} />
            Nhập từ Excel
          </button>
          <Button
            variant="outline"
            onClick={handleOpenPreview}
            disabled={isLoadingPreview}
            className={styles.exportBtn}
          >
            <FileText size={18} />
            {isLoadingPreview ? "Đang tải..." : "Xem & Xuất CV PDF"}
          </Button>
        </div>
      </div>

      <div className={styles.tabContainer}>
        <div className={styles.tabHeader}>
          <button
            className={cx(styles.tabBtn, {
              [styles.activeTab]: activeTab === "basic",
            })}
            onClick={() => setActiveTab("basic")}
          >
            Thông tin cá nhân
          </button>
          <button
            className={cx(styles.tabBtn, {
              [styles.activeTab]: activeTab === "experience",
            })}
            onClick={() => setActiveTab("experience")}
          >
            Kinh nghiệm làm việc
          </button>
          <button
            className={cx(styles.tabBtn, {
              [styles.activeTab]: activeTab === "education",
            })}
            onClick={() => setActiveTab("education")}
          >
            Học vấn
          </button>
          <button
            className={cx(styles.tabBtn, {
              [styles.activeTab]: activeTab === "certification",
            })}
            onClick={() => setActiveTab("certification")}
          >
            Chứng chỉ
          </button>
          <button
            className={cx(styles.tabBtn, {
              [styles.activeTab]: activeTab === "upload_cv",
            })}
            onClick={() => setActiveTab("upload_cv")}
          >
            Đăng CV
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "basic" && <BasicInfoForm refreshTrigger={refreshTrigger} />}
          {activeTab === "experience" && <ExperienceSection refreshTrigger={refreshTrigger} />}
          {activeTab === "education" && <EducationSection refreshTrigger={refreshTrigger} />}
          {activeTab === "certification" && <CertificationSection refreshTrigger={refreshTrigger} />}
          {activeTab === "upload_cv" && <CvUploadSection />}
        </div>
      </div>

      {showPreview && (
        <PdfPreviewModal
          fetchPdf={fetchPdf}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showImportExcel && (
        <ExcelImportModal
          onClose={() => setShowImportExcel(false)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      <Toaster />
    </div>
  );
}

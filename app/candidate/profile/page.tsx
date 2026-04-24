"use client";

import React, { useState } from "react";
import cx from "classnames";
import styles from "./profile.module.scss";

import BasicInfoForm from "./_components/BasicInfoForm";
import ExperienceSection from "./_components/ExperienceSection";
import EducationSection from "./_components/EducationSection";
import CertificationSection from "./_components/CertificationSection";
import CvUploadSection from "./_components/CvUploadSection";
import Button from "@/components/ui/Button";
import { FileText } from "lucide-react";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";

export default function CandidateProfilePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isExporting, setIsExporting] = useState(false);
  const handleExportPDF = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      const response = await apiClient.get("/profiles/export_cv", {
        responseType: "blob", // Bắt buộc để nhận dữ liệu PDF
      });

      // Tạo URL tạm thời cho file PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", "My_CV.pdf");
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("xuất CV thành công.");
    } catch (error) {
      toast.error("Không thể xuất file PDF. Vui lòng thử lại!");
    } finally {
      setIsExporting(false);
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
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className={styles.exportBtn}
          >
            <FileText size={18} />
            {isExporting ? "Đang xuất..." : "Xuất CV PDF"}
          </Button>
        </div>
      </div>

      <div className={styles.tabContainer}>
        {/* Thanh Điều Hướng Tab */}
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

        {/* Nội dung Tab */}
        <div className={styles.tabContent}>
          {activeTab === "basic" && <BasicInfoForm />}
          {activeTab === "experience" && <ExperienceSection />}
          {activeTab === "education" && <EducationSection />}
          {activeTab === "certification" && <CertificationSection />}
          {activeTab === "upload_cv" && <CvUploadSection />}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

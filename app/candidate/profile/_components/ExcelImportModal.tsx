"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, X, UploadCloud, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import cx from "classnames";

import styles from "./ExcelImportModal.module.scss";
import apiClient from "@/lib/apiClient";
import Button from "@/components/ui/Button";

interface ExcelImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExcelImportModal({ onClose, onSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleDownloadTemplate = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await apiClient.get("/profiles/profileCandidate/template", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "candidate_profile_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Tải file mẫu thành công!");
    } catch (error: unknown) {
      console.error("Error downloading template:", error);
      toast.error("Không thể tải file mẫu. Vui lòng thử lại!");
    } finally {
      setIsDownloading(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg(null);
    const fileName = selectedFile.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

    if (fileExtension !== ".xlsx" && fileExtension !== ".xls") {
      setErrorMsg("Chỉ chấp nhận các tệp tin Excel (.xlsx hoặc .xls).");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!file || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/profiles/profileCandidate/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        toast.success("Nhập dữ liệu từ Excel thành công!");
        onSuccess();
        onClose();
      } else {
        const errorDetail = response.data?.error || response.data?.detail || "Nhập dữ liệu không thành công.";
        setErrorMsg(errorDetail);
        toast.error("Lỗi: " + errorDetail);
      }
    } catch (error: unknown) {
      console.error("Error importing file:", error);
      let responseError = "Đã xảy ra lỗi khi tải lên tệp tin. Vui lòng kiểm tra lại định dạng file.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const errObj = error as { response?: { data?: { detail?: string; error?: string } } };
        responseError =
          errObj.response?.data?.detail ||
          errObj.response?.data?.error ||
          responseError;
      }
      setErrorMsg(responseError);
      toast.error(responseError);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap}>
              <FileSpreadsheet size={18} color="#fff" />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Nhập hồ sơ từ Excel</h2>
              <p className={styles.headerSubtitle}>Điền thông tin vào file mẫu để cập nhật nhanh chóng</p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Step 1: Download template info */}
          <div className={styles.infoSection}>
            <div className={styles.infoText}>
              <h3 className={styles.stepTitle}>Bước 1: Tải file dữ liệu mẫu</h3>
              <p className={styles.stepDesc}>
                Sử dụng file mẫu có cấu trúc chuẩn để hệ thống tự động nhận diện thông tin cá nhân, học vấn, kinh nghiệm và chứng chỉ của bạn.
              </p>
            </div>
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownloadTemplate}
              disabled={isDownloading || isLoading}
            >
              {isDownloading ? (
                <span className={styles.downloadSpinner} />
              ) : (
                <Download size={15} />
              )}
              {isDownloading ? "Đang tải mẫu..." : "Tải file mẫu Excel"}
            </button>
          </div>

          <hr className={styles.separator} />

          {/* Step 2: Drag & drop upload area */}
          <div className={styles.uploadSection}>
            <h3 className={styles.stepTitle}>Bước 2: Chọn hoặc Kéo thả file Excel</h3>
            
            <div
              className={cx(styles.dropzone, {
                [styles.dragover]: isDragging,
                [styles.hasFile]: !!file,
                [styles.hasError]: !!errorMsg,
                [styles.disabled]: isLoading,
              })}
              onDragOver={!isLoading ? handleDragOver : undefined}
              onDragLeave={!isLoading ? handleDragLeave : undefined}
              onDrop={!isLoading ? handleDrop : undefined}
              onClick={!file && !isLoading ? handleSelectFileClick : undefined}
            >
              <input
                ref={fileInputRef}
                type="file"
                className={styles.fileInput}
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isLoading}
              />

              {!file ? (
                <div className={styles.dropzoneContent}>
                  <div className={styles.uploadIconWrap}>
                    <UploadCloud size={32} />
                  </div>
                  <p className={styles.dropzoneText}>
                    <span>Kéo thả file vào đây</span> hoặc <strong className={styles.browseLink}>chọn từ máy tính</strong>
                  </p>
                  <span className={styles.dropzoneSubtext}>Hỗ trợ định dạng .xlsx, .xls</span>
                </div>
              ) : (
                <div className={styles.fileDetails}>
                  <div className={styles.fileIconWrap}>
                    <FileSpreadsheet size={24} className={styles.excelIcon} />
                  </div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                  </div>
                  {!isLoading && (
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      aria-label="Xoá file đã chọn"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {file && !errorMsg && (
          <div className={styles.footer}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className={styles.cancelBtn}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmImport}
              loading={isLoading}
              className={styles.confirmBtn}
            >
              {!isLoading && <CheckCircle2 size={16} />}
              {isLoading ? "Đang xử lý dữ liệu..." : "Xác nhận dùng dữ liệu từ file Excel này"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  Trash2,
  CheckCircle,
  Loader2,
  Sparkles,
  Lock,
  DatabaseZap,
  BrainCircuit,
} from "lucide-react";
import cx from "classnames";
import styles from "./document.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

interface CompanyDocument {
  id: string;
  file_name: string;
  file_url: string;
  created_at?: string;
  status?: "processing" | "ready" | "failed";
}

export default function CompanyDocumentsPage() {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { company, isVip, loading: loadingCompany } = useCompanyProfile();

  const fetchDocuments = async () => {
    try {
      const res = await apiClient.get("/companies/my_company/documents");
      setDocuments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Lỗi tải danh sách tài liệu");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const openFilePicker = () => {
    if (!isVip) {
      toast("Tính năng này dành cho gói VIP");
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    if (!isVip) {
      toast.error("Chỉ doanh nghiệp VIP mới được tải tài liệu lên hệ thống");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast.error("Chỉ hỗ trợ file DOCX");
      return;
    }

    try {
      setUploading(true);
      toast.loading("Bước 1/2: Đang tải file lên server...", { id: "upload" });

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      // Lưu ý: folder là query parameter theo đúng thiết kế FastAPI của bạn
      const uploadRes = await apiClient.post(
        "/upload/file?folder=documents",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Lấy URL trả về từ API
      const fileUrl = uploadRes.data.data;

      if (!fileUrl) {
        throw new Error("Không lấy được đường dẫn file");
      }

      toast.loading("Bước 2/2: Đang lưu hồ sơ và đưa vào AI...", {
        id: "upload",
      });

      const documentPayload = {
        file_name: file.name,
        file_url: fileUrl,
      };

      await apiClient.post("/companies/my_company/documents", documentPayload);

      toast.success(
        "Tài liệu đã được nhận. Hệ thống sẽ phân tích và đưa vào vector DB.",
        { id: "upload" },
      );

      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error("Quá trình tải lên thất bại. Vui lòng thử lại.", {
        id: "upload",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa tài liệu này?")) return;

    try {
      await apiClient.delete(`/companies/my_company/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Đã xóa tài liệu");
    } catch {
      toast.error("Lỗi khi xóa tài liệu");
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await apiClient.post(`/companies/my_company/documents/${id}/retry`);
      toast.success("Đã gửi yêu cầu xử lý lại tài liệu");

      // optional: update UI optimistic
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, status: "processing" } : doc,
        ),
      );
    } catch (error) {
      toast.error("Retry thất bại");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1>Tài liệu công ty</h1>
          <p>
            Tài liệu nội bộ sẽ được AI phân tích và đưa vào vector DB để trả lời
            ứng viên chính xác hơn.
          </p>
        </div>
        <div className={cx(styles.planBadge, { [styles.vip]: isVip })}>
          {loadingCompany
            ? "Đang tải gói..."
            : isVip
              ? "VIP đang bật"
              : "Gói Free"}
        </div>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.heroMain}>
          <div className={styles.heroIcon}>
            {isVip ? <BrainCircuit size={22} /> : <Lock size={22} />}
          </div>
          <div>
            <h2>
              {isVip
                ? "Kho tri thức AI của doanh nghiệp đang sẵn sàng"
                : "Upload tài liệu là tính năng dành cho VIP"}
            </h2>
            <p>
              {isVip
                ? `Tài liệu của ${company.name || "doanh nghiệp"} sẽ được bổ sung vào ngữ cảnh AI để chatbot và các phân tích hoạt động nhất quán.`
                : "Khi nâng cấp VIP, mỗi tài liệu upload sẽ được phân tích, tách nội dung và đưa vào vector DB để phục vụ AI."}
            </p>
          </div>
        </div>

        <div className={styles.featureRow}>
          <div className={styles.featurePill}>
            <DatabaseZap size={16} />
            Đồng bộ vào vector DB
          </div>
          <div className={styles.featurePill}>
            <Sparkles size={16} />
            AI chatbot theo tài liệu
          </div>
          <div className={styles.featurePill}>
            <FileText size={16} />
            Tài liệu DOCX nội bộ
          </div>
        </div>

        {!isVip && (
          <Link href="/hr_manager/pricing" className={styles.heroAction}>
            Nâng cấp VIP để bật tài liệu AI
          </Link>
        )}
      </div>

      <div
        className={cx(styles.uploadZone, {
          [styles.dragging]: isDragging,
          [styles.locked]: !isVip,
        })}
        onClick={openFilePicker}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isVip) return;
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          const file = event.dataTransfer.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handleFile(file);
            }
            event.target.value = "";
          }}
        />

        <div className={styles.iconWrapper}>
          {uploading ? <Loader2 className={styles.spin} /> : <UploadCloud />}
        </div>
        <h3>
          {isVip
            ? "Kéo thả file DOCX hoặc bấm để tải lên"
            : "Tính năng upload đang bị khóa với gói Free"}
        </h3>
        <p>
          {isVip
            ? "Sau khi tải lên, hệ thống sẽ phân tích nội dung và đồng bộ vào AI knowledge base."
            : "Nâng cấp VIP để cho phép AI học tài liệu nội bộ, chính sách và quy trình công ty."}
        </p>
      </div>

      <div className={styles.sectionHeader}>
        <h3>Danh sách tài liệu</h3>
        <span>{documents.length} tài liệu</span>
      </div>

      <div className={styles.docGrid}>
        {loading ? (
          <div className={styles.emptyState}>
            <Loader2 className={styles.spin} />
            <p>Đang tải danh sách tài liệu...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={40} />
            <p>
              {isVip
                ? "Chưa có tài liệu nào được đưa vào AI."
                : "Chưa có tài liệu. Nâng cấp VIP để bắt đầu xây kho tri thức."}
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className={styles.docCard}>
              <div className={styles.docInfo}>
                <FileText size={32} className={styles.fileIcon} />

                <div className={styles.text}>
                  <div className={styles.name}>{doc.file_name}</div>
                  <div className={styles.meta}>
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString("vi-VN")
                      : "Không rõ ngày tạo"}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                {doc.status === "ready" ? (
                  <div className={styles.aiStatus}>
                    <CheckCircle size={14} />
                    Đã phân tích
                  </div>
                ) : doc.status === "failed" ? (
                  <div className={styles.failedStatus}>
                    <span>Thất bại</span>
                  </div>
                ) : (
                  <div className={styles.processingStatus}>
                    <Loader2 size={14} className={styles.spin} />
                    Đang xử lý
                  </div>
                )}
                {doc.status === "failed" && (
                  <button
                    className={styles.retryBtn}
                    onClick={() => handleRetry(doc.id)}
                  >
                    Thử lại
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Toaster />
    </div>
  );
}

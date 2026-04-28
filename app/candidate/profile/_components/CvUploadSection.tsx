"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import cx from "classnames";
import styles from "./CvUploadSection.module.scss";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import { previewFileFromServer } from "@/utils/fileUtils";
import ConfirmModal from "@/components/ui/ConfirmModal";
interface UploadedCV {
  id: string;
  file_name: string;
  file_url: string;
  is_active: boolean;
  created_at: string;
}

export default function CvUploadSection() {
  const [cvList, setCvList] = useState<UploadedCV[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({
    isOpen: false,
    id: null,
  });

  // 1. Lấy danh sách CV từ API
  const fetchCVs = async () => {
    try {
      const res = await apiClient.get("/profiles/cv_upload");
      setCvList(res.data.data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  // 2. Xử lý khi chọn file từ máy
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file PDF hoặc DOCX");
        return;
      }
      setSelectedFile(file);
    }
  };

  // 3. Upload file lên server
  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await apiClient.post("/profiles/cv_upload", formData);
      if (res.status === 200) {
        setSelectedFile(null);
        fetchCVs();
        toast.success("Đã thêm CV thành công");
      }
    } catch (error) {
      toast.error("Lỗi upload file");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Các thao tác trên danh sách
  const handlePreview = async (cvId: string) => {
    try {
      await previewFileFromServer(cvId);
    } catch (error) {
      toast.error(
        "Phiên đăng nhập đã hết hạn hoặc bạn không có quyền xem file này.",
      );
    }
  };

  // Hàm này gắn vào thẻ onClick của nút Thùng Rác UI
  const openDeleteConfirm = (id: string) => {
    setConfirmModal({ isOpen: true, id: id });
  };
  const executeDelete = async () => {
    if (!confirmModal.id) return;

    setIsDeleting(true); // Bật loading của Modal
    try {
      await apiClient.delete(`/profiles/cv_upload/${confirmModal.id}`);
      setCvList((prev) => prev.filter((cv) => cv.id !== confirmModal.id));
      toast.success("Đã xóa CV thành công");
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null }); // Đóng modal và reset ID
    }
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Danh sách CV của bạn</h2>
          <p>Tải lên và quản lý các bản hồ sơ dùng để ứng tuyển.</p>
        </div>

        {/* Nút Thêm CV (Mở hộp thoại chọn file) */}
        {!selectedFile && (
          <div className={styles.wrapBtnUpCv}>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={18} /> Thêm CV mới
            </Button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
      </div>

      {/* Hiển thị file vừa chọn - chờ nhấn Lưu */}
      {selectedFile && (
        <div className={styles.pendingFile}>
          <div className={styles.fileInfo}>
            <FileText size={20} color="#0284c7" />
            <span className={styles.fileName}>{selectedFile.name}</span>
          </div>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
            >
              <X size={18} /> Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={isUploading}
            >
              Xác nhận tải lên
            </Button>
          </div>
        </div>
      )}

      {/* Danh sách CV đã tải lên */}
      <div className={styles.cvList}>
        {cvList.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
            Bạn chưa có bản CV nào.
          </p>
        ) : (
          cvList.map((cv) => (
            <div
              key={cv.id}
              className={cx(styles.cvItem, { [styles.active]: cv.is_active })}
            >
              <div className={styles.cvMain}>
                <FileText size={24} className={styles.icon} />
                <div className={styles.text}>
                  <div className={styles.name}>{cv.file_name}</div>
                  <div className={styles.date}>
                    Ngày tải:{" "}
                    {new Date(cv.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className={styles.itemActions}>
                {/* Nút Xem Preview (Mở tab mới) */}
                <Button
                  variant="ghost"
                  onClick={() => handlePreview(cv.id)}
                  title="Xem chi tiết"
                >
                  <Eye size={18} />
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => openDeleteConfirm(cv.id)}
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xóa hồ sơ CV"
        message="Bạn có chắc chắn muốn xóa bản CV này không? Hành động này không thể hoàn tác."
        confirmText="Xóa CV"
        cancelText="Giữ lại"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />
      <Toaster />
    </div>
  );
}

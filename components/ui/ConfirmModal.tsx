import React from "react";
import { AlertTriangle, X } from "lucide-react";
import styles from "./ConfirmModal.module.scss";
import Button from "./Button"; // Tận dụng lại Button UI của bạn

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean; // Khóa nút khi đang gọi API
  isDestructive?: boolean; // Nút xác nhận có màu đỏ (nguy hiểm) hay không?
}

export default function ConfirmModal({
  isOpen,
  title = "Xác nhận hành động",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  isLoading = false,
  isDestructive = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <button
          className={styles.closeBtn}
          onClick={onCancel}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className={styles.body}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={32} className={styles.warningIcon} />
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

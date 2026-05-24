"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, FileText, X, RefreshCw, AlertCircle } from "lucide-react";
import styles from "./PdfPreviewModal.module.scss";

interface PdfPreviewModalProps {
  /** Callback trả về Blob PDF. Gọi lại mỗi khi retry. */
  fetchPdf: () => Promise<Blob>;
  onClose: () => void;
}

type Status = "loading" | "ready" | "error";

export default function PdfPreviewModal({
  fetchPdf,
  onClose,
}: PdfPreviewModalProps) {
  const [status, setStatus] = useState<Status>("loading");
  const objectUrlRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** Tải blob và gán vào iframe */
  const loadPdf = React.useCallback(async () => {
    setStatus("loading");

    // Giải phóng URL cũ nếu có
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    try {
      const blob = await fetchPdf();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [fetchPdf]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPdf();

    return () => {
      // Dọn dẹp khi unmount
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [loadPdf]);

  /** Khoá scroll nền khi modal mở */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /** Đóng khi nhấn Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownload = () => {
    if (!objectUrlRef.current) return;
    const link = document.createElement("a");
    link.href = objectUrlRef.current;
    link.download = "My_CV.pdf";
    link.click();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        // Đóng khi click ra ngoài modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* -------- Header -------- */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap}>
              <FileText size={16} color="#fff" />
            </div>
            <div>
              <div className={styles.headerTitle}>Xem trước CV</div>
              <div className={styles.headerSubtitle}>
                Kiểm tra nội dung trước khi tải xuống
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {status === "ready" && (
              <button
                className={styles.downloadBtn}
                onClick={handleDownload}
                aria-label="Tải xuống PDF"
              >
                <Download size={16} />
                Tải xuống
              </button>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* -------- Body -------- */}
        <div className={styles.body}>
          {/* iframe luôn tồn tại trong DOM; ẩn/hiện bằng visibility */}
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            title="CV Preview"
            style={{ visibility: status === "ready" ? "visible" : "hidden" }}
          />

          {status === "loading" && (
            <div className={styles.stateBox}>
              <div className={styles.spinner} />
              <p className={styles.stateText}>Đang tải CV...</p>
            </div>
          )}

          {status === "error" && (
            <div className={styles.stateBox}>
              <div className={styles.errorIcon}>
                <AlertCircle size={24} />
              </div>
              <p className={styles.stateText}>
                Không thể tải CV. Vui lòng thử lại.
              </p>
              <button className={styles.retryBtn} onClick={loadPdf}>
                <RefreshCw size={15} />
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

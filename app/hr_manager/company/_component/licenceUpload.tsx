import React, { useId, useMemo, useState } from "react";
import { FileCheck, Loader2, Upload } from "lucide-react";

import styles from "../company.module.scss";
import { uploadFile } from "@/utils/uploadfile";

type Props = {
  licenseUrl: string | null;
  setLicenseUrl: (value: string) => void;
  disabled?: boolean;
};

export default function LicenseUpload({
  licenseUrl,
  setLicenseUrl,
  disabled,
}: Props) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const displayName = useMemo(() => {
    if (fileName) return fileName;
    if (!licenseUrl) return "";

    try {
      const pathname = new URL(licenseUrl).pathname;
      return decodeURIComponent(pathname.split("/").pop() || "license");
    } catch {
      return "Đã tải giấy phép";
    }
  }, [fileName, licenseUrl]);

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const url = await uploadFile(file, "licenses");
      setLicenseUrl(url);
      setFileName(file.name);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.uploadPanel}>
      <div className={styles.uploadRow}>
        <div>
          <div className={styles.uploadTitle}>Giấy phép kinh doanh *</div>
          <p className={styles.uploadHint}>
            Hỗ trợ PDF, JPG, PNG. Kích thước tối đa 5MB.
          </p>
        </div>

        <input
          id={inputId}
          className={styles.hiddenInput}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert("File tối đa 5MB");
              return;
            }

            handleUpload(file);
          }}
          disabled={disabled || uploading}
        />

        <label
          htmlFor={inputId}
          className={`${styles.uploadButton} ${disabled || uploading ? styles.uploadButtonDisabled : ""}`}
        >
          {uploading ? (
            <Loader2 size={18} className={styles.spinningIcon} />
          ) : (
            <Upload size={18} />
          )}
          <span>{uploading ? "Đang tải file..." : "Chọn giấy phép"}</span>
        </label>
      </div>

      {licenseUrl && (
        <div className={styles.fileStatus}>
          <FileCheck size={16} />
          <span>{displayName}</span>
        </div>
      )}
    </div>
  );
}

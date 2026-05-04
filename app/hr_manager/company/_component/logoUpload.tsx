import React, { useId, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import Image from "next/image";

import styles from "../company.module.scss";
import { uploadFile } from "@/utils/uploadfile";

type Props = {
  logoPreview: string | null;
  setLogoPreview: (value: string | null) => void;
  setLogoUrl: (value: string) => void;
  disabled?: boolean;
};

const readFilePreview = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
    reader.readAsDataURL(file);
  });

export default function LogoUpload({
  logoPreview,
  setLogoPreview,
  setLogoUrl,
  disabled,
}: Props) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const preview = await readFilePreview(file);
      setLogoPreview(preview);
      setFileName(file.name);

      const url = await uploadFile(file, "logos");
      setLogoUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.uploadPanel}>
      <div className={styles.logoSection}>
        <div className={styles.logoPreview} aria-label="Xem trước logo công ty">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Logo công ty"
              fill
              unoptimized
              sizes="152px"
            />
          ) : (
            <div className={styles.logoPlaceholder}>
              <Camera size={24} />
              <span>Chưa có logo</span>
            </div>
          )}
        </div>

        <div className={styles.logoActions}>
          <div className={styles.uploadTitle}>Tải logo công ty</div>
          <p className={styles.uploadHint}>
            PNG, JPG hoặc WEBP. Kích thước tối đa 5MB.
          </p>

          <input
            id={inputId}
            className={styles.hiddenInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
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
            <span>{uploading ? "Đang tải logo..." : "Chọn logo"}</span>
          </label>

          {fileName && <div className={styles.fileMeta}>Đã chọn: {fileName}</div>}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import cx from "classnames";

import apiClient from "@/lib/apiClient";
import styles from "./AvatarUpload.module.scss";

interface AvatarUploadProps {
  initialAvatarUrl?: string;
  onUploadSuccess?: (newUrl: string) => void;
}

export default function AvatarUpload({ initialAvatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialAvatarUrl) {
      setAvatarUrl(initialAvatarUrl);
    }
  }, [initialAvatarUrl]);

  const getFullAvatarUrl = (url: string) => {
    if (!url) return "/default-avatar.png"; // Fallback image
    if (url.startsWith("http")) return url;
    
    // Assuming API URL ends with /api/v1
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
    return `${baseUrl}/${url}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ");
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await apiClient.post("/profiles/profileCandidate/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const newUrl = res.data.data;
        setAvatarUrl(newUrl);
        toast.success("Cập nhật avatar thành công");
        if (onUploadSuccess) onUploadSuccess(newUrl);
      } else {
        toast.error("Cập nhật avatar thất bại");
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      toast.error("Có lỗi xảy ra khi upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={styles.avatarContainer}>
      <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
        {avatarUrl ? (
          <img
            src={getFullAvatarUrl(avatarUrl)}
            alt="Avatar"
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <span className={styles.avatarInitials}>Ảnh</span>
          </div>
        )}
        
        <div className={cx(styles.overlay, { [styles.isUploading]: isUploading })}>
          {isUploading ? (
            <Loader2 className={styles.spinner} size={24} />
          ) : (
            <Camera className={styles.cameraIcon} size={24} />
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <div className={styles.instructions}>
        <p className={styles.title}>Ảnh đại diện</p>
        <p className={styles.desc}>Định dạng JPG, PNG. Tối đa 5MB.</p>
      </div>
    </div>
  );
}

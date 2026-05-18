import React, { useState, useEffect } from "react";
import Link from "next/link";
import cx from "classnames";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import {
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  Sparkles,
  TimerIcon,
} from "lucide-react";
import styles from "./JobCard.module.scss";

interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  logoUrl?: string;
  location: string;
  yearsOfExperience: number;
  salaryRange: string;
  jobType: "full_time" | "part_time" | "remote";
  postedDate: string;
  aiScore?: number;
  isSaved?: boolean;
  onBookmarkClick?: (id: string) => void;
}

export default function JobCard({
  id,
  title,
  companyName,
  logoUrl,
  location,
  yearsOfExperience,
  salaryRange,
  jobType,
  postedDate,
  aiScore,
  isSaved,
  onBookmarkClick,
}: JobCardProps) {
  const jobTypeMap = {
    full_time: "Toàn thời gian",
    part_time: "Bán thời gian",
    remote: "Làm từ xa",
  };

  const [localIsSaved, setLocalIsSaved] = useState(!!isSaved);

  useEffect(() => {
    setLocalIsSaved(!!isSaved);
  }, [isSaved]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Nếu component cha đã truyền hàm thì ưu tiên gọi hàm của cha
    if (onBookmarkClick) {
      onBookmarkClick(id);
      return;
    }
    
    // Nếu không, tự xử lý lưu/bỏ lưu
    try {
      if (localIsSaved) {
        await apiClient.delete(`/job/delete_saved_job`, { params: { job_id: Number(id) } });
        setLocalIsSaved(false);
        toast.success("Đã bỏ lưu công việc");
      } else {
        await apiClient.post(`/job/save_job/${id}`);
        setLocalIsSaved(true);
        toast.success("Đã lưu công việc");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      } else if (error.response?.status === 400 && error.response?.data?.detail === "Job đã được lưu trước đó") {
        // Nếu backend báo đã lưu rồi nhưng local chưa có, thì đồng bộ lại
        setLocalIsSaved(true);
        toast.success("Job đã được lưu trước đó");
      } else {
        toast.error(error.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại sau");
      }
    }
  };

  const pathname = usePathname();

  const detailLink = pathname.startsWith("/candidate")
    ? `/candidate/job_detail?id=${id}`
    : `/public/job_detail?id=${id}`;
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.logo}>
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} />
          ) : (
            <span className={styles.placeholder}>{companyName.charAt(0)}</span>
          )}
        </div>

        <button
          onClick={handleBookmarkClick}
          className={cx(styles.bookmarkBtn, { [styles.saved]: localIsSaved })}
          aria-label="Lưu việc làm"
        >
          <Bookmark size={20} fill={localIsSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <Link href={detailLink} style={{ textDecoration: "none", flexGrow: 1 }}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.companyName}>{companyName}</p>

        <div className={styles.details}>
          <div className={cx(styles.item, styles.salary)}>
            <DollarSign />
            <span>{salaryRange}</span>
          </div>
          <div className={cx(styles.item, styles.location)}>
            <MapPin />
            <span>{location}</span>
          </div>
          <div className={cx(styles.item, styles.location)}>
            <TimerIcon />
            <span>{yearsOfExperience} năm</span>
          </div>
        </div>
      </Link>

      <div className={styles.footer}>
        <div className={styles.tags}>
          <span className={styles.jobType}>{jobTypeMap[jobType]}</span>
          <span className={styles.date}>
            <Clock /> {postedDate}
          </span>
        </div>

        {aiScore !== undefined && (
          <div
            className={cx(styles.aiBadge, {
              [styles.high]: aiScore >= 80,
              [styles.medium]: aiScore >= 60 && aiScore < 80,
              [styles.low]: aiScore < 60,
            })}
          >
            <Sparkles /> AI: {aiScore}
          </div>
        )}
      </div>
    </div>
  );
}

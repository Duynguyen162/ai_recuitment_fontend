import React from "react";
import Link from "next/link";
import cx from "classnames";
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
          onClick={(e) => {
            e.preventDefault();
            onBookmarkClick?.(id);
          }}
          className={cx(styles.bookmarkBtn, { [styles.saved]: isSaved })}
          aria-label="Lưu việc làm"
        >
          <Bookmark size={20} />
        </button>
      </div>

      <Link
        href={`/public/job_detail?id=${id}`}
        style={{ textDecoration: "none", flexGrow: 1 }}
      >
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

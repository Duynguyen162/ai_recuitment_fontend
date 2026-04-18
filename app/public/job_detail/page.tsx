"use client";

import React, { useState, useEffect } from "react";
import cx from "classnames";
import {
  MapPin,
  DollarSign,
  Calendar,
  ShieldCheck,
  Bookmark,
  Sparkles,
  Flag,
  Building,
} from "lucide-react";
import axios from "axios";
import styles from "./job_detail.module.scss";
import { useSearchParams } from "next/navigation";

// Giao diện dữ liệu chuẩn theo API cung cấp
interface Company {
  id: number;
  name: string;
  logo_url: string;
}

interface JobData {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: number;
  salary_max: number;
  years_of_experience: number;
  tags: string[];
  job_type: string;
  status: string;
  created_at: string;
  expired_at: string;
  company: Company;
}

export default function JobDetailPage() {
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [activeTab, setActiveTab] = useState<"desc" | "req">("desc");

  // Trạng thái (Thường lấy từ backend sau khi user đăng nhập)
  const [hasApplied, setHasApplied] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/job/job_detail/${id}`,
        );
        if (res.data.success) {
          setJob(res.data.data);
        } else {
          setError("Không thể tải thông tin việc làm.");
        }
      } catch (err) {
        console.error(err);
        setError("Đã xảy ra lỗi khi kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.stateWrapper}>
          <span className={styles.loadingText}>
            Đang tải thông tin việc làm...
          </span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.container}>
        <div className={styles.stateWrapper}>
          <div className={styles.errorBox}>
            {error || "Việc làm không tồn tại hoặc đã bị xóa."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
        <div className={styles.contentColumn}>
          <div className={styles.headerCard}>
            <div className={styles.companyInfo}>
              <div className={styles.logoWrapper}>
                {job.company.logo_url && job.company.logo_url !== "string" ? (
                  <img src={job.company.logo_url} alt={job.company.name} />
                ) : (
                  <Building />
                )}
              </div>

              <div>
                <div className={styles.companyNameRow}>
                  {job.company.name}
                  <ShieldCheck className={styles.verifiedIcon} />
                </div>
                <h1 className={styles.jobTitle}>{job.title}</h1>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <MapPin /> {job.location}
              </div>
              <div className={cx(styles.metaItem, styles.salary)}>
                <DollarSign />
                {formatCurrency(job.salary_min)} -{" "}
                {formatCurrency(job.salary_max)}
              </div>
              <div className={styles.metaItem}>
                <Calendar /> Hạn nộp: {formatDate(job.expired_at)}
              </div>
            </div>

            <div className={styles.tagsRow}>
              <span className={styles.tagType}>
                {job.job_type === "full_time" ? "Toàn thời gian" : job.job_type}
              </span>
              {job.tags.map((tag) => (
                <span key={tag} className={styles.tagSkill}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.tabSection}>
            <div className={styles.tabHeaders}>
              <button
                className={cx(styles.tabBtn, {
                  [styles.active]: activeTab === "desc",
                })}
                onClick={() => setActiveTab("desc")}
              >
                Mô tả công việc
              </button>
              <button
                className={cx(styles.tabBtn, {
                  [styles.active]: activeTab === "req",
                })}
                onClick={() => setActiveTab("req")}
              >
                Yêu cầu ứng viên
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "desc" && (
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              )}
              {activeTab === "req" && (
                <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
              )}
            </div>
          </div>

          <button className={styles.reportBtn}>
            <Flag /> Báo cáo tin tuyển dụng lừa đảo
          </button>
        </div>

        {/* CỘT PHẢI: ACTION PANEL */}
        <aside className={styles.actionColumn}>
          <div className={styles.stickyPanel}>
            <div className={styles.actionCard}>
              <button
                className={styles.applyBtn}
                disabled={hasApplied || job.status !== "published"}
              >
                {hasApplied
                  ? "Đã ứng tuyển"
                  : job.status !== "published"
                    ? "Tin đã đóng"
                    : "Ứng tuyển ngay"}
              </button>

              <button className={styles.saveBtn}>
                <Bookmark /> Lưu việc làm
              </button>

              {aiScore && (
                <div className={styles.aiMatchCard}>
                  <div className={styles.scoreHeader}>
                    <Sparkles /> Phân tích AI: {aiScore}/100
                  </div>
                  <div className={styles.scoreText}>
                    Đang chờ cập nhật API phân tích chi tiết...
                  </div>
                </div>
              )}
            </div>

            <div className={styles.companySummaryCard}>
              <h4>Thông tin công ty</h4>
              <div className={styles.companyNameTxt}>{job.company.name}</div>
              <a
                href={`/companies/${job.company.id}`}
                className={styles.viewProfileLink}
              >
                Xem trang công ty →
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

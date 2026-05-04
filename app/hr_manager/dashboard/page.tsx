"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Calendar,
  Activity,
  ExternalLink,
  Video,
  Eye,
  Lock,
  Sparkles,
  FileText,
  ArrowRight,
} from "lucide-react";
import cx from "classnames";
import styles from "./dashboard.module.scss";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

interface ActiveJob {
  id: number;
  title: string;
  applicants_count: number;
  ai_avg_score: number;
  days_remaining: number;
}

interface InterviewItem {
  id: number;
  candidate_name: string;
  job_title: string;
  time: string;
}

interface PendingApplicationItem {
  id: number;
  candidate_name: string;
  job_title: string;
  time: string;
}

export default function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplicants: 0,
    interviewsToday: 0,
    responseRate: 0,
  });
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [pendingApps, setPendingApps] = useState<PendingApplicationItem[]>([]);
  const { company, isVip, loading: loadingCompany } = useCompanyProfile();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Thay bằng API dashboard thật khi backend sẵn sàng.
        // const [statsRes, jobsRes, interviewsRes, pendingRes] = await Promise.all([
        //   apiClient.get("/hr/dashboard/stats"),
        //   apiClient.get("/hr/jobs", { params: { status: "published", limit: 5 } }),
        //   apiClient.get("/hr/interviews", { params: { upcoming: true, limit: 5 } }),
        //   apiClient.get("/hr/applications", { params: { status: "applied", limit: 5 } }),
        // ]);
        setStats({
          activeJobs: 5,
          newApplicants: 24,
          interviewsToday: 2,
          responseRate: 92,
        });
        setActiveJobs([
          {
            id: 1,
            title: "Senior Frontend Developer",
            applicants_count: 15,
            ai_avg_score: 85,
            days_remaining: 10,
          },
          {
            id: 2,
            title: "Backend Node.js",
            applicants_count: 8,
            ai_avg_score: 72,
            days_remaining: 5,
          },
        ]);
        setInterviews([
          {
            id: 1,
            candidate_name: "Nguyễn Quang Duy",
            job_title: "Frontend",
            time: "14:30",
          },
        ]);
        setPendingApps([
          {
            id: 1,
            candidate_name: "Trần Văn A",
            job_title: "Backend Dev",
            time: "2 giờ trước",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || loadingCompany) {
    return <div style={{ padding: "2rem" }}>Đang tải bảng điều khiển...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={cx(styles.iconWrapper, styles.blue)}>
            <Briefcase size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tin đang tuyển</span>
            <span className={styles.statValue}>{stats.activeJobs}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={cx(styles.iconWrapper, styles.green)}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ứng viên mới 7 ngày</span>
            <span className={styles.statValue}>{stats.newApplicants}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={cx(styles.iconWrapper, styles.purple)}>
            <Calendar size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Phỏng vấn hôm nay</span>
            <span className={styles.statValue}>{stats.interviewsToday}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={cx(styles.iconWrapper, styles.orange)}>
            <Activity size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tỷ lệ phản hồi</span>
            <span className={styles.statValue}>{stats.responseRate}%</span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3>Tin tuyển dụng đang hoạt động</h3>
            <Link href="/hr_manager/jobs" className={styles.viewAllBtn}>
              Xem tất cả
            </Link>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Vị trí</th>
                  <th>Ứng viên</th>
                  <th>
                    <div className={styles.aiHeading}>
                      Điểm AI <Sparkles size={14} color="#14b8a6" />
                    </div>
                  </th>
                  <th>Hạn nộp</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map((job) => (
                  <tr key={job.id}>
                    <td className={styles.jobTitle}>{job.title}</td>
                    <td>{job.applicants_count}</td>
                    <td>
                      {isVip ? (
                        <span className={styles.aiScoreBadge}>
                          {job.ai_avg_score}%
                        </span>
                      ) : (
                        <Link
                          href="/hr_manager/pricing"
                          className={styles.lockedAiBadge}
                          title="Nâng cấp VIP để mở khóa"
                        >
                          <Lock size={12} />
                          Bị khóa
                        </Link>
                      )}
                    </td>
                    <td>Còn {job.days_remaining} ngày</td>
                    <td>
                      <Link href={`/hr_manager/jobs/${job.id}/applicants`}>
                        <Button variant="ghost">
                          <ExternalLink size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.aiInsightCard}>
            <div className={styles.aiInsightTop}>
              <div className={styles.aiInsightIcon}>
                {isVip ? <Sparkles size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h3>AI Matching</h3>
                <p>
                  {isVip
                    ? `Đang hoạt động cho ${company.name || "doanh nghiệp"}.`
                    : "Điểm AI và nhận xét chi tiết hiện đang bị khóa."}
                </p>
              </div>
            </div>

            <div className={styles.aiFeatureList}>
              <div className={styles.aiFeatureItem}>
                <Sparkles size={16} />
                Chấm điểm mức độ phù hợp CV
              </div>
              <div className={styles.aiFeatureItem}>
                <Eye size={16} />
                Chi tiết nhận xét điểm mạnh và rủi ro
              </div>
              <div className={styles.aiFeatureItem}>
                <FileText size={16} />
                Trả lời theo tài liệu công ty đã nạp
              </div>
            </div>

            {!isVip && (
              <Link href="/hr_manager/pricing" className={styles.upgradeLink}>
                Nâng cấp VIP
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3>Lịch phỏng vấn</h3>
            </div>
            <div className={styles.listContainer}>
              {interviews.map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.avatar}>
                      <Video size={16} />
                    </div>
                    <div className={styles.details}>
                      <div className={styles.name}>{item.candidate_name}</div>
                      <div className={styles.meta}>
                        {item.job_title} • {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3>Cần xử lý</h3>
            </div>
            <div className={styles.listContainer}>
              {pendingApps.map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.avatar}>
                      {item.candidate_name.charAt(0)}
                    </div>
                    <div className={styles.details}>
                      <div className={styles.name}>{item.candidate_name}</div>
                      <div className={styles.meta}>
                        {item.job_title} • {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

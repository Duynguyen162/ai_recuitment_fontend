"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Building2,
  Loader2,
  MapPin,
  PencilLine,
  WalletCards,
} from "lucide-react";

import styles from "./jobDetail.module.scss";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";

interface CompanyInfo {
  id: number;
  name: string;
  logo_url: string;
}

interface HrJob {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  tags: string[];
  salary_min: number;
  salary_max: number;
  years_of_experience: number;
  job_type: string;
  expired_at: string;
  status: string;
  created_at: string;
  company?: CompanyInfo;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatSalaryRange(min: number, max: number) {
  if (!min && !max) return "Thương lượng";
  if (!min) return `Đến ${formatCurrency(max)} VND`;
  if (!max) return `Từ ${formatCurrency(min)} VND`;
  return `${formatCurrency(min)} - ${formatCurrency(max)} VND`;
}

function formatJobType(jobType: string) {
  if (jobType === "full_time") return "Toàn thời gian";
  if (jobType === "part_time") return "Bán thời gian";
  if (jobType === "contract") return "Hợp đồng";
  if (jobType === "internship") return "Thực tập";
  return jobType;
}

export default function HrJobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const [job, setJob] = useState<HrJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get("/job/get_jobs_create_by_hr");
        const jobs = Array.isArray(res.data?.data) ? res.data.data : [];
        const matchedJob = jobs.find(
          (item: HrJob) => String(item.id) === String(params.jobId),
        );
        setJob(matchedJob ?? null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.jobId]);

  if (loading) {
    return (
      <div className={styles.stateBox}>
        <Loader2 className={styles.spin} />
        <span>Đang tải thông tin job...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.stateBox}>
        <span>Không tìm thấy job.</span>
        <Link href="/hr_manager/jobs">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/hr_manager/jobs" className={styles.backLink}>
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <Link href={`/hr_manager/jobs/${job.id}/edit`}>
          <Button>
            <PencilLine size={16} /> Chỉnh sửa
          </Button>
        </Link>
      </div>

      <section className={styles.hero}>
        <div>
          <div className={styles.status}>{job.status}</div>
          <h1>{job.title}</h1>
          <div className={styles.meta}>
            <span>
              <MapPin size={14} /> {job.location}
            </span>
            <span>
              <Clock3 size={14} /> {formatJobType(job.job_type)}
            </span>
            <span>
              <Building2 size={14} /> {job.company?.name || "Công ty của bạn"}
            </span>
          </div>
        </div>
        <div className={styles.sideMeta}>
          <div>
            <WalletCards size={16} />
            {formatSalaryRange(job.salary_min, job.salary_max)}
          </div>
          <div>
            <Calendar size={16} />
            Hết hạn: {new Date(job.expired_at).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </section>

      <div className={styles.tagRow}>
        {job.tags?.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.card}>
          <h2>Mô tả công việc</h2>
          <p>{job.description}</p>
        </section>

        <section className={styles.card}>
          <h2>Yêu cầu ứng viên</h2>
          <p>{job.requirements}</p>
        </section>

        <section className={styles.card}>
          <h2>Thông tin thêm</h2>
          <p>{job.years_of_experience} năm kinh nghiệm tối thiểu</p>
          <p>Tạo ngày {new Date(job.created_at).toLocaleDateString("vi-VN")}</p>
        </section>
      </div>
    </div>
  );
}

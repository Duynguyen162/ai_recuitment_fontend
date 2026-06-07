"use client";

export type JobStatus = "all" | "published" | "draft" | "closed" | "paused";
export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | string;

export interface CompanyInfo {
  id: number;
  name: string;
  logo_url: string;
}

export interface Candidate {
  application_id: number;
  candidate_id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  years_of_experience: number;
  skill_tags: string[];
  status: string;
  applied_at: string;
  cv_id: number;
  cv_name: string;
}

export interface HrJob {
  id: number;
  company_id: number;
  created_by: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  tags: string[];
  salary_min: number;
  salary_max: number;
  years_of_experience: number;
  job_type: JobType;
  expired_at: string;
  status: Exclude<JobStatus, "all">;
  locked_by_admin: boolean;
  created_at: string;
  company?: CompanyInfo;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface JobCounts {
  all: number;
  published: number;
  draft: number;
  paused: number;
  closed: number;
}

export interface JobSummary {
  publishedJobs: number;
  draftJobs: number;
  totalJobs: number;
  expiringSoon: number;
}

export const STATUS_LABELS: Record<Exclude<JobStatus, "all">, string> = {
  published: "Đang hoạt động",
  draft: "Bản nháp",
  paused: "Tạm dừng",
  closed: "Đã đóng",
};

export const JOB_STATUS_OPTIONS = [
  ["all", "Tất cả"],
  ["published", "Đang hoạt động"],
  ["draft", "Bản nháp"],
  ["paused", "Tạm dừng"],
  ["closed", "Đã đóng"],
] as const satisfies ReadonlyArray<readonly [JobStatus, string]>;

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export function formatJobType(jobType: JobType) {
  if (jobType === "full_time") return "Toàn thời gian";
  if (jobType === "part_time") return "Bán thời gian";
  if (jobType === "contract") return "Hợp đồng";
  if (jobType === "internship") return "Thực tập";
  return jobType;
}

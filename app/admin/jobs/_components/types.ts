export type ReportStatus  = "pending" | "resolved" | "dismissed";
export type AdminAction   = "closed_job" | "no_action";

export interface JobReport {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  reporter_email: string;
  reason: string;
  status: ReportStatus;
  admin_action: AdminAction | null;
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface JobDetail {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  status: string;
  locked_by_admin?: boolean;
  tags: string[];
  created_at: string;
  expired_at: string;
  company: { id: number; name: string; logo_url: string };
}

export const PAGE_SIZE = 15;

/* ─── Status filter tabs ─── */
export const STATUS_TABS: { key: "" | ReportStatus; label: string }[] = [
  { key: "",          label: "Tất cả" },
  { key: "pending",   label: "Chờ xử lý" },
  { key: "resolved",  label: "Đã xử lý" },
  { key: "dismissed", label: "Đã bỏ qua" },
];

/* ─── Admin action filter tabs (hiển thị khi tab status = resolved) ─── */
export const ACTION_TABS: { key: "" | AdminAction; label: string }[] = [
  { key: "",           label: "Mọi hình thức" },
  { key: "closed_job", label: "Đóng & khóa" },
//   { key: "warned",     label: "Cảnh cáo" },
  { key: "no_action",  label: "Không hành động" },
];

/* ─── Hiển thị nhãn & badge cho admin_action ─── */
export const ADMIN_ACTION_LABEL: Record<AdminAction, string> = {
  closed_job: "Đóng & khóa vĩnh viễn",
//   warned:     "Cảnh cáo công ty",
  no_action:  "Không hành động",
};

// Map sang tên class CSS đã có trong AdminLayout.module.scss
export const ADMIN_ACTION_BADGE: Record<AdminAction, string> = {
//   paused_job: "flagged",   // cam
  closed_job: "rejected",  // đỏ
//   warned:     "info",      // xanh dương
  no_action:  "gray",      // xám
};

/* ─── Badge / label cho report status ─── */
export const STATUS_BADGE: Record<string, string> = {
  pending:   "pending",
  resolved:  "approved",
  dismissed: "gray",
};

export const STATUS_LABEL: Record<string, string> = {
  pending:   "Chờ xử lý",
  resolved:  "Đã xử lý",
  dismissed: "Bỏ qua",
};

/* ─── Helpers ─── */
export function formatSalary(min: number, max: number): string {
  if (!min && !max) return "Thỏa thuận";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${n.toLocaleString()}`;
  return `${fmt(min)} – ${fmt(max)} VNĐ`;
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("vi-VN");
}

export function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

import {
  Applicant,
  AppStatus,
  CandidatesTab,
  InterviewMode,
  InterviewSchedule,
} from "./types";

export function formatJobStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "published") return "Đang hoạt động";
  if (normalized === "draft") return "Bản nháp";
  if (normalized === "paused") return "Tạm dừng";
  if (normalized === "closed") return "Đã đóng";
  return status;
}

export function getScoreTone(score: number) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function formatInterviewMode(mode: InterviewMode) {
  return mode === "offline" ? "Offline" : "Online";
}

export function formatInterviewTime(value: string) {
  if (!value) return "Chưa lên lịch";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getMeetingFieldLabel(mode: InterviewMode) {
  return mode === "offline" ? "Địa chỉ phỏng vấn" : "Link họp trực tuyến";
}

export function getMeetingFieldHint(mode: InterviewMode) {
  return mode === "offline"
    ? "Điền địa chỉ đến phỏng vấn, ví dụ: Tầng 5, 12 Nguyễn Huệ, Quận 1"
    : "Điền Google Meet, Zoom, Teams hoặc đường dẫn họp trực tuyến khác";
}

export function getInterviewSummary(schedule: InterviewSchedule | null) {
  if (!schedule) return null;

  const modeStr = schedule.meeting_link?.trim()
    ? "Online"
    : schedule.location?.trim()
      ? "Offline"
      : schedule.mode
        ? formatInterviewMode(schedule.mode)
        : "Phỏng vấn";

  return `${modeStr} • ${formatInterviewTime(schedule.interview_time)}`;
}

export function shouldShowActionControls(tab: CandidatesTab) {
  return true;
}

export function canEditInterviewNotes(status: AppStatus, tab: CandidatesTab) {
  return status === "interviewing";
}

export function filterApplicants(
  applicants: Applicant[],
  activeTab: CandidatesTab,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return applicants.filter((app) => {
    const matchesSearch =
      normalizedQuery.length === 0
        ? true
        : app.candidate_name.toLowerCase().includes(normalizedQuery) ||
          app.email.toLowerCase().includes(normalizedQuery) ||
          (app.cv_name ?? "").toLowerCase().includes(normalizedQuery);

    const matchesStatus = activeTab === "all" ? true : app.status === activeTab;

    return matchesSearch && matchesStatus;
  });
}

import { Applicant, AppStatus, HrJob, InterviewMode } from "./types";

export function normalizeStatus(value: unknown): AppStatus {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "reviewed" ||
    normalized === "pending" ||
    normalized === "applied"
  ) {
    return "applied";
  }

  if (normalized === "interviewing" || normalized === "interview") {
    return "interviewing";
  }

  if (normalized === "hired" || normalized === "accepted") {
    return "hired";
  }

  if (normalized === "withdrawn") {
    return "withdrawn";
  }

  if (normalized === "left_company") {
    return "left_company";
  }

  if (
    normalized === "rejected" ||
    normalized === "declined" ||
    normalized === "cancelled"
  ) {
    return "rejected";
  }

  return "applied";
}

function normalizeApplicantsCount(job: Record<string, unknown>) {
  const rawCount =
    job.applicants_count ?? job.application_count ?? job.total_candidates ?? 0;
  const parsed =
    typeof rawCount === "number" ? rawCount : Number(String(rawCount));

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeInterviewMode(value: unknown): InterviewMode {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return normalized === "offline" ? "offline" : "online";
}

export function normalizeJob(item: unknown): HrJob | null {
  if (!item || typeof item !== "object") return null;

  const source = item as Record<string, unknown>;
  const id =
    typeof source.id === "number" ? source.id : Number(String(source.id ?? ""));

  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: String(source.title ?? `Job #${id}`),
    location: String(source.location ?? "Đang cập nhật"),
    status: String(source.status ?? "draft"),
    applicants_count: normalizeApplicantsCount(source),
    created_at:
      typeof source.created_at === "string" ? source.created_at : undefined,
    expired_at:
      typeof source.expired_at === "string" ? source.expired_at : undefined,
  };
}

export function normalizeApplicant(item: unknown): Applicant | null {
  if (!item || typeof item !== "object") return null;

  const source = item as Record<string, unknown>;
  const idValue =
    source.id ?? source.application_id ?? source.candidate_id ?? source.user_id;

  if (idValue === undefined || idValue === null) return null;

  const interviewTime =
    typeof source.interview_time === "string" ? source.interview_time : "";
  const meetingLink =
    typeof source.meeting_link === "string" ? source.meeting_link : "";
  const location =
    typeof source.location === "string" ? source.location : "";
  const interviewNotes =
    typeof source.notes === "string" ? source.notes : "";
  const interviewId =
    typeof source.interview_id === "number" ? source.interview_id : undefined;

  return {
    id: String(idValue),
    candidate_name: String(
      source.candidate_name ?? source.full_name ?? source.name ?? "Ứng viên",
    ),
    application_id: Number(source.application_id),
    email: String(source.email ?? source.candidate_email ?? "Chưa có email"),
    applied_at: String(
      source.applied_at ??
        source.created_at ??
        source.application_date ??
        new Date().toISOString(),
    ),
    cv_id:
      source.cv_id === undefined || source.cv_id === null
        ? null
        : String(source.cv_id),
    cv_name:
      source.cv_name === undefined || source.cv_name === null
        ? typeof source.file_name === "string"
          ? source.file_name
          : null
        : String(source.cv_name),
    ai_score: Number(source.ai_score ?? source.match_score ?? 0) || 0,
    ai_summary: String(
      source.ai_summary ??
        source.summary ??
        "Chưa có nhận xét AI chi tiết cho ứng viên này.",
    ),
    ai_strengths: Array.isArray(source.ai_strengths)
      ? source.ai_strengths.map(String)
      : Array.isArray(source.strengths)
        ? source.strengths.map(String)
        : [],
    ai_risks: Array.isArray(source.ai_risks)
      ? source.ai_risks.map(String)
      : Array.isArray(source.risks)
        ? source.risks.map(String)
        : [],
    recommendation: String(
      source.recommendation ??
        source.ai_recommendation ??
        "Chưa có khuyến nghị bổ sung.",
    ),
    status: normalizeStatus(source.status),
    interview:
      interviewTime || meetingLink || location
        ? {
            id: interviewId,
            application_id: Number(source.application_id),
            interview_time: interviewTime,
            meeting_link: meetingLink,
            location: location,
            notes: interviewNotes,
            mode: meetingLink.trim() ? "online" : (location.trim() ? "offline" : "online"),
          }
        : null,
    notes: typeof source.notes === "string" ? source.notes : null,
    job_title: typeof source.job_title === "string" ? source.job_title : (typeof source.job_name === "string" ? source.job_name : (typeof source.position === "string" ? source.position : "Chưa cập nhật")),
    cv_type: (source.cv_type === "profile" || source.cv_type === "uploaded_cv") 
      ? source.cv_type 
      : (source.cv_id ? "uploaded_cv" : "profile"),
    ai_status: (["not_queued","queued","processing","done","failed","dead"].includes(source.ai_status))
      ? source.ai_status
      : (Number(source.ai_score ?? source.match_score ?? 0) > 0 ? "done" : "pending"),
    candidate_id: source.candidate_id ? Number(source.candidate_id) : undefined,
  };
}

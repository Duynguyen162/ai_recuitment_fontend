export type AppStatus = "applied" | "interviewing" | "hired" | "rejected" | "withdrawn" | "left_company";

export type CandidatesTab = "all" | AppStatus;

export type InterviewMode = "online" | "offline";

export interface HrJob {
  id: number;
  title: string;
  location: string;
  status: string;
  applicants_count: number;
  created_at?: string;
  expired_at?: string;
}

export interface InterviewSchedule {
  id?: number;
  application_id?: number;
  interviewer_id?: number;
  interview_time: string;
  meeting_link: string;
  location: string;
  notes: string;
  mode?: InterviewMode;
}

export interface Applicant {
  id: string;
  application_id: number;
  candidate_name: string;
  email: string;
  applied_at: string;
  cv_id: string | null;
  cv_name: string | null;
  ai_score: number;
  ai_summary: string;
  ai_strengths: string[];
  ai_risks: string[];
  recommendation: string;
  status: AppStatus;
  interview: InterviewSchedule | null;
  notes: string | null;
  job_title?: string;
}

export interface InterviewScheduleFormValues {
  interview_time: string;
  meeting_link: string;
  location: string;
  notes: string;
  mode: InterviewMode;
}

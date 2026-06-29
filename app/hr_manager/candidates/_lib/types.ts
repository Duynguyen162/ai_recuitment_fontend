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
  cv_type?: "profile" | "uploaded_cv";
  ai_status?: "not_queued" | "queued" | "processing" | "done" | "failed" | "dead" | "pending";
  candidate_id?: number;
  avatar_url?: string | null;
}

export interface InterviewScheduleFormValues {
  interview_time: string;
  meeting_link: string;
  location: string;
  notes: string;
  mode: InterviewMode;
}

export interface CandidateProfileData {
  candidate_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  summary?: string;
  avatar_url?: string | null;
  experiences?: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  educations?: Array<{
    school: string;
    degree: string;
    major?: string;
    start_date: string;
    end_date?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    issued_date?: string;
  }>;
  skills?: string[];
  interview?: InterviewSchedule | null;
}

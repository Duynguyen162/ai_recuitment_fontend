export interface DashboardStats {
  activeJobs: number;
  newApplicants: number;
  interviewsToday: number;
  responseRate: number;
}

export interface ActiveJob {
  id: number;
  title: string;
  applicants_count: number;
  ai_avg_score: number;
  days_remaining: number;
}

export interface InterviewItem {
  id: number;
  candidate_name: string;
  job_title: string;
  time: string;
}

export interface PendingApplicationItem {
  id: number;
  candidate_name: string;
  job_title: string;
  time: string;
}

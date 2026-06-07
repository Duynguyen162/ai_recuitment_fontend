"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import styles from "./dashboard.module.scss";
import apiClient from "@/lib/apiClient";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

// Types
import {
  DashboardStats,
  ActiveJob,
  InterviewItem,
  PendingApplicationItem,
} from "./_lib/types";

// Components
import StatsGrid from "./_components/StatsGrid";
import PendingApplicationsTable from "./_components/PendingApplicationsTable";
import UpcomingInterviewsList from "./_components/UpcomingInterviewsList";
import ActiveJobsTable from "./_components/ActiveJobsTable";
import AiInsightCard from "./_components/AiInsightCard";

export default function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
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
        const [statsRes, pendingRes, interviewsRes, jobsRes] = await Promise.all([
          apiClient.get("/hr/dashboard/stats"),
          apiClient.get("/hr/dashboard/pending-applications"),
          apiClient.get("/hr/dashboard/upcoming-interviews"),
          apiClient.get("/hr/dashboard/active-jobs"),
        ]);

        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (pendingRes.data?.success) setPendingApps(pendingRes.data.data);
        if (interviewsRes.data?.success) setInterviews(interviewsRes.data.data);
        if (jobsRes.data?.success) setActiveJobs(jobsRes.data.data);
        
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        //toast.error("Không thể tải bảng điều khiển.");
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
      <StatsGrid stats={stats} />

      <div className={styles.contentGrid}>
        {/* ROW 1: Actionable Items (High Priority) */}
        <div className={styles.row}>
          <PendingApplicationsTable pendingApps={pendingApps} />
          <UpcomingInterviewsList interviews={interviews} />
        </div>

        {/* ROW 2: Overview & Insights (Secondary Priority) */}
        <div className={styles.row}>
          <ActiveJobsTable activeJobs={activeJobs} isVip={isVip} />
          <AiInsightCard isVip={isVip} companyName={company?.name} />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

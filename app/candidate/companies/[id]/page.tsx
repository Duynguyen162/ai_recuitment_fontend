"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import CompanyHeader from "./_components/CompanyHeader";
import CompanyAbout from "./_components/CompanyAbout";
import CompanyJobs from "./_components/CompanyJobs";
import styles from "./page.module.scss";

type TabType = "about" | "jobs";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const companyId = parseInt(id as string, 10);
  
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("about");

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/public/companies/${companyId}`);
        if (res.data?.success) {
          setCompany(res.data.data);
        } else {
          setError("Không tìm thấy thông tin công ty.");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Công ty không tồn tại.");
        } else {
          setError("Lỗi khi tải thông tin công ty.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  if (loading) {
    return <div className={styles.loading}>Đang tải thông tin công ty...</div>;
  }

  if (error || !company) {
    return (
      <div className={styles.errorState}>
        <h2>Rất tiếc!</h2>
        <p>{error || "Không tìm thấy công ty."}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CompanyHeader company={company} />

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "about" ? styles.active : ""}`}
          onClick={() => setActiveTab("about")}
        >
          Giới thiệu
        </button>
        <button
          className={`${styles.tab} ${activeTab === "jobs" ? styles.active : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          Tin tuyển dụng
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "about" ? (
          <CompanyAbout description={company.description} />
        ) : (
          <CompanyJobs companyId={companyId} />
        )}
      </div>
    </div>
  );
}

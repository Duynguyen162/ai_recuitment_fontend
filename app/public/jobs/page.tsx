"use client";

import React, { useEffect, useState } from "react";
import styles from "./jobs.module.scss";
import { useRouter, useSearchParams } from "next/navigation";
import JobSearchBar from "@/components/jobs/JobSearchBar";
import SidebarFilter, { FilterParams } from "@/components/jobs/SideBarFilter";
import JobCard from "@/components/jobs/JobCard";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function JobsPage() {
  // ... (giữ nguyên các state và useEffect của bạn) ...
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    location: "",
    jobType: "",
    experience: "",
  });
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword");
  const [jobResults, setJobResults] = useState<any[]>([]);
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (keywordFromUrl) {
      setSearchQuery(keywordFromUrl);
      setPage(1);
    }
  }, [keywordFromUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isSearching = searchQuery || filters.location || filters.jobType;

        const url = isSearching
          ? `${process.env.NEXT_PUBLIC_API_URL}/job/search_jobs`
          : `${process.env.NEXT_PUBLIC_API_URL}/job/job_proposed`;

        const response = await axios.get(url, {
          params: {
            keyword: searchQuery,
            location: filters.location,
            tag: searchQuery,
            job_type: filters.jobType,
            experience: filters.experience,
            limit: limit,
            offset: (page - 1) * limit,
          },
        });

        setJobResults(response.data.data);
        setTotal(response.data.meta.total);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchQuery, filters]);

  const handleSearch = (query: string) => {
    router.push(`/public/jobs?keyword=${encodeURIComponent(query)}`);
  };

  const handleApplyFilter = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleBookmark = (id: string) => {
    console.log("lưu job yêu thích:", id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Cuộn lên đầu trang
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <JobSearchBar initialQuery={searchQuery} onSearch={handleSearch} />
      </div>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <SidebarFilter
            initialFilters={filters}
            onApplyFilter={handleApplyFilter}
            onClearFilter={() =>
              setFilters({ location: "", jobType: "", experience: "" })
            }
          />
        </aside>

        <div className={styles.contentArea}>
          <div className={styles.listHeader}>
            <span className={styles.count}>
              Tìm thấy <b>{total}</b> việc làm phù hợp
            </span>
            <div className={styles.sortBox}>{/* ... */}</div>
          </div>

          <div className={styles.jobGrid}>
            {loading ? (
              <p className={styles.loadingText}>Đang tải việc làm...</p>
            ) : (
              Array.isArray(jobResults) &&
              jobResults.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  companyName={job.company?.name || "Đang cập nhật"}
                  location={job.location}
                  yearsOfExperience={job.years_of_experience}
                  salaryRange={
                    job.salary_max
                      ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                      : "Thỏa thuận"
                  }
                  jobType={job.job_type}
                  postedDate={dayjs(job.created_at).fromNow()}
                  onBookmarkClick={handleBookmark}
                />
              ))
            )}
          </div>
          {/* phân trang */}
          {totalPages > 0 && (
            <div className={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Trang trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? styles.activePage : ""}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

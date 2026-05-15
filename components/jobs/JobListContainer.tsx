"use client";

import React, { useEffect, useState } from "react";
import styles from "./JobListContainer.module.scss";
import { useRouter, useSearchParams } from "next/navigation";
import JobSearchBar from "@/components/jobs/JobSearchBar";
import SidebarFilter, { FilterParams } from "@/components/jobs/SideBarFilter";
import JobCard from "@/components/jobs/JobCard";
import apiClient from "@/lib/apiClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useAuthStore } from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function JobsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keywordFromUrl = searchParams.get("keyword");

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const [loading, setLoading] = useState(false);
    const [jobResults, setJobResults] = useState<any[]>([]);

    const [filters, setFilters] = useState<FilterParams>({
        location: "",
        jobType: "",
        experience: "",
    });

    // Quản lý Tab
    const [activeTab, setActiveTab] = useState<"matched" | "all">("matched");
    const { user } = useAuthStore();
    const isCandidate = user?.role === "candidate";

    // Quản lý trạng thái đóng/mở của bộ lọc
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const totalPages = Math.ceil(total / limit);

    // Tính số lượng bộ lọc đang được áp dụng (để hiển thị lên nút)
    const activeFilterCount = Object.values(filters).filter(val => val !== "").length;

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
                const isSearching = searchQuery || filters.location || filters.jobType || filters.experience;

                let url = "";
                let params: any = {
                    limit: limit,
                    offset: (page - 1) * limit,
                };

                if (isSearching) {
                    url = "/job/search_jobs";
                    params = {
                        ...params,
                        keyword: searchQuery,
                        location: filters.location,
                        tag: searchQuery,
                        job_type: filters.jobType,
                        experience: filters.experience,
                    };
                } else if (activeTab === "matched" && isCandidate) {
                    url = "/job/job_matched_cv";
                } else {
                    url = "/job/job_proposed";
                }

                const response = await apiClient.get(url, { params });

                setJobResults(response.data.data);
                setTotal(response.data.meta.total);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, searchQuery, filters, activeTab, isCandidate]);

    // TỰ ĐỘNG ĐÓNG BỘ LỌC khi chuyển trang
    useEffect(() => {
        setIsFilterOpen(false);
    }, [page]);

    const handleSearch = (query: string) => {
        setIsFilterOpen(false); // Đóng bộ lọc khi search
        router.push(`/public/jobs?keyword=${encodeURIComponent(query)}`);
    };

    const handleApplyFilter = (newFilters: FilterParams) => {
        setFilters(newFilters);
        setPage(1);
        setIsFilterOpen(false); // Đóng bộ lọc sau khi áp dụng xong
    };

    const handleClearFilter = () => {
        setFilters({ location: "", jobType: "", experience: "" });
        setIsFilterOpen(false);
    };

    const handleBookmark = async (id: string) => {
        try {
            const job = jobResults.find(j => j.id === id);

            if (job?.isSaved) {
                await apiClient.delete(`/job/delete_save_job?job_id=${id}`);
            } else {
                await apiClient.post(`/job/save_job/${id}`);
            }

            setJobResults(prev =>
                prev.map(j =>
                    j.id === id
                        ? { ...j, isSaved: !j.isSaved }
                        : j
                )
            );

            toast.success(job?.isSaved ? "Đã bỏ lưu" : "Đã lưu");
        } catch (error) {
            toast.error("Lỗi");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className={styles.container}>
            <div className={styles.topControls}>
                {/* Hàng ngang chứa thanh Search và Nút mở Filter */}
                <div className={styles.searchRow}>
                    <div className={styles.searchWrapper}>
                        <JobSearchBar initialQuery={searchQuery} onSearch={handleSearch} />
                    </div>

                    <button
                        className={`${styles.filterToggleBtn} ${isFilterOpen ? styles.active : ""}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Bộ lọc {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
                    </button>
                </div>

                {/* Khu vực chứa Component Lọc */}
                <div className={`${styles.filterExpandedArea} ${isFilterOpen ? styles.open : ""}`}>
                    <div className={styles.filterContent}>
                        <SidebarFilter
                            initialFilters={filters}
                            onApplyFilter={handleApplyFilter}
                            onClearFilter={handleClearFilter}
                        />
                    </div>
                </div>
            </div>

            {isCandidate && !searchQuery && (
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabItem} ${activeTab === "matched" ? styles.active : ""}`}
                        onClick={() => {
                            setActiveTab("matched");
                            setPage(1);
                        }}
                    >
                        Việc làm phù hợp
                        {activeTab === "matched" && <div className={styles.activeIndicator} />}
                    </button>
                    <button
                        className={`${styles.tabItem} ${activeTab === "all" ? styles.active : ""}`}
                        onClick={() => {
                            setActiveTab("all");
                            setPage(1);
                        }}
                    >
                        Tất cả việc làm
                        {activeTab === "all" && <div className={styles.activeIndicator} />}
                    </button>
                </div>
            )}

            <div className={styles.mainLayout}>
                <div className={styles.contentArea}>
                    <div className={styles.listHeader}>
                        <span className={styles.count}>
                            {searchQuery ? (
                                <>Tìm thấy <b>{total}</b> việc làm cho từ khóa "{searchQuery}"</>
                            ) : activeTab === "matched" ? (
                                <>Tìm thấy <b>{total}</b> việc làm phù hợp với hồ sơ của bạn</>
                            ) : (
                                <>Tìm thấy <b>{total}</b> việc làm mới nhất</>
                            )}
                        </span>
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
                                    isSaved={job.isSaved}
                                    onBookmarkClick={handleBookmark}
                                />
                            ))
                        )}
                    </div>

                    {totalPages > 0 && (
                        /* Giữ nguyên logic phân trang của bạn */
                        <div className={styles.pagination}>
                            <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
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
                            <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
                                Trang sau
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Toaster />
        </div>
    );
}
"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    MapPin,
    CircleDollarSign,
    Clock,
    BookmarkMinus,
    Briefcase,
    Eye,
    DeleteIcon,
    Recycle,
    BinaryIcon,
    Trash2,
} from "lucide-react";
import cx from "classnames";
import styles from "./SavedJobsPage.module.scss";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import ApplyJobModal from "@/components/jobs/ApplyJobModal";
import { formatSalary } from "@/utils/formatSalary";
import { getDeadlineText } from "@/utils/formatDate";

interface Job {
    id: string; // ID của bản ghi lưu
    title: string;
    company: {
        id: number
        name: string;
        logo_url: string;
    };
    location: string;
    salary_min: string;
    salary_max: string;
    expired_at: string;
}

export default function SavedJobsPage() {
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // State quản lý việc mở Modal ứng tuyển
    const [applyModal, setApplyModal] = useState<{
        isOpen: boolean;
        jobId: string;
        jobTitle: string;
    }>({ isOpen: false, jobId: "", jobTitle: "" });

    const fetchSavedJobs = async () => {
        try {
            const res = await apiClient.get("/job/save_job");
            setSavedJobs(res.data.data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách việc làm đã lưu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    // Hàm Bỏ lưu công việc (Không cần ConfirmModal để tăng tốc độ UX)
    const handleUnsaveJob = async (id: string) => {
        const previousJobs = [...savedJobs];
        setSavedJobs((prev) => prev.filter((job) => job.id !== id));

        try {
            await apiClient.delete(`/job/delete_saved_job?job_id=${id}`);
            toast.success("Đã bỏ lưu công việc");
        } catch (error) {
            setSavedJobs(previousJobs);
            toast.error("Lỗi khi bỏ lưu");
        }
    };

    if (loading) {
        return <div className={styles.loader}>Đang tải danh sách...</div>;
    }
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Việc làm đã lưu</h1>
                <p>Xem lại và ứng tuyển ngay vào những cơ hội bạn đã đánh dấu.</p>
            </div>

            <div className={styles.jobList}>
                {savedJobs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <BookmarkMinus size={48} className={styles.emptyIcon} />
                        <p>Bạn chưa lưu công việc nào.</p>
                        <Link href="/candidate/search_job">
                            <Button variant="primary">Khám phá việc làm mới</Button>
                        </Link>
                    </div>
                ) : (
                    savedJobs.map((job) => (
                        <div key={job.id} className={styles.jobCard}>
                            <div className={styles.jobMainInfo}>
                                <Link href={`/candidate/job_detail?id=${job.id}`} className={styles.jobTitle}>
                                    {job.title}
                                </Link>
                                <div className={styles.companyName}>
                                    <Building2 size={16} /> {job.company.name}
                                </div>

                                <div className={styles.tagsContainer}>
                                    <div className={styles.tag}>
                                        <CircleDollarSign size={14} />{" "}
                                        {formatSalary(job.salary_min, job.salary_max)}
                                    </div>
                                    <div className={styles.tag}>
                                        <MapPin size={14} /> {job.location}
                                    </div>
                                    <div className={styles.tag}>
                                        <Clock size={14} /> Hạn nộp:{" "}
                                        {getDeadlineText(job.expired_at)}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.jobActions}>
                                <div className={styles.secondaryAction}>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleUnsaveJob(job.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>

                                <div className={styles.primaryAction}>
                                    <Link href={`/candidate/job_detail?id=${job.id}`}>
                                        <Button variant="primary">
                                            <Eye size={16} />
                                            Xem chi tiết
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Render Modal Ứng tuyển đã tái sử dụng */}
            {applyModal.isOpen && (
                <ApplyJobModal
                    jobId={applyModal.jobId}
                    jobTitle={applyModal.jobTitle}
                    onClose={() =>
                        setApplyModal({ isOpen: false, jobId: "", jobTitle: "" })
                    }
                    onSuccess={() => {
                        // Khi ứng tuyển thành công, có thể bạn muốn tự động xóa nó khỏi danh sách đã lưu?
                        // Tùy logic nghiệp vụ của bạn, nếu muốn thì gọi handleUnsaveJob ở đây.
                    }}
                />
            )}

            <Toaster />
        </div>
    );
}

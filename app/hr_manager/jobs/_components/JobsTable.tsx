import Link from "next/link";
import {
    BadgeDollarSign,
    Building2,
    Calendar,
    Clock3,
    FileText,
    Loader2,
    MapPin,
} from "lucide-react";
import cx from "classnames";

import styles from "../jobsManagement.module.scss";
import JobActionsMenu from "./JobActionsMenu";
import {
    formatJobType,
    STATUS_LABELS,
    type HrJob,
} from "../_lib/jobManagement";
import Button from "@/components/ui/Button";
import { formatSalary } from "@/utils/formatSalary";

interface JobsTableProps {
    jobs: HrJob[];
    loading: boolean;
    openMenuId: number | null;
    onToggleMenu: (jobId: number | null) => void;
    onOpenPreview: (job: HrJob) => void;
    onChangeStatus: (job: HrJob, status: string) => void;
    onDeleteJob: (job: HrJob) => void;
}

export default function JobsTable({
    jobs,
    loading,
    openMenuId,
    onToggleMenu,
    onOpenPreview,
    onChangeStatus,
    onDeleteJob,
}: JobsTableProps) {

    if (loading && jobs.length === 0) {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={20} className={styles.spin} />
                <span>Đang tải dữ liệu...</span>
            </div>
        );
    }

    if (!loading && jobs.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.iconWrapper}>
                    <FileText size={32} />
                </div>
                <h3>Không tìm thấy tin tuyển dụng nào</h3>
                <p>Thử thay đổi bộ lọc hoặc tạo job mới để bắt đầu.</p>
                <Link href="/hr_manager/jobs/create">
                    <Button variant="outline">Tạo job mới</Button>
                </Link>
            </div>
        );
    }

    return (
        <div
            className={cx(styles.tableWrapper, {
                [styles.isRevalidating]: loading && jobs.length > 0,
            })}
        >
            {loading && jobs.length > 0 && (
                <div className={styles.topLoadingBar}>
                    <div className={styles.progress} />
                </div>
            )}
            <table>
                <thead>
                    <tr>
                        <th>Vị trí tuyển dụng</th>
                        <th>Trạng thái</th>
                        <th>Mức lương và kinh nghiệm</th>
                        <th>Thời gian</th>
                        <th style={{ width: "92px", textAlign: "right" }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.id}>
                            <td>
                                <div className={styles.jobMain}>
                                    <button
                                        type="button"
                                        className={styles.title}
                                        onClick={() => onOpenPreview(job)}
                                    >
                                        {job.title}
                                    </button>
                                    <div className={styles.meta}>
                                        <span>
                                            <MapPin size={12} /> {job.location || "Đang cập nhật"}
                                        </span>
                                        <span>
                                            <Clock3 size={12} /> {formatJobType(job.job_type)}
                                        </span>
                                        <span>
                                            <Building2 size={12} />{" "}
                                            {job.company?.name || "Công ty của bạn"}
                                        </span>
                                    </div>
                                    {!!job.tags?.length && (
                                        <div className={styles.tagRow}>
                                            {job.tags.slice(0, 4).map((tag) => (
                                                <span key={tag} className={styles.tag}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td>
                                <span className={cx(styles.statusBadge, styles[job.status])}>
                                    {STATUS_LABELS[job.status]}
                                </span>
                            </td>

                            <td>
                                <div className={styles.statsCol}>
                                    <span>
                                        <BadgeDollarSign size={12} />
                                        {formatSalary(job.salary_min, job.salary_max)}
                                    </span>
                                    <span>{job.years_of_experience} năm kinh nghiệm</span>
                                </div>
                            </td>

                            <td>
                                <div className={styles.statsCol}>
                                    <span>
                                        <Calendar size={12} /> Tạo:{" "}
                                        {new Date(job.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                    <span>
                                        <Calendar size={12} /> Hạn:{" "}
                                        {new Date(job.expired_at).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            </td>

                            <td>
                                <JobActionsMenu
                                    job={job}
                                    isOpen={openMenuId === job.id}
                                    onToggle={onToggleMenu}
                                    onOpenPreview={onOpenPreview}
                                    onChangeStatus={onChangeStatus}
                                    onDelete={onDeleteJob}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

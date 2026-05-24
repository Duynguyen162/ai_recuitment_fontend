"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Lock, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "../dashboard.module.scss";
import { ActiveJob } from "../_lib/types";

interface ActiveJobsTableProps {
    activeJobs: ActiveJob[];
    isVip: boolean;
}

export default function ActiveJobsTable({
    activeJobs,
    isVip,
}: ActiveJobsTableProps) {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
                <h3>Tin tuyển dụng đang hoạt động</h3>
                <Link href="/hr_manager/jobs" className={styles.viewAllBtn}>
                    Xem tất cả
                </Link>
            </div>
            <div className={styles.tableWrapper}>
                <table>
                    <thead>
                        <tr>
                            <th>Vị trí</th>
                            <th>Ứng viên</th>
                            <th>
                                <div className={styles.aiHeading}>
                                    Điểm AI <Sparkles size={14} color="#14b8a6" />
                                </div>
                            </th>
                            <th>Hạn nộp</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeJobs.length > 0 ? (
                            activeJobs.map((job) => (
                                <tr key={job.id}>
                                    <td className={styles.jobTitle}>{job.title}</td>
                                    <td>{job.applicants_count}</td>
                                    <td>
                                        {isVip ? (
                                            <span className={styles.aiScoreBadge}>
                                                {job.ai_avg_score}%
                                            </span>
                                        ) : (
                                            <Link
                                                href="/hr_manager/pricing"
                                                className={styles.lockedAiBadge}
                                                title="Nâng cấp VIP để mở khóa"
                                            >
                                                <Lock size={12} />
                                                Bị khóa
                                            </Link>
                                        )}
                                    </td>
                                    <td>Còn {job.days_remaining} ngày</td>
                                    <td style={{ display: "flex", justifyContent: "center" }}>
                                        <Link href={`/hr_manager/candidates?jobId=${job.id}`}>
                                            <ExternalLink size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#64748b",
                                    }}
                                >
                                    Không có tin tuyển dụng nào đang hoạt động.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

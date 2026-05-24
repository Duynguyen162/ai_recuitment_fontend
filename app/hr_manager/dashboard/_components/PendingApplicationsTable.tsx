"use client";

import React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "../dashboard.module.scss";
import { PendingApplicationItem } from "../_lib/types";

interface PendingApplicationsTableProps {
    pendingApps: PendingApplicationItem[];
}

export default function PendingApplicationsTable({
    pendingApps,
}: PendingApplicationsTableProps) {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
                <h3>Ứng viên cần xử lý</h3>
                <Link href="/hr_manager/candidates" className={styles.viewAllBtn}>
                    Xem tất cả
                </Link>
            </div>
            <div className={styles.tableWrapper}>
                <table>
                    <thead>
                        <tr>
                            <th>Ứng viên</th>
                            <th>Vị trí ứng tuyển</th>
                            <th>Thời gian nộp</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingApps.length > 0 ? (
                            pendingApps.map((item) => (
                                <tr key={item.id}>
                                    <td className={styles.jobTitle}>{item.candidate_name}</td>
                                    <td>{item.job_title}</td>
                                    <td>{item.time}</td>
                                    <td style={{ display: "flex", justifyContent: "center" }}>
                                        <Link href={`/hr_manager/candidates?jobId=${item.id}`}>
                                            <Eye size={16} style={{ marginRight: "0.3rem" }} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#64748b",
                                    }}
                                >
                                    Không có ứng viên nào cần xử lý.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}

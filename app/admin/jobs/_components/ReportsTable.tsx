"use client";

import React from "react";
import cx from "classnames";
import { Eye, CheckSquare, XSquare } from "lucide-react";
import adminStyles from "../../AdminLayout.module.scss";
import s from "./ReportsTable.module.scss";
import toast from "react-hot-toast";
import {
    JobReport, AdminAction, PAGE_SIZE,
    STATUS_BADGE, STATUS_LABEL,
    ADMIN_ACTION_LABEL, ADMIN_ACTION_BADGE,
    formatDate, formatDateTime,
} from "./types";

interface Props {
    reports: JobReport[];
    loading: boolean;
    page: number;
    onViewJob: (report: JobReport) => void;
    onResolve: (reportId: number, status: "resolved" | "dismissed", adminAction: AdminAction) => Promise<void>;
}

export default function ReportsTable({ reports, loading, page, onViewJob, onResolve }: Props) {
    return (
        <div className={adminStyles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tin tuyển dụng</th>
                        <th>Công ty</th>
                        <th>Người báo cáo</th>
                        <th>Lý do</th>
                        <th>Ngày báo cáo</th>
                        <th>Trạng thái xử lý</th>
                        <th style={{ textAlign: "right" }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8}>
                                <div className={adminStyles.emptyState}>Đang tải...</div>
                            </td>
                        </tr>
                    ) : reports.length === 0 ? (
                        <tr>
                            <td colSpan={8}>
                                <div className={adminStyles.emptyState}>Không có báo cáo nào.</div>
                            </td>
                        </tr>
                    ) : reports.map((r, i) => (
                        <tr key={r.id} className={s.row}>
                            <td className={s.colNum}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td className={s.colTitle}>{r.job_title}</td>
                            <td className={s.colCompany}>{r.company_name}</td>
                            <td className={s.colReporter}>{r.reporter_email}</td>
                            <td className={s.colReason}>{r.reason}</td>
                            <td className={s.colDate}>{formatDate(r.created_at)}</td>

                            {/* Cột trạng thái — hiển thị cả admin_action nếu đã xử lý */}
                            <td className={s.colStatus}>
                                <div className={s.statusStack}>
                                    {/* Badge trạng thái báo cáo */}
                                    <span className={cx(adminStyles.badge, adminStyles[STATUS_BADGE[r.status] ?? "gray"])}>
                                        {STATUS_LABEL[r.status] ?? r.status}
                                    </span>

                                    {/* Badge hành động xử lý — chỉ hiện khi đã có admin_action */}
                                    {r.admin_action && (
                                        <span className={cx(adminStyles.badge, adminStyles[ADMIN_ACTION_BADGE[r.admin_action]])}>
                                            {ADMIN_ACTION_LABEL[r.admin_action]}
                                        </span>
                                    )}

                                    {/* Ghi chú nội bộ nếu có */}
                                    {r.admin_note && (
                                        <span className={s.adminNote} title={r.admin_note}>
                                            💬 {r.admin_note.length > 30 ? r.admin_note.slice(0, 30) + "…" : r.admin_note}
                                        </span>
                                    )}

                                    {/* Thời điểm xử lý */}
                                    {r.resolved_at && (
                                        <span className={s.resolvedAt}>🕐 {formatDateTime(r.resolved_at)}</span>
                                    )}
                                </div>
                            </td>

                            <td className={s.colActions}>
                                <div className={adminStyles.actionGroup} style={{ justifyContent: "flex-end" }}>
                                    <button
                                        className={cx(adminStyles.btnSm, adminStyles.blue)}
                                        onClick={() => onViewJob(r)}
                                    >
                                        <Eye size={13} /> Xem job
                                    </button>
                                    {r.status === "pending" && (
                                        <>
                                            {/* Nút nhanh — cảnh cáo (resolved + warned) */}
                                            {/* <button
                        className={cx(adminStyles.btnSm, adminStyles.green)}
                        onClick={async () => {
                          try { await onResolve(r.id, "resolved", "warned"); }
                          catch { toast.error("Thao tác thất bại."); }
                        }}
                      >
                        <CheckSquare size={13} /> Cảnh cáo
                      </button> */}
                                            {/* Nút nhanh — bỏ qua (dismissed + no_action) */}
                                            <button
                                                className={cx(adminStyles.btnSm, adminStyles.gray)}
                                                onClick={async () => {
                                                    try { await onResolve(r.id, "dismissed", "no_action"); }
                                                    catch { toast.error("Thao tác thất bại."); }
                                                }}
                                            >
                                                <XSquare size={13} /> Bỏ qua
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

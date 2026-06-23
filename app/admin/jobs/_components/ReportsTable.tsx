"use client";

import React, { useState } from "react";
import cx from "classnames";
import { Eye, CheckSquare, XSquare, List } from "lucide-react";
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
    onResolve: (jobId: number, status: "resolved" | "dismissed", adminAction: AdminAction) => Promise<void>;
}

export default function ReportsTable({ reports, loading, page, onViewJob, onResolve }: Props) {
    const [viewReasons, setViewReasons] = useState<string[] | null>(null);

    return (
        <div className={adminStyles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tin tuyển dụng</th>
                        <th>Công ty</th>
                        <th>Số lượt báo cáo</th>
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
                        <tr key={r.job_id} className={s.row}>
                            <td className={s.colNum}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td className={s.colTitle}>{r.job_title}</td>
                            <td className={s.colCompany}>{r.company_name}</td>
                            <td className={s.colReporter} style={{ textAlign: "center" }}>
                                <span className={adminStyles.badge} style={{ background: "#fee2e2", color: "#ef4444" }}>
                                    {r.report_count}
                                </span>
                            </td>
                            <td className={s.colReason}>
                                <button
                                    className={adminStyles.btnSm}
                                    style={{ background: "#f1f5f9", color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem" }}
                                    onClick={() => setViewReasons(r.reasons || [])}
                                >
                                    <List size={13} /> Xem lý do ({r.reasons?.length || 0})
                                </button>
                            </td>
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
                                                    try { await onResolve(r.job_id, "dismissed", "no_action"); }
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

            {viewReasons && (
                <div className={adminStyles.modalOverlay} onClick={() => setViewReasons(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className={adminStyles.modalCard} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", width: "450px", maxWidth: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1rem", color: "#1e293b", fontWeight: 600 }}>Danh sách lý do báo cáo</h3>
                            <button onClick={() => setViewReasons(null)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.2rem" }}>
                                <XSquare size={18} color="#64748b" />
                            </button>
                        </div>
                        <div style={{ overflowY: "auto", flex: 1, paddingRight: "0.5rem" }}>
                            {viewReasons.length > 0 ? (
                                <ul style={{ paddingLeft: "1.2rem", margin: 0, color: "#334155", fontSize: "0.95rem" }}>
                                    {viewReasons.map((reason, idx) => (
                                        <li key={idx} style={{ marginBottom: "0.75rem", lineHeight: 1.4 }}>{reason}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: "#64748b", margin: 0 }}>Không có lý do nào được cung cấp.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

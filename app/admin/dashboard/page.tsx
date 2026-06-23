"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import cx from "classnames";
import {
    Users, Building2, Briefcase, FileText,
    Activity, AlertTriangle, Flag, Clock,
    ChevronRight,
} from "lucide-react";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────
interface DashboardStats {
    total_users: number;
    total_companies: number;
    total_jobs: number;
    total_applications: number;
    active_users_today: number;
    pending_companies: number;
    flagged_jobs: number;
    pending_reports: number;
    // Charts data (baked into stats response or fetched separately)
    role_distribution?: { candidate: number; hr_manager: number };
    application_by_status?: Record<string, number>;
}

interface TopAiUser {
    user_id: number;
    email: string;
    role: string;
    tokens_used: number;
}

// ─── Simple bar renderer (no external lib needed) ────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div style={{ marginBottom: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#475569", marginBottom: "0.25rem" }}>
                <span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span>
            </div>
            <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.5s" }} />
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────
export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartDays, setChartDays] = useState<7 | 30 | 90>(7);
    const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
    const [topAiUsers, setTopAiUsers] = useState<TopAiUser[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get("/admin/dashboard/stats");
                if (res.data?.success) setStats(res.data.data);
            } catch {
                toast.error("Không thể tải dữ liệu dashboard.");
            } finally {
                setLoading(false);
            }
        };
        const loadTopUsers = async () => {
            try {
                const res = await apiClient.get("/admin/dashboard/ai-quotas/top-users?limit=5");
                if (res.data?.success) setTopAiUsers(res.data.data);
            } catch { /* silent */ }
        };
        load();
        loadTopUsers();
    }, []);

    useEffect(() => {
        const loadChart = async () => {
            try {
                const res = await apiClient.get(`/admin/dashboard/charts?days=${chartDays}`);
                if (res.data?.success) setChartData(res.data.data?.new_users_by_day ?? []);
            } catch { /* silent */ }
        };
        loadChart();
    }, [chartDays]);

    if (loading) return <div style={{ padding: "2rem", color: "#64748b" }}>Đang tải dashboard...</div>;

    // Chart: compute max for scaling
    const chartMax = Math.max(...chartData.map((d) => d.count), 1);
    const appStatus = stats?.application_by_status ?? {};
    const appMax = Math.max(...Object.values(appStatus), 1);
    const roleTotal = (stats?.role_distribution?.candidate ?? 0) + (stats?.role_distribution?.hr_manager ?? 0);

    return (
        <div>
            <Toaster />

            {/* ── Row 1: Primary stats ── */}
            <div className={styles.statsGrid}>
                {[
                    { label: "Tổng Users", value: stats?.total_users, icon: Users, color: "blue" },
                    { label: "Tổng Công ty", value: stats?.total_companies, icon: Building2, color: "purple" },
                    { label: "Tổng Job postings", value: stats?.total_jobs, icon: Briefcase, color: "green" },
                    { label: "Tổng Đơn ứng tuyển", value: stats?.total_applications, icon: FileText, color: "amber" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={styles.statCard}>
                        <div className={cx(styles.statIcon, styles[color])}><Icon size={20} /></div>
                        <div className={styles.statBody}>
                            <span className={styles.statLabel}>{label}</span>
                            <span className={styles.statValue}>{value ?? "—"}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Row 2: Operational stats ── */}
            <div className={cx(styles.statsGrid, styles.spacer)} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {[
                    { label: "Users hoạt động hôm nay", value: stats?.active_users_today, icon: Activity, color: "green" },
                    { label: "Công ty chờ duyệt", value: stats?.pending_companies, icon: Clock, color: "amber" },
                    { label: "Job bị flag bởi AI", value: stats?.flagged_jobs, icon: Flag, color: "red" },
                    { label: "Báo cáo chờ xử lý", value: stats?.pending_reports, icon: AlertTriangle, color: "red" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={styles.statCard}>
                        <div className={cx(styles.statIcon, styles[color])}><Icon size={20} /></div>
                        <div className={styles.statBody}>
                            <span className={styles.statLabel}>{label}</span>
                            <span className={styles.statValue}>{value ?? "—"}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Row 3: Charts + Quick Actions ── */}
            <div className={cx(styles.twoCol, styles.spacer)}>

                {/* Left: User growth chart */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Người dùng mới theo ngày</h3>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                            {([7, 30, 90] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setChartDays(d)}
                                    className={cx(styles.btnSm, chartDays === d ? styles.red : styles.gray)}
                                >
                                    {d}N
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sparkline chart using SVG */}
                    {chartData.length > 0 ? (
                        <div style={{ padding: "1rem 1.25rem" }}>
                            <svg viewBox={`0 0 ${chartData.length * 24} 80`} style={{ width: "100%", height: "80px" }}>
                                <polyline
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    points={chartData.map((d, i) => `${i * 24 + 12},${80 - (d.count / chartMax) * 70}`).join(" ")}
                                />
                                {chartData.map((d, i) => (
                                    <circle key={i} cx={i * 24 + 12} cy={80 - (d.count / chartMax) * 70} r="3" fill="#ef4444" />
                                ))}
                            </svg>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                                {chartData.filter((_, i) => i === 0 || i === Math.floor(chartData.length / 2) || i === chartData.length - 1).map((d) => (
                                    <span key={d.date}>{new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.chartPlaceholder}>Chưa có dữ liệu biểu đồ</div>
                    )}

                    {/* Bar: Application by status */}
                    <div style={{ padding: "0.75rem 1.25rem 1rem", borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>Đơn ứng tuyển theo trạng thái</div>
                        {Object.entries(appStatus).map(([key, val]) => (
                            <MiniBar key={key} label={key} value={val} max={appMax} color={key === "hired" ? "#16a34a" : key === "rejected" ? "#dc2626" : "#3b82f6"} />
                        ))}
                    </div>
                </div>

                {/* Right col: Role donut + Quick actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {/* Role distribution
                <div className={styles.card}>
                    <div className={styles.cardHeader}><h3>Phân bổ Role người dùng</h3></div>
                    <div style={{ padding: "1rem 1.25rem" }}>
                    {roleTotal > 0 ? (
                        <>
                        <MiniBar label="Ứng viên" value={stats?.role_distribution?.candidate ?? 0} max={roleTotal} color="#3b82f6" />
                        <MiniBar label="HR Manager" value={stats?.role_distribution?.hr_manager ?? 0} max={roleTotal} color="#7c3aed" />
                        </>
                    ) : (
                        <div className={styles.emptyState}>Chưa có dữ liệu</div>
                    )}
                    </div>
                </div> */}

                    {/* Quick actions */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}><h3>Hành động nhanh</h3></div>
                        <div className={styles.quickActions}>
                            <Link href="/admin/companies?status=pending" className={styles.quickActionItem}>
                                <div className={styles.quickActionLeft}>
                                    <div className={cx(styles.qaIcon, styles.amber)}><Clock size={16} /></div>
                                    <div>
                                        <div className={styles.qaText}>Duyệt công ty đang chờ</div>
                                        <div className={styles.qaSubtext}>Xem danh sách chờ xác minh</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {stats?.pending_companies !== undefined && stats.pending_companies > 0 && (
                                        <span className={styles.qaBadge}>{stats.pending_companies}</span>
                                    )}
                                    <ChevronRight size={16} color="#94a3b8" />
                                </div>
                            </Link>

                            <Link href="/admin/jobs" className={styles.quickActionItem}>
                                <div className={styles.quickActionLeft}>
                                    <div className={cx(styles.qaIcon, styles.red)}><Flag size={16} /></div>
                                    <div>
                                        <div className={styles.qaText}>Xử lý báo cáo Job</div>
                                        <div className={styles.qaSubtext}>Job bị flag bởi AI hoặc người dùng</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {stats?.flagged_jobs !== undefined && stats.flagged_jobs > 0 && (
                                        <span className={styles.qaBadge}>{stats.flagged_jobs}</span>
                                    )}
                                    <ChevronRight size={16} color="#94a3b8" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Top AI Users */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}><h3>Top Sử dụng AI Hôm Nay</h3></div>
                        <div style={{ padding: "0" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc", textAlign: "left", fontSize: "0.8rem", color: "#64748b" }}>
                                        <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Email</th>
                                        <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Vai trò</th>
                                        <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right" }}>Token dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topAiUsers.length > 0 ? topAiUsers.map((u, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }} title={u.email}>
                                                {u.email}
                                            </td>
                                            <td style={{ padding: "0.75rem 1rem" }}>
                                                <span style={{
                                                    fontSize: "0.7rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px",
                                                    backgroundColor: u.role === "candidate" ? "#f3e8ff" : "#e0f2fe",
                                                    color: u.role === "candidate" ? "#9333ea" : "#0284c7"
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600, textAlign: "right", color: "#334155" }}>
                                                {u.tokens_used.toLocaleString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
                                                Chưa có dữ liệu hôm nay.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import cx from "classnames";
import { Activity, Zap, Clock, AlertCircle } from "lucide-react";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";

interface AiStats {
  total_calls_today: number;
  total_tokens_today: number;
  avg_latency_ms: number;
  error_rate_pct: number;
}

interface AiLog {
  id: number;
  service_type: string;
  tokens_used: number;
  processing_time_ms: number;
  is_error: boolean;
  created_at: string;
  application_id?: number;
}

interface AlertConfig {
  id: number;
  name: string;
  service_type: string;
  threshold: number;
  metric: string;
  is_active: boolean;
}

type Tab = "logs" | "alerts";
type ServiceType = "" | "matching" | "chatbot" | "jd_moderation";

export default function AdminAiMonitoringPage() {
  const [tab, setTab] = useState<Tab>("logs");
  const [stats, setStats] = useState<AiStats | null>(null);
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Filters
  const [serviceType, setServiceType] = useState<ServiceType>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isError, setIsError] = useState<"" | "true" | "false">("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiClient.get("/admin/ai-monitoring/stats");
        if (res.data?.success) setStats(res.data.data);
      } catch { /* silent */ }
    };
    loadStats();
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (serviceType) params.service_type = serviceType;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (isError) params.is_error = isError;
      const res = await apiClient.get("/admin/ai-logs", { params });
      if (res.data?.success) setLogs(res.data.data ?? []);
    } catch { toast.error("Không thể tải AI logs."); }
    finally { setLoading(false); }
  }, [page, serviceType, dateFrom, dateTo, isError]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/ai-alert-configs");
      if (res.data?.success) setAlerts(res.data.data ?? []);
    } catch { toast.error("Không thể tải cấu hình cảnh báo."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "logs") fetchLogs();
    else fetchAlerts();
  }, [tab, fetchLogs, fetchAlerts]);

  const toggleAlert = async (configId: number, isActive: boolean) => {
    try {
      await apiClient.put(`/admin/ai-alert-configs/${configId}`, { is_active: !isActive });
      setAlerts(prev => prev.map(a => a.id === configId ? { ...a, is_active: !isActive } : a));
    } catch { toast.error("Cập nhật cấu hình thất bại."); }
  };

  const SERVICE_LABELS: Record<string, string> = {
    matching: "AI Matching", chatbot: "Chatbot", jd_moderation: "JD Moderation",
  };

  return (
    <div>
      <Toaster />

      {/* Stats row */}
      <div className={cx(styles.statsGrid, styles.spacer)}>
        {[
          { label: "Tổng calls hôm nay", value: stats?.total_calls_today, icon: Activity, color: "blue" },
          { label: "Tổng tokens hôm nay", value: stats?.total_tokens_today?.toLocaleString(), icon: Zap, color: "purple" },
          { label: "Avg latency (ms)", value: stats?.avg_latency_ms != null ? `${Math.round(stats.avg_latency_ms)}ms` : "—", icon: Clock, color: "amber" },
          { label: "Error rate", value: stats?.error_rate_pct != null ? `${stats.error_rate_pct.toFixed(1)}%` : "—", icon: AlertCircle, color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={styles.statCard}>
            <div className={cx(styles.statIcon, styles[color])}><Icon size={20} /></div>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>{label}</span>
              <span className={styles.statValue} style={{ fontSize: "1.35rem" }}>{value ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={cx(styles.tabBtn, { [styles.activeTab]: tab === "logs" })} onClick={() => setTab("logs")}>
            AI Logs
          </button>
          <button className={cx(styles.tabBtn, { [styles.activeTab]: tab === "alerts" })} onClick={() => setTab("alerts")}>
            Cấu hình cảnh báo
          </button>
        </div>

        {/* ── Logs tab ── */}
        {tab === "logs" && (
          <>
            <div className={styles.filterBar}>
              <label>Dịch vụ:</label>
              <select value={serviceType} onChange={e => { setServiceType(e.target.value as ServiceType); setPage(1); }}>
                <option value="">Tất cả</option>
                <option value="matching">AI Matching</option>
                <option value="chatbot">Chatbot</option>
                <option value="jd_moderation">JD Moderation</option>
              </select>

              <label>Từ:</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <label>Đến:</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />

              <label>Lỗi:</label>
              <select value={isError} onChange={e => { setIsError(e.target.value as "" | "true" | "false"); setPage(1); }}>
                <option value="">Tất cả</option>
                <option value="true">Có lỗi</option>
                <option value="false">Thành công</option>
              </select>

              <button className={cx(styles.btnSm, styles.blue)} onClick={() => { setPage(1); fetchLogs(); }}>
                Tìm
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Dịch vụ</th>
                    <th>Tokens</th>
                    <th>Latency (ms)</th>
                    <th>Trạng thái</th>
                    <th>Application ID</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6}><div className={styles.emptyState}>Đang tải...</div></td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={6}><div className={styles.emptyState}>Không có log nào.</div></td></tr>
                  ) : logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(log.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td>
                        <span className={cx(styles.badge, styles.info)}>
                          {SERVICE_LABELS[log.service_type] ?? log.service_type}
                        </span>
                      </td>
                      <td>{log.tokens_used?.toLocaleString() ?? "—"}</td>
                      <td>{log.processing_time_ms}</td>
                      <td>
                        <span className={cx(styles.badge, log.is_error ? styles.error : styles.success)}>
                          {log.is_error ? "Lỗi" : "OK"}
                        </span>
                      </td>
                      <td style={{ color: "#64748b" }}>{log.application_id ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Alerts tab ── */}
        {tab === "alerts" && (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Tên cảnh báo</th>
                  <th>Dịch vụ</th>
                  <th>Metric</th>
                  <th>Ngưỡng</th>
                  <th style={{ textAlign: "center" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}><div className={styles.emptyState}>Đang tải...</div></td></tr>
                ) : alerts.length === 0 ? (
                  <tr><td colSpan={5}><div className={styles.emptyState}>Chưa có cấu hình cảnh báo.</div></td></tr>
                ) : alerts.map((cfg) => (
                  <tr key={cfg.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{cfg.name}</td>
                    <td><span className={cx(styles.badge, styles.info)}>{SERVICE_LABELS[cfg.service_type] ?? cfg.service_type}</span></td>
                    <td style={{ color: "#64748b" }}>{cfg.metric}</td>
                    <td>{cfg.threshold}</td>
                    <td style={{ textAlign: "center" }}>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={cfg.is_active}
                          onChange={() => toggleAlert(cfg.id, cfg.is_active)}
                        />
                        <span className={styles.slider} />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "logs" && (
          <div className={styles.pagination}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
            <span style={{ fontSize: "0.8rem", color: "#64748b", padding: "0 0.5rem" }}>Trang {page}</span>
            <button disabled={logs.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Tiếp →</button>
          </div>
        )}
      </div>
    </div>
  );
}

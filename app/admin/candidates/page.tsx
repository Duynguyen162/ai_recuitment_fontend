"use client";

import React, { useEffect, useState, useCallback } from "react";
import cx from "classnames";
import {
  User, Mail, Phone, FileText, Eye, X,
  Lock, LockOpen, ExternalLink, Briefcase, Flag,
} from "lucide-react";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";

/* ─── Types ─── */
// status từ backend: "active" | "banned"
type CandidateStatus = "active" | "banned";

interface Candidate {
  id: number;
  full_name: string | null;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  years_of_experience?: number | null;
  total_applications: number;
  status: CandidateStatus;
  created_at: string;
}

interface CandidateDetail {
  id: number;
  email: string;
  status: CandidateStatus;
  created_at: string;
  full_name: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  skill_tags?: string[] | null;
  years_of_experience?: number | null;
  total_applications: number;
  total_reports_filed: number;
}

const PAGE_SIZE = 20;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}

/* ─── Candidate Detail Popup ─── */
function CandidateDetailPopup({
  candidate,
  onClose,
  onLockToggle,
}: {
  candidate: CandidateDetail;
  onClose: () => void;
  onLockToggle: (id: number, lock: boolean) => Promise<void>;
}) {
  const [locking, setLocking] = useState(false);
  const isBanned = candidate.status === "banned";

  const handleLock = async () => {
    setLocking(true);
    try {
      await onLockToggle(candidate.id, !isBanned);
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        style={{ width: "min(540px, 96vw)", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Thông tin ứng viên</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.25rem" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: isBanned ? "#fee2e2" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {candidate.avatar_url
                ? <img src={candidate.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={24} color={isBanned ? "#dc2626" : "#1d4ed8"} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                {candidate.full_name ?? "(Chưa cập nhật)"}
              </div>
              <span className={cx(styles.badge, isBanned ? styles.rejected : styles.approved)}>
                {isBanned ? "Đã bị khóa" : "Đang hoạt động"}
              </span>
            </div>
          </div>

          <Row icon={<Mail size={14} />} label="Email" value={candidate.email} />
          <Row icon={<Phone size={14} />} label="SĐT" value={candidate.phone ?? "—"} />
          <Row icon={<Briefcase size={14} />} label="Kinh nghiệm" value={candidate.years_of_experience != null ? `${candidate.years_of_experience} năm` : "—"} />
          <Row icon={<FileText size={14} />} label="Đơn ứng tuyển" value={`${candidate.total_applications} đơn`} />
          <Row icon={<Flag size={14} />} label="Số lần báo cáo đã gửi" value={`${candidate.total_reports_filed} lần`} />
          <Row label="Ngày tham gia" value={formatDate(candidate.created_at)} />

          {candidate.bio && (
            <div style={{ fontSize: "0.82rem", color: "#475569", background: "#f8fafc", borderRadius: "0.5rem", padding: "0.6rem 0.75rem", lineHeight: 1.6 }}>
              {candidate.bio}
            </div>
          )}

          {candidate.skill_tags && candidate.skill_tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {candidate.skill_tags.map((s) => (
                <span key={s} style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: "0.15rem 0.55rem", fontSize: "0.7rem", fontWeight: 700, border: "1px solid #dbeafe" }}>{s}</span>
              ))}
            </div>
          )}

          {/* External links */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {candidate.portfolio_url && (
              <a href={candidate.portfolio_url} target="_blank" rel="noreferrer" className={cx(styles.btnSm, styles.blue)} style={{ display: "inline-flex" }}>
                <ExternalLink size={12} /> Portfolio
              </a>
            )}
            {candidate.linkedin_url && (
              <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className={cx(styles.btnSm, styles.blue)} style={{ display: "inline-flex" }}>
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
            {candidate.github_url && (
              <a href={candidate.github_url} target="_blank" rel="noreferrer" className={cx(styles.btnSm, styles.gray)} style={{ display: "inline-flex" }}>
                <ExternalLink size={12} /> GitHub
              </a>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "0.875rem 1.25rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end", background: "#f8fafc" }}>
          <button className={cx(styles.btnSm, styles.gray)} onClick={onClose}>Đóng</button>
          {/* PUT /admin/candidates/{id}/lock — lock: true/false */}
          <button
            className={cx(styles.btnSm, isBanned ? styles.green : styles.red)}
            onClick={handleLock}
            disabled={locking}
          >
            {isBanned
              ? <><LockOpen size={13} /> {locking ? "Đang mở..." : "Mở khóa tài khoản"}</>
              : <><Lock size={13} /> {locking ? "Đang khóa..." : "Khóa tài khoản"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem" }}>
      {icon && <span style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }}>{icon}</span>}
      <span style={{ color: "#64748b", minWidth: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 500, wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "banned">("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      // GET /admin/candidates?keyword=&status=active|banned&page=&page_size=
      const res = await apiClient.get("/admin/candidates", {
        params: {
          page,
          page_size: PAGE_SIZE,
          keyword: keyword || undefined,
          status: statusFilter || undefined,
        },
      });
      if (res.data?.success) setCandidates(res.data.data ?? []);
    } catch {
      toast.error("Không thể tải danh sách ứng viên.");
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const viewDetail = async (id: number) => {
    setSelectedCandidateId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      // GET /admin/candidates/{id}
      const res = await apiClient.get(`/admin/candidates/${id}`);
      if (res.data?.success) setDetail(res.data.data);
    } catch {
      toast.error("Không thể tải thông tin ứng viên.");
      setSelectedCandidateId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // PUT /admin/candidates/{id}/lock  body: { lock: boolean }
  const handleLockToggle = async (id: number, lock: boolean) => {
    await apiClient.put(`/admin/candidates/${id}/lock`, { lock });
    toast.success(lock ? "Đã khóa tài khoản ứng viên." : "Đã mở khóa tài khoản.");
    // Cập nhật local list + detail
    const newStatus: CandidateStatus = lock ? "banned" : "active";
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    setDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleStatusFilter = (s: "" | "active" | "banned") => {
    setStatusFilter(s);
    setPage(1);
  };

  return (
    <div>
      <Toaster />

      <div className={styles.card}>
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <h3>Quản lý ứng viên</h3>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              style={{ padding: "0.4rem 0.75rem",color: "black", border: "1px solid #e2e8f0", borderRadius: "0.4rem", fontSize: "0.85rem", outline: "none", minWidth: 200 }}
            />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as "" | "active" | "banned")}
              style={{ padding: "0.4rem 0.6rem",border: "1px solid #e2e8f0", borderRadius: "0.4rem", fontSize: "0.85rem", outline: "none", color: "#334155", background: "#f8fafc" }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Đã bị khóa</option>
            </select>
            <button type="submit" className={cx(styles.btnSm, styles.blue)} style={{ padding: "0.4rem 0.9rem" }}>
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th style={{ textAlign: "center" }}>Đơn ứng tuyển</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className={styles.emptyState}>Đang tải...</div></td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={8}><div className={styles.emptyState}>Không tìm thấy ứng viên nào.</div></td></tr>
              ) : candidates.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.status === "banned" ? "#fee2e2" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {c.avatar_url
                          ? <img src={c.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <User size={13} color={c.status === "banned" ? "#dc2626" : "#1d4ed8"} />}
                      </div>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{c.full_name ?? "(Chưa cập nhật)"}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#475569" }}>{c.email}</td>
                  <td style={{ fontSize: "0.82rem", color: "#64748b" }}>{c.phone ?? "—"}</td>
                  <td style={{ textAlign: "center", fontWeight: 600, color: "#0f172a" }}>{c.total_applications}</td>
                  <td style={{ fontSize: "0.78rem", color: "#94a3b8", whiteSpace: "nowrap" }}>{formatDate(c.created_at)}</td>
                  <td>
                    <span className={cx(styles.badge, c.status === "active" ? styles.approved : styles.rejected)}>
                      {c.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionGroup} style={{ justifyContent: "flex-end" }}>
                      <button className={cx(styles.btnSm, styles.blue)} onClick={() => viewDetail(c.id)}>
                        <Eye size={13} /> Xem
                      </button>
                      {/* Nút nhanh khóa/mở khóa trực tiếp từ bảng */}
                      <button
                        className={cx(styles.btnSm, c.status === "banned" ? styles.green : styles.red)}
                        onClick={async () => {
                          try {
                            await handleLockToggle(c.id, c.status !== "banned");
                          } catch {
                            toast.error("Thao tác thất bại.");
                          }
                        }}
                      >
                        {c.status === "banned"
                          ? <><LockOpen size={13} /> Mở khóa</>
                          : <><Lock size={13} /> Khóa</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
          <span style={{ fontSize: "0.8rem", color: "#64748b", padding: "0 0.5rem" }}>Trang {page}</span>
          <button disabled={candidates.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>Tiếp →</button>
        </div>
      </div>

      {/* Candidate Detail Popup */}
      {selectedCandidateId !== null && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedCandidateId(null); setDetail(null); }}>
          <div onClick={(e) => e.stopPropagation()}>
            {detailLoading || !detail ? (
              <div style={{ background: "#fff", borderRadius: "1rem", padding: "2rem 3rem", color: "#64748b", fontSize: "0.875rem" }}>
                Đang tải...
              </div>
            ) : (
              <CandidateDetailPopup
                candidate={detail}
                onClose={() => { setSelectedCandidateId(null); setDetail(null); }}
                onLockToggle={handleLockToggle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

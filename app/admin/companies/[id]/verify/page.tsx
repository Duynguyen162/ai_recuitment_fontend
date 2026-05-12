"use client";

import React, { useEffect, useState } from "react";
import cx from "classnames";
import { CheckCircle, XCircle, Lock, FileText, Globe } from "lucide-react";
import styles from "../../../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

interface CompanyDetail {
    id: number;
    name: string;
    logo_url?: string;
    website?: string;
    description?: string;
    size?: string;
    verification_status: string;
    verifications?: VerificationRecord[];
    documents?: CompanyDocument[];
}

interface VerificationRecord {
    id: number;
    status: string;
    submitted_at: string;
    license_url?: string;
    reviewer_note?: string;
}

interface CompanyDocument {
    id: number;
    file_name: string;
    file_url: string;
    uploaded_at: string;
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ duyệt", approved: "Đã duyệt",
    rejected: "Từ chối", locked: "Bị khóa",
};

export default function AdminCompanyVerifyPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"reject" | "lock" | null>(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get(`/admin/companies/${id}`);
                if (res.data?.success) setCompany(res.data.data);
            } catch { toast.error("Không thể tải thông tin công ty."); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const verify = async (status: "approved" | "rejected" | "locked", rejectionReason?: string) => {
        try {
            await apiClient.put(`/admin/companies/${id}/verify`, { status, reason: rejectionReason });
            toast.success("Đã cập nhật trạng thái.");
            setModal(null);
            router.push("/admin/companies");
        } catch { toast.error("Thao tác thất bại."); }
    };

    if (loading) return <div style={{ padding: "2rem", color: "#64748b" }}>Đang tải...</div>;
    if (!company) return <div style={{ padding: "2rem", color: "#ef4444" }}>Không tìm thấy công ty.</div>;

    const latestVerification = company.verifications?.[0];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Toaster />

            {/* ── Company info ── */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Thông tin công ty</h3>
                    <span className={cx(styles.badge, styles[company.verification_status ?? "gray"])}>
                        {STATUS_LABELS[company.verification_status] ?? company.verification_status}
                    </span>
                </div>
                <div style={{ padding: "1.25rem", display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div className={styles.companyLogoMini} style={{ width: 64, height: 64, fontSize: "1.5rem", borderRadius: "0.75rem" }}>
                        {company.logo_url ? <img src={company.logo_url} alt={company.name} /> : company.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>{company.name}</div>
                        {company.website && (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#2563eb", fontSize: "0.875rem" }}>
                                <Globe size={14} /> {company.website}
                            </a>
                        )}
                        {company.size && <div style={{ marginTop: "0.4rem", fontSize: "0.85rem", color: "#64748b" }}>Quy mô: {company.size}</div>}
                        {company.description && (
                            <p style={{ marginTop: "0.75rem", color: "#334155", fontSize: "0.875rem", lineHeight: 1.6 }}>{company.description}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.twoCol}>
                {/* ── Left: Verification history + License ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {/* Verification history */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}><h3>Lịch sử xác minh</h3></div>
                        <div style={{ padding: "1rem 1.25rem" }}>
                            {company.verifications && company.verifications.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {company.verifications.map((v, i) => (
                                        <div key={v.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                            <div style={{
                                                width: 10, height: 10, borderRadius: "50%", marginTop: "0.3rem", flexShrink: 0,
                                                background: v.status === "approved" ? "#16a34a" : v.status === "rejected" ? "#dc2626" : "#d97706"
                                            }} />
                                            <div>
                                                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>
                                                    {STATUS_LABELS[v.status] ?? v.status}
                                                    <span style={{ fontWeight: 400, color: "#64748b", marginLeft: "0.5rem" }}>
                                                        {new Date(v.submitted_at).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </div>
                                                {v.reviewer_note && <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem" }}>{v.reviewer_note}</div>}
                                                {v.license_url && (
                                                    <a href={v.license_url} target="_blank" rel="noopener noreferrer"
                                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "#2563eb", marginTop: "0.3rem" }}>
                                                        <FileText size={13} /> Xem giấy phép kinh doanh
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>Chưa có lịch sử xác minh.</div>
                            )}
                        </div>
                    </div>

                    {/* Latest license PDF viewer */}
                    {latestVerification?.license_url && (
                        <div className={styles.card}>
                            <div className={styles.cardHeader}><h3>Giấy phép kinh doanh</h3></div>
                            <div style={{ padding: "1rem" }}>
                                <iframe
                                    src={latestVerification.license_url}
                                    style={{ width: "100%", height: "420px", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                                    title="Giấy phép kinh doanh"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: Documents + Action panel ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {/* Documents list */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}><h3>Tài liệu công ty</h3></div>
                        <div style={{ padding: "0.5rem 0" }}>
                            {company.documents && company.documents.length > 0 ? (
                                company.documents.map((doc) => (
                                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", textDecoration: "none", borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <div className={cx(styles.statIcon, styles.blue)} style={{ width: 32, height: 32 }}>
                                            <FileText size={15} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{doc.file_name}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(doc.uploaded_at).toLocaleDateString("vi-VN")}</div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className={styles.emptyState}>Chưa có tài liệu nào.</div>
                            )}
                        </div>
                    </div>

                    {/* Action panel */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}><h3>Hành động xét duyệt</h3></div>
                        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <button
                                onClick={() => verify("approved")}
                                style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.85rem 1rem", background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: "0.6rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.15s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#bbf7d0")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#dcfce7")}
                            >
                                <CheckCircle size={18} /> Duyệt công ty
                            </button>

                            <button
                                onClick={() => setModal("reject")}
                                style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.85rem 1rem", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "0.6rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.15s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#fecaca")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#fee2e2")}
                            >
                                <XCircle size={18} /> Từ chối (nhập lý do)
                            </button>

                            <button
                                onClick={() => setModal("lock")}
                                style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.85rem 1rem", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "0.6rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.15s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#e2e8f0")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#f1f5f9")}
                            >
                                <Lock size={18} /> Khóa tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h3>{modal === "reject" ? "Từ chối xác minh" : "Khóa tài khoản"}</h3>
                        <p>
                            {modal === "reject"
                                ? `Nhập lý do từ chối cho "${company.name}". Email thông báo sẽ được gửi tới HR Manager.`
                                : `Xác nhận khóa tài khoản của "${company.name}". Tất cả HR của công ty sẽ không thể đăng nhập.`}
                        </p>
                        <textarea
                            placeholder="Nhập lý do... (tùy chọn)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className={styles.modalActions}>
                            <button className={cx(styles.btnSm, styles.gray)} onClick={() => { setModal(null); setReason(""); }}>Hủy</button>
                            <button
                                className={cx(styles.btnSm, modal === "reject" ? styles.red : styles.gray)}
                                onClick={() => verify(modal === "reject" ? "rejected" : "locked", reason || undefined)}
                            >
                                {modal === "reject" ? "Xác nhận từ chối" : "Xác nhận khóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

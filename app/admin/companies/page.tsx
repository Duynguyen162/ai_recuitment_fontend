"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import cx from "classnames";
import { Eye, CheckCircle, XCircle, Lock } from "lucide-react";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

type VerifyStatus = "all" | "pending" | "approved" | "rejected" | "locked";

interface Company {
    id: number;
    name: string;
    logo_url?: string;
    verification_status: VerifyStatus;
    created_at: string;
    hr_members_count?: number;
    website?: string;
}

const TABS: { key: VerifyStatus; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Từ chối" },
    { key: "locked", label: "Bị khóa" },
];

const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ duyệt", approved: "Đã duyệt",
    rejected: "Từ chối", locked: "Bị khóa",
};

export default function AdminCompaniesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = (searchParams.get("status") ?? "all") as VerifyStatus;

    const [activeTab, setActiveTab] = useState<VerifyStatus>(initialTab);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 15;

    const [modal, setModal] = useState<{ type: "reject" | "lock"; company: Company } | null>(null);
    const [reason, setReason] = useState("");

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
            if (activeTab !== "all") params.status = activeTab;
            const res = await apiClient.get("/admin/companies", { params });
            if (res.data?.success) setCompanies(res.data.data ?? []);
        } catch {
            toast.error("Không thể tải danh sách công ty.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

    const handleTabChange = (tab: VerifyStatus) => {
        setActiveTab(tab);
        setPage(1);
        router.replace(`/admin/companies${tab !== "all" ? `?status=${tab}` : ""}`);
    };

    const verify = async (id: number, status: "approved" | "rejected" | "locked", rejectionReason?: string) => {
        try {
            if (status === "locked") {
                await apiClient.put(`/admin/companies/${id}/lock`, { status, reason: rejectionReason });
            } else {
                const detailRes = await apiClient.get(`/admin/companies/${id}`);
                const history = detailRes.data?.data?.verification_history;
                const latestVerification = history?.[0];
                if (!latestVerification?.id) {
                    toast.error("Không tìm thấy bản ghi xác minh để cập nhật.");
                    return;
                }
                await apiClient.put(`/admin/verifications/${latestVerification.id}/verify`, { status, reason: rejectionReason });
            }
            toast.success("Đã cập nhật trạng thái công ty.");
            setModal(null);
            setReason("");
            fetchCompanies();
        } catch {
            toast.error("Cập nhật thất bại.");
        }
    };

    const unlock = async (id: number) => {
        try {
            await apiClient.put(`/admin/companies/${id}/unlock`);
            toast.success("Đã mở khóa công ty.");
            fetchCompanies();
        } catch {
            toast.error("Mở khóa thất bại.");
        }
    };

    return (
        <div>
            <Toaster />

            <div className={styles.card}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            className={cx(styles.tabBtn, { [styles.activeTab]: activeTab === key })}
                            onClick={() => handleTabChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Công ty</th>
                                <th>Trạng thái</th>
                                <th>Ngày đăng ký</th>
                                {/* <th>HR Members</th> */}
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5}><div className={styles.emptyState}>Đang tải...</div></td></tr>
                            ) : companies.length === 0 ? (
                                <tr><td colSpan={5}><div className={styles.emptyState}>Không có dữ liệu.</div></td></tr>
                            ) : (
                                companies.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div className={styles.companyLogoMini}>
                                                    {c.logo_url ? <img src={c.logo_url} alt={c.name} /> : c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                                                    {c.website && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.website}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={cx(styles.badge, styles[c.verification_status])}>
                                                {STATUS_LABELS[c.verification_status] ?? c.verification_status}
                                            </span>
                                        </td>
                                        <td>{new Date(c.created_at).toLocaleDateString("vi-VN")}</td>
                                        {/* <td>{c.hr_members_count ?? "—"}</td> */}
                                        <td>
                                            <div className={styles.actionGroup} style={{ justifyContent: "flex-start", marginLeft: "100px" }}>
                                                <Link href={`/admin/companies/${c.id}/verify`}>
                                                    <button className={cx(styles.btnSm, styles.blue)}><Eye size={13} /> Xem</button>
                                                </Link>
                                                {c.verification_status === "pending" && (
                                                    <button className={cx(styles.btnSm, styles.green)} onClick={() => verify(c.id, "approved")}>
                                                        <CheckCircle size={13} /> Duyệt
                                                    </button>
                                                )}
                                                {c.verification_status !== "rejected" && (
                                                    <button className={cx(styles.btnSm, styles.red)} onClick={() => setModal({ type: "reject", company: c })}>
                                                        <XCircle size={13} /> Từ chối
                                                    </button>
                                                )}
                                                {c.verification_status !== "locked" && (
                                                    <button className={cx(styles.btnSm, styles.gray)} onClick={() => setModal({ type: "lock", company: c })}>
                                                        <Lock size={13} /> Khóa
                                                    </button>
                                                )}
                                                {c.verification_status === "locked" && (
                                                    <button className={cx(styles.btnSm, styles.green)} onClick={() => unlock(c.id)}>
                                                        <CheckCircle size={13} /> Mở khóa
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={styles.pagination}>
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", padding: "0 0.5rem" }}>Trang {page}</span>
                    <button disabled={companies.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Tiếp →</button>
                </div>
            </div>

            {/* Reject / Lock Modal */}
            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h3>{modal.type === "reject" ? "Từ chối công ty" : "Khóa tài khoản"}</h3>
                        <p>
                            {modal.type === "reject"
                                ? `Nhập lý do từ chối xác minh cho "${modal.company.name}". Email sẽ được gửi tới HR.`
                                : `Xác nhận khóa tài khoản của "${modal.company.name}". HR sẽ không thể đăng bài.`}
                        </p>
                        <textarea
                            placeholder="Nhập lý do... (tùy chọn)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{
                                color: "#000",
                            }}
                        />
                        <div className={styles.modalActions}>
                            <button className={cx(styles.btnSm, styles.gray)} onClick={() => { setModal(null); setReason(""); }}>Hủy</button>
                            <button
                                className={cx(styles.btnSm, modal.type === "reject" ? styles.red : styles.gray)}
                                onClick={() => verify(modal.company.id, modal.type === "reject" ? "rejected" : "locked", reason || undefined)}
                            >
                                {modal.type === "reject" ? "Xác nhận từ chối" : "Xác nhận khóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

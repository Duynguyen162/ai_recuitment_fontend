"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, CreditCard, AlertCircle, RotateCw } from "lucide-react";
import cx from "classnames";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";

interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    cycle: "monthly" | "yearly";
    price_vnd: number;
    vip_duration_days: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function AdminSubscriptionPlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    // Form Fields State
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
    const [priceVnd, setPriceVnd] = useState<number | string>("");
    const [vipDurationDays, setVipDurationDays] = useState<number | string>("");
    const [isActive, setIsActive] = useState(true);

    // Client Validation Errors State
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/admin/subscription-plans");
            if (res.data?.success) {
                setPlans(res.data.data ?? []);
            } else {
                setPlans(res.data ?? []); // Fallback in case of raw list response
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách gói VIP:", error);
            toast.error("Không thể tải danh sách gói VIP.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // Mở modal thêm gói mới
    const handleOpenCreateModal = () => {
        setEditingPlan(null);
        setCode("");
        setName("");
        setCycle("monthly");
        setPriceVnd("");
        setVipDurationDays("");
        setIsActive(true);
        setValidationErrors({});
        setShowModal(true);
    };

    // Mở modal sửa gói hiện tại
    const handleOpenEditModal = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setCode(plan.code);
        setName(plan.name);
        setCycle(plan.cycle);
        setPriceVnd(plan.price_vnd);
        setVipDurationDays(plan.vip_duration_days);
        setIsActive(plan.is_active);
        setValidationErrors({});
        setShowModal(true);
    };

    // Toggle nhanh trạng thái is_active từ bảng danh sách
    const handleToggleActive = async (plan: SubscriptionPlan) => {
        const updatedStatus = !plan.is_active;
        try {
            const res = await apiClient.put(`/admin/subscription-plans/${plan.id}`, {
                is_active: updatedStatus,
            });

            if (res.data?.success) {
                toast.success(`Đã ${updatedStatus ? "kích hoạt" : "tạm ẩn"} gói thành công.`);
                // Cập nhật lại state local
                setPlans((prev) =>
                    prev.map((item) => (item.id === plan.id ? { ...item, is_active: updatedStatus } : item))
                );
            } else {
                throw new Error();
            }
        } catch (error: any) {
            console.error("Lỗi toggle active:", error);
            toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại.");
        }
    };

    // Validate form trước khi submit
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!code.trim()) {
            errors.code = "Mã gói không được để trống.";
        } else if (!/^[a-zA-Z0-9_]+$/.test(code)) {
            errors.code = "Mã gói chỉ gồm chữ cái, số và dấu gạch dưới.";
        }

        if (!name.trim()) {
            errors.name = "Tên gói không được để trống.";
        }

        const price = Number(priceVnd);
        if (!priceVnd || isNaN(price) || price <= 0) {
            errors.priceVnd = "Giá tiền phải là số lớn hơn 0.";
        }

        const duration = Number(vipDurationDays);
        if (!vipDurationDays || isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
            errors.vipDurationDays = "Thời gian VIP phải là số nguyên dương ngày.";
        }

        if (cycle !== "monthly" && cycle !== "yearly") {
            errors.cycle = "Chu kỳ chỉ được phép chọn theo tháng hoặc theo năm.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form thêm/sửa gói VIP
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload = {
            code: code.trim(),
            name: name.trim(),
            cycle,
            price_vnd: Number(priceVnd),
            vip_duration_days: Number(vipDurationDays),
            is_active: isActive,
        };

        try {
            if (editingPlan) {
                // Cập nhật gói VIP hiện tại
                const res = await apiClient.put(`/admin/subscription-plans/${editingPlan.id}`, payload);
                if (res.data?.success) {
                    toast.success("Cập nhật gói VIP thành công.");
                    setShowModal(false);
                    fetchPlans();
                } else {
                    throw new Error(res.data?.message || "Cập nhật gói VIP thất bại.");
                }
            } else {
                // Tạo gói VIP mới
                const res = await apiClient.post("/admin/subscription-plans", payload);
                if (res.data?.success) {
                    toast.success("Tạo mới gói VIP thành công.");
                    setShowModal(false);
                    fetchPlans();
                } else {
                    throw new Error(res.data?.message || "Tạo mới gói VIP thất bại.");
                }
            }
        } catch (error: any) {
            console.error("Lỗi gửi thông tin form:", error);
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    return (
        <div>
            <Toaster />

            {/* Header bar */}
            <div className={styles.filterBar} style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CreditCard size={20} style={{ color: "#64748b" }} />
                    <span style={{ fontWeight: 600, color: "#475569" }}>Danh sách các gói dịch vụ VIP trên hệ thống</span>
                </div>
                <div className={styles.actionGroup}>
                    <button className={cx(styles.btnSm, styles.gray)} onClick={fetchPlans} title="Làm mới">
                        <RotateCw size={14} /> Tải lại
                    </button>
                    <button className={cx(styles.btnSm, styles.blue)} onClick={handleOpenCreateModal}>
                        <Plus size={14} /> Thêm gói mới
                    </button>
                </div>
            </div>

            <div className={styles.card} style={{ marginTop: "1rem" }}>
                {/* Table list */}
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã gói (Code)</th>
                                <th>Tên hiển thị</th>
                                {/* <th>Chu kỳ</th> */}
                                <th>Giá dịch vụ (VND)</th>
                                <th>Hạn VIP (Ngày)</th>
                                <th>Trạng thái hoạt động</th>
                                <th style={{ textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className={styles.emptyState}>Đang tải danh sách các gói dịch vụ...</div>
                                    </td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className={styles.emptyState}>Chưa có gói VIP nào được cấu hình trên hệ thống.</div>
                                    </td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan.id}>
                                        <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#0f172a" }}>
                                            {plan.code}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{plan.name}</td>
                                        {/* <td>
                                            <span className={cx(styles.badge, plan.cycle === "yearly" ? styles.info : styles.gray)}>
                                                {plan.cycle === "yearly" ? "Theo năm" : "Theo tháng"}
                                            </span>
                                        </td> */}
                                        <td style={{ fontWeight: 700, color: "#0284c7" }}>
                                            {formatCurrency(plan.price_vnd)}
                                        </td>
                                        <td>{plan.vip_duration_days} ngày</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <label className={styles.toggleSwitch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={plan.is_active}
                                                        onChange={() => handleToggleActive(plan)}
                                                    />
                                                    <span className={styles.slider} />
                                                </label>
                                                <span style={{ fontSize: "0.75rem", color: plan.is_active ? "#16a34a" : "#64748b", fontWeight: 600 }}>
                                                    {plan.is_active ? "Đang bật" : "Tắt/Ẩn"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actionGroup} style={{ justifyContent: "flex-end" }}>
                                                <button
                                                    className={cx(styles.btnSm, styles.gray)}
                                                    onClick={() => handleOpenEditModal(plan)}
                                                >
                                                    <Edit2 size={13} /> Sửa gói
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Plan Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard} style={{ width: "min(550px, 100%)" }}>
                        <h3 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                            {editingPlan ? `Chỉnh sửa gói VIP: ${editingPlan.code}` : "Thêm cấu hình gói VIP mới"}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                            {/* Plan Code */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                                    Mã gói (Code - không trùng lặp) *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: vip_monthly, vip_yearly"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    disabled={!!editingPlan} // Không cho phép đổi code khi đã tạo
                                    style={{
                                        width: "100%",
                                        padding: "0.6rem 0.75rem",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                        background: editingPlan ? "#f1f5f9" : "#fff",
                                        color: editingPlan ? "#64748b" : "#0f172a",
                                    }}
                                />
                                {validationErrors.code && (
                                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <AlertCircle size={12} /> {validationErrors.code}
                                    </p>
                                )}
                            </div>

                            {/* Plan Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                                    Tên hiển thị gói dịch vụ *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Gói VIP Tháng, Gói VIP Năm"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.6rem 0.75rem",
                                        color: "#0f172a",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                    }}
                                />
                                {validationErrors.name && (
                                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <AlertCircle size={12} /> {validationErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Cycle and Duration Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                {/* Cycle */}
                                <div>
                                    <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                                        Chu kỳ *
                                    </label>
                                    <select
                                        value={cycle}
                                        onChange={(e) => setCycle(e.target.value as "monthly" | "yearly")}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem 0.75rem",
                                            color: "#0f172a",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "0.5rem",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                            background: "#fff",
                                        }}
                                    >
                                        <option value="monthly">Theo tháng (monthly)</option>
                                        <option value="yearly">Theo năm (yearly)</option>
                                    </select>
                                    {validationErrors.cycle && (
                                        <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                            {validationErrors.cycle}
                                        </p>
                                    )}
                                </div>

                                {/* Duration Days */}
                                <div>
                                    <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                                        Thời hạn VIP (Ngày) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Ví dụ: 30, 365"
                                        value={vipDurationDays}
                                        onChange={(e) => setVipDurationDays(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem 0.75rem",
                                            color: "#0f172a",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "0.5rem",
                                            fontSize: "0.875rem",
                                            outline: "none",
                                        }}
                                    />
                                    {validationErrors.vipDurationDays && (
                                        <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <AlertCircle size={12} /> {validationErrors.vipDurationDays}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Price VND */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                                    Giá tiền bán ra (VND) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Ví dụ: 499000"
                                    value={priceVnd}
                                    onChange={(e) => setPriceVnd(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.6rem 0.75rem",
                                        color: "#0f172a",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                    }}
                                />
                                {validationErrors.priceVnd && (
                                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <AlertCircle size={12} /> {validationErrors.priceVnd}
                                    </p>
                                )}
                            </div>

                            {/* Active Toggle Switch */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
                                <label className={styles.toggleSwitch}>
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <span className={styles.slider} />
                                </label>
                                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                                    Bật hoạt động ngay (Kích hoạt cho HR nhìn thấy để đăng ký mua)
                                </span>
                            </div>

                            {/* Modal Actions */}
                            <div className={styles.modalActions} style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", marginTop: "0.5rem" }}>
                                <button
                                    type="button"
                                    className={cx(styles.btnSm, styles.gray)}
                                    onClick={() => setShowModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className={cx(styles.btnSm, styles.blue)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

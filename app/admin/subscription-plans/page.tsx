"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, CreditCard, RotateCw } from "lucide-react";
import cx from "classnames";
import styles from "../AdminLayout.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import { SubscriptionPlan } from "./_components/types";
import SubscriptionPlansTable from "./_components/SubscriptionPlansTable";
import SubscriptionPlanModal from "./_components/SubscriptionPlanModal";

export default function AdminSubscriptionPlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/admin/subscription-plans");
            if (res.data?.success) {
                setPlans(res.data.data ?? []);
            } else {
                setPlans(res.data ?? []);
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
        setShowModal(true);
    };

    // Mở modal sửa gói hiện tại
    const handleOpenEditModal = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
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

    // Submit form thêm/sửa gói VIP
    const handleSubmitPlan = async (payload: {
        code: string;
        name: string;
        cycle: "monthly" | "yearly";
        price_vnd: number;
        vip_duration_days: number;
        is_active: boolean;
    }) => {
        setIsSubmitting(true);
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
                    {/* <button className={cx(styles.btnSm, styles.gray)} onClick={fetchPlans} title="Làm mới">
                        <RotateCw size={14} /> Tải lại
                    </button> */}
                    <button className={cx(styles.btnSm, styles.blue)} onClick={handleOpenCreateModal}>
                        <Plus size={14} /> Thêm gói mới
                    </button>
                </div>
            </div>

            {/* Table component */}
            <SubscriptionPlansTable
                plans={plans}
                loading={loading}
                onEdit={handleOpenEditModal}
                onToggleActive={handleToggleActive}
                formatCurrency={formatCurrency}
            />

            {/* Create / Edit Plan Modal component */}
            <SubscriptionPlanModal
                isOpen={showModal}
                editingPlan={editingPlan}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitPlan}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}


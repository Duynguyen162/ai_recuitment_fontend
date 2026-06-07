import React from "react";
import { Edit2 } from "lucide-react";
import cx from "classnames";
import styles from "../../AdminLayout.module.scss";
import { SubscriptionPlan } from "./types";

interface SubscriptionPlansTableProps {
    plans: SubscriptionPlan[];
    loading: boolean;
    onEdit: (plan: SubscriptionPlan) => void;
    onToggleActive: (plan: SubscriptionPlan) => void;
    formatCurrency: (value: number) => string;
}

export default function SubscriptionPlansTable({
    plans,
    loading,
    onEdit,
    onToggleActive,
    formatCurrency,
}: SubscriptionPlansTableProps) {
    return (
        <div className={styles.card} style={{ marginTop: "1rem" }}>
            <div className={styles.tableWrapper}>
                <table>
                    <thead>
                        <tr>
                            <th>Mã gói (Code)</th>
                            <th>Tên hiển thị</th>
                            <th>Giá dịch vụ (VND)</th>
                            <th>Hạn VIP (Ngày)</th>
                            <th>Trạng thái hoạt động</th>
                            <th style={{ textAlign: "right" }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className={styles.emptyState}>Đang tải danh sách các gói dịch vụ...</div>
                                </td>
                            </tr>
                        ) : plans.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
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
                                                    onChange={() => onToggleActive(plan)}
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
                                                onClick={() => onEdit(plan)}
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
    );
}

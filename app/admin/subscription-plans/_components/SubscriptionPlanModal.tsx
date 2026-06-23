import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import cx from "classnames";
import styles from "../../AdminLayout.module.scss";
import { SubscriptionPlan } from "./types";

interface SubscriptionPlanModalProps {
    isOpen: boolean;
    editingPlan: SubscriptionPlan | null;
    onClose: () => void;
    onSubmit: (payload: {
        code: string;
        name: string;
        cycle: "monthly" | "yearly";
        price_vnd: number;
        vip_duration_days: number;
        daily_ai_token_limit: number;
        is_active: boolean;
    }) => Promise<void>;
    isSubmitting: boolean;
}

export default function SubscriptionPlanModal({
    isOpen,
    editingPlan,
    onClose,
    onSubmit,
    isSubmitting,
}: SubscriptionPlanModalProps) {
    // Form Fields State
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
    const [priceVnd, setPriceVnd] = useState<number | string>("");
    const [vipDurationDays, setVipDurationDays] = useState<number | string>(30);
    const [dailyAiTokenLimit, setDailyAiTokenLimit] = useState<number | string>("");
    const [isActive, setIsActive] = useState(true);

    // Client Validation Errors State
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Reset or load data when modal opens / editingPlan changes
    useEffect(() => {
        if (isOpen) {
            if (editingPlan) {
                setCode(editingPlan.code);
                setName(editingPlan.name);
                setCycle(editingPlan.cycle);
                setPriceVnd(editingPlan.price_vnd);
                setVipDurationDays(editingPlan.vip_duration_days);
                setDailyAiTokenLimit(editingPlan.daily_ai_token_limit);
                setIsActive(editingPlan.is_active);
            } else {
                setCode("");
                setName("");
                setCycle("monthly");
                setPriceVnd("");
                setVipDurationDays(30);
                setDailyAiTokenLimit("");
                setIsActive(true);
            }
            setValidationErrors({});
        }
    }, [isOpen, editingPlan]);

    // Automatically fill vipDurationDays when cycle changes (only in Create mode)
    const handleCycleChange = (newCycle: "monthly" | "yearly") => {
        if (editingPlan) return; // Do not allow changing cycle in Edit mode
        setCycle(newCycle);
        setVipDurationDays(newCycle === "monthly" ? 30 : 365);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // In Edit mode, only "name" can be modified, but we can still validate other fields if needed.
        if (!name.trim()) {
            errors.name = "Tên gói không được để trống.";
        }

        if (!editingPlan) {
            if (!code.trim()) {
                errors.code = "Mã gói không được để trống.";
            } else if (!/^[a-zA-Z0-9_]+$/.test(code)) {
                errors.code = "Mã gói chỉ gồm chữ cái, số và dấu gạch dưới.";
            }

            const price = Number(priceVnd);
            if (!priceVnd || isNaN(price) || price <= 0) {
                errors.priceVnd = "Giá tiền phải là số lớn hơn 0.";
            }

            const duration = Number(vipDurationDays);
            if (!vipDurationDays || isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
                errors.vipDurationDays = "Thời gian VIP phải là số nguyên dương ngày.";
            }

            const aiLimit = Number(dailyAiTokenLimit);
            if (dailyAiTokenLimit === "" || isNaN(aiLimit) || aiLimit < 0 || !Number.isInteger(aiLimit)) {
                errors.dailyAiTokenLimit = "Giới hạn AI Token phải là số nguyên >= 0.";
            }

            if (cycle !== "monthly" && cycle !== "yearly") {
                errors.cycle = "Chu kỳ chỉ được phép chọn theo tháng hoặc theo năm.";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        await onSubmit({
            code: code.trim(),
            name: name.trim(),
            cycle,
            price_vnd: Number(priceVnd),
            vip_duration_days: Number(vipDurationDays),
            daily_ai_token_limit: Number(dailyAiTokenLimit),
            is_active: isActive,
        });
    };

    if (!isOpen) return null;

    return (
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
                            disabled={!!editingPlan}
                            style={{
                                width: "100%",
                                padding: "0.6rem 0.75rem",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                outline: "none",
                                background: editingPlan ? "#f1f5f9" : "#fff",
                                color: editingPlan ? "#64748b" : "#0f172a",
                                cursor: editingPlan ? "not-allowed" : "text",
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
                                onChange={(e) => handleCycleChange(e.target.value as "monthly" | "yearly")}
                                disabled={!!editingPlan}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    color: editingPlan ? "#64748b" : "#0f172a",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                    outline: "none",
                                    background: editingPlan ? "#f1f5f9" : "#fff",
                                    cursor: editingPlan ? "not-allowed" : "pointer",
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
                                disabled={true} // Auto-filled and not user editable
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    color: "#64748b",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                    outline: "none",
                                    background: "#f1f5f9",
                                    cursor: "not-allowed",
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
                            disabled={!!editingPlan}
                            style={{
                                width: "100%",
                                padding: "0.6rem 0.75rem",
                                color: editingPlan ? "#64748b" : "#0f172a",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                outline: "none",
                                background: editingPlan ? "#f1f5f9" : "#fff",
                                cursor: editingPlan ? "not-allowed" : "text",
                            }}
                        />
                        {validationErrors.priceVnd && (
                            <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <AlertCircle size={12} /> {validationErrors.priceVnd}
                            </p>
                        )}
                    </div>

                    {/* Daily AI Token Limit */}
                    <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                            Giới hạn AI Token / Ngày *
                        </label>
                        <input
                            type="number"
                            placeholder="Ví dụ: 10000"
                            value={dailyAiTokenLimit}
                            onChange={(e) => setDailyAiTokenLimit(e.target.value)}
                            disabled={!!editingPlan}
                            style={{
                                width: "100%",
                                padding: "0.6rem 0.75rem",
                                color: editingPlan ? "#64748b" : "#0f172a",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                outline: "none",
                                background: editingPlan ? "#f1f5f9" : "#fff",
                                cursor: editingPlan ? "not-allowed" : "text",
                            }}
                        />
                        {validationErrors.dailyAiTokenLimit && (
                            <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <AlertCircle size={12} /> {validationErrors.dailyAiTokenLimit}
                            </p>
                        )}
                    </div>

                    {/* Active Toggle Switch */}
                    {!editingPlan && <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
                        <label className={styles.toggleSwitch} style={{ cursor: editingPlan ? "not-allowed" : "pointer" }}>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                disabled={!!editingPlan}
                            />
                            <span className={styles.slider} style={{ opacity: editingPlan ? 0.6 : 1 }} />
                        </label>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: editingPlan ? "#64748b" : "#334155" }}>
                            Bật hoạt động ngay (Kích hoạt cho HR nhìn thấy để đăng ký mua)
                        </span>
                    </div>
                    }
                    {/* Modal Actions */}
                    <div className={styles.modalActions} style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", marginTop: "0.5rem" }}>
                        <button
                            type="button"
                            className={cx(styles.btnSm, styles.gray)}
                            onClick={onClose}
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
    );
}

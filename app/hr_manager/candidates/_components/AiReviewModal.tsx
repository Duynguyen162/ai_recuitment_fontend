"use client";

import { useEffect, useState } from "react";
import {
    BadgeCheck, CircleAlert, FileText, TriangleAlert, X,
    Loader2, RefreshCw, Sparkles
} from "lucide-react";
import cx from "classnames";

import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";

import { getScoreTone } from "../_lib/helpers";
import { Applicant } from "../_lib/types";
import styles from "../candidates.module.scss";

interface AiReviewModalProps {
    applicant: Applicant | null;
    onClose: () => void;
    onPreviewCv: (applicationId: number) => void;
    onUpdateApplicant?: (id: string, updates: Partial<Applicant>, msg?: string) => void;
    onRequeueSingle?: (applicant: Applicant) => void;
}

export default function AiReviewModal({
    applicant,
    onClose,
    onPreviewCv,
    onUpdateApplicant,
    onRequeueSingle,
}: AiReviewModalProps) {
    const [loading, setLoading] = useState(true);
    const [aiData, setAiData] = useState<any>(null);
    const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

    const fetchAiScore = async () => {
        if (!applicant) return;
        setLoading(true);
        setFetchStatus("loading");
        try {
            const res = await apiClient.get(`/application/hr/${applicant.application_id}/ai_score_status`);
            const data = res.data?.data || res.data;
            setAiData(data);
            setFetchStatus("done");

            // Cập nhật lên bảng danh sách nếu kết quả đã xong
            if (data?.status === "done" && onUpdateApplicant) {
                const scoreVal = data.score !== null ? Math.round(Number(data.score)) : 0;
                onUpdateApplicant(applicant.id, {
                    ai_score: scoreVal,
                    ai_summary: String(data.explanation || ""),
                    ai_strengths: Array.isArray(data.strengths) ? data.strengths : [],
                    ai_risks: Array.isArray(data.weaknesses) ? data.weaknesses : [],
                    recommendation: String(data.explanation || ""),
                    ai_status: "done",
                });
            }
        } catch {
            // Fallback sang dữ liệu sẵn có trong applicant nếu API lỗi
            if (applicant.ai_score > 0) {
                setAiData({
                    status: "done",
                    score: applicant.ai_score,
                    explanation: applicant.ai_summary,
                    strengths: applicant.ai_strengths,
                    weaknesses: applicant.ai_risks,
                });
                setFetchStatus("done");
            } else {
                setFetchStatus("error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Chỉ fetch 1 lần duy nhất khi modal mở
    useEffect(() => {
        if (applicant) {
            fetchAiScore();
        }
    }, [applicant?.application_id]);

    if (!applicant) return null;

    const aiStatus = aiData?.status;
    const score = aiData?.score !== undefined && aiData?.score !== null
        ? Math.round(Number(aiData.score))
        : applicant.ai_score;
    const summary = aiData?.explanation ?? applicant.ai_summary;
    const strengths = aiData?.strengths ?? applicant.ai_strengths;
    const weaknesses = aiData?.weaknesses ?? applicant.ai_risks;
    const errorMsg = aiData?.error_message;

    const isProcessing = !loading && (aiStatus === "not_queued" || aiStatus === "queued" || aiStatus === "processing");
    const isFailed = !loading && aiStatus === "failed";
    const isDead = !loading && aiStatus === "dead";
    const isDone = !loading && (aiStatus === "done" || (!aiStatus && score > 0));

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div style={{ overflow: 'hidden', maxWidth: '680px', borderRadius: '20px' }}>
                <div
                    className={styles.modalCard}
                    onClick={(event) => event.stopPropagation()}
                >
                    {/* Header */}
                    <div className={styles.modalHeader}>
                        <div>
                            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Sparkles size={18} color="#3b82f6" />
                                Nhận xét AI chi tiết
                            </h3>
                            <p>{applicant.candidate_name} • {applicant.email}</p>
                            {applicant.cv_id && (
                                <button
                                    type="button"
                                    className={styles.cvPreviewBtn}
                                    onClick={() => onPreviewCv(applicant.application_id)}
                                >
                                    <FileText size={14} />
                                    {applicant.cv_name ?? "Xem CV đính kèm"}
                                </button>
                            )}
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    {loading && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "4rem 2rem", color: "#64748b" }}>
                            <Loader2 className="animate-spin" size={24} style={{ color: "#3b82f6" }} />
                            <span style={{ fontWeight: 600 }}>Đang tải kết quả phân tích...</span>
                        </div>
                    )}

                    {isProcessing && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", gap: "1rem", textAlign: "center" }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Sparkles size={24} color="#3b82f6" className="animate-pulse" />
                            </div>
                            <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Đang phân tích AI...</h4>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
                                Trạng thái hiện tại: <strong style={{ color: "#2563eb" }}>{aiStatus}</strong><br />
                                Hồ sơ đang trong hàng đợi chấm điểm.
                            </p>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button type="button" onClick={fetchAiScore}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}
                                >
                                    <RefreshCw size={14} /> Kiểm tra lại
                                </button>
                                {onRequeueSingle && applicant && (
                                    <button type="button" onClick={() => onRequeueSingle(applicant)}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", border: "1px solid #bfdbfe", borderRadius: "8px", background: "#eff6ff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#1d4ed8" }}
                                    >
                                        <Sparkles size={14} /> Chấm lại AI
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                    {isFailed && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", gap: "1rem", textAlign: "center" }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: "#f59e0b" }} />
                            <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Đang thử lại...</h4>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
                                Hệ thống gặp lỗi tạm thời và đang tự động thử lại. Vui lòng reload trang để cập nhật.
                            </p>
                        </div>
                    )}

                    {isDead && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", gap: "1rem", textAlign: "center" }}>
                            <TriangleAlert size={36} style={{ color: "#ef4444" }} />
                            <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Phân tích thất bại</h4>
                            {errorMsg && <p style={{ margin: 0, color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 }}>Lỗi: {errorMsg}</p>}
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
                                Hệ thống AI không thể phân tích CV này. Có thể do định dạng file không tương thích.
                            </p>
                            {onRequeueSingle && applicant && (
                                <button type="button" onClick={() => { onRequeueSingle(applicant); fetchAiScore(); }}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", border: "1px solid #bfdbfe", borderRadius: "8px", background: "#eff6ff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#1d4ed8" }}
                                >
                                    <Sparkles size={14} /> Chấm lại AI
                                </button>
                            )}
                        </div>
                    )}

                    {fetchStatus === "error" && !loading && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", gap: "1rem", textAlign: "center" }}>
                            <TriangleAlert size={36} style={{ color: "#94a3b8" }} />
                            <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Không thể tải dữ liệu</h4>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Không thể kết nối đến API. Vui lòng thử lại.</p>
                            <button type="button" onClick={fetchAiScore}
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}
                            >
                                <RefreshCw size={14} /> Thử lại
                            </button>
                        </div>
                    )}

                    {isDone && (
                        <>
                            <div className={styles.modalScoreRow}>
                                <div className={cx(styles.modalScoreBadge, styles[getScoreTone(score)])}>
                                    {score}
                                </div>
                                <div className={styles.modalSummary}>
                                    <h4>Tóm tắt đánh giá</h4>
                                    <p>{summary || "Chưa có tóm tắt đánh giá từ AI."}</p>
                                </div>
                            </div>

                            <div className={styles.modalSection}>
                                <div className={styles.modalSectionTitle}>
                                    <BadgeCheck size={16} />
                                    Điểm mạnh nổi bật
                                </div>
                                <ul className={styles.modalList}>
                                    {(strengths?.length > 0 ? strengths : ["Chưa có dữ liệu điểm mạnh chi tiết."]).map((item: string) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.modalSection}>
                                <div className={styles.modalSectionTitle}>
                                    <TriangleAlert size={16} />
                                    Rủi ro / Điểm yếu cần xác minh
                                </div>
                                <ul className={styles.modalList}>
                                    {(weaknesses?.length > 0 ? weaknesses : ["Chưa phát hiện rủi ro nổi bật từ AI."]).map((item: string) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.modalSection}>
                                <div className={styles.modalSectionTitle}>
                                    <CircleAlert size={16} />
                                    Khuyến nghị của AI
                                </div>
                                <p className={styles.recommendationText}>{summary || "Chưa có khuyến nghị bổ sung."}</p>
                            </div>
                        </>
                    )}

                    <div className={styles.modalFooter}>
                        <Button variant="outline" onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

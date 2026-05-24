"use client";

import { useState, useEffect } from "react";
import { StickyNote, X, Calendar, MapPin, Video } from "lucide-react";

import Button from "@/components/ui/Button";
import TextareaField from "@/components/ui/TextareaField";
import apiClient from "@/lib/apiClient";

import { Applicant, InterviewSchedule } from "../_lib/types";
import styles from "../candidates.module.scss";

interface InterviewNotesModalProps {
    applicant: Applicant | null;
    onClose: () => void;
    onSave: (note: string) => void;
}

interface InterviewNotesModalContentProps {
    applicant: Applicant;
    onClose: () => void;
    onSave: (note: string) => void;
}

function InterviewNotesModalContent({
    applicant,
    onClose,
    onSave,
}: InterviewNotesModalContentProps) {
    const [note, setNote] = useState(applicant.notes ?? "");
    const [interviewData, setInterviewData] = useState<InterviewSchedule | null>(applicant.interview || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchLatestNote = async () => {
            try {
                const response = await apiClient.get(
                    `/interview/application/${applicant.application_id}`
                );
                if (!isMounted) return;

                const data = response.data?.data;
                if (Array.isArray(data) && data.length > 0) {
                    const item = data[0];
                    setNote(item.notes || "");
                    setInterviewData({
                        ...item,
                        mode: item.meeting_link?.trim() ? "online" : (item.location?.trim() ? "offline" : "online"),
                    });
                }
            } catch (error) {
                console.error("Failed to fetch note:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchLatestNote();
        return () => { isMounted = false; };
    }, [applicant.application_id]);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.formModalCard}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div>
                        <h3>Chi tiết & Ghi chú phỏng vấn</h3>
                        <p>
                            {applicant.candidate_name} • {applicant.email}
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {interviewData && (() => {
                    const isOnline = Boolean(interviewData.meeting_link?.trim());
                    return (
                        <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "0.85rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    {isOnline ? <Video size={16} /> : <MapPin size={16} />}
                                    Hình thức:
                                </span>
                                <span style={{ background: isOnline ? "#dcfce7" : "#f1f5f9", color: isOnline ? "#15803d" : "#475569", padding: "0.25rem 0.75rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {isOnline ? "Online" : "Trực tiếp"}
                                </span>
                            </div>
                            {interviewData.interview_time && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <Calendar size={16} />
                                        Thời gian:
                                    </span>
                                    <span style={{ color: "#0f172a", fontWeight: 700 }}>
                                        {new Date(interviewData.interview_time).toLocaleString("vi-VN", { dateStyle: "full", timeStyle: "short" })}
                                    </span>
                                </div>
                            )}
                            {isOnline ? (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>Link họp:</span>
                                    <a href={interviewData.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "underline", wordBreak: "break-all", textAlign: "right" }}>
                                        {interviewData.meeting_link || "Chưa cập nhật"}
                                    </a>
                                </div>
                            ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>Địa điểm:</span>
                                    <span style={{ color: "#0f172a", fontWeight: 600, textAlign: "right" }}>
                                        {interviewData.location || "Chưa cập nhật"}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })()}

                <div className={styles.fieldWithIcon}>
                    <div className={styles.fieldIcon}>
                        <StickyNote size={16} />
                    </div>
                    <div style={{ width: "100%", position: "relative" }}>
                        <TextareaField
                            label="Ghi chú của người phỏng vấn"
                            rows={7}
                            value={note}
                            placeholder="Lưu nhận xét sau buổi phỏng vấn..."
                            onChange={(event) => setNote(event.target.value)}
                            disabled={isLoading}
                        />

                        {isLoading && (
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(255,255,255,0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                    fontStyle: "italic",
                                }}
                            >
                                Đang tải ghi chú...
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={() => onSave(note.trim())} disabled={isLoading}>
                        Lưu ghi chú
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function InterviewNotesModal({
    applicant,
    onClose,
    onSave,
}: InterviewNotesModalProps) {
    if (!applicant) return null;

    return (
        <InterviewNotesModalContent
            applicant={applicant}
            onClose={onClose}
            onSave={onSave}
        />
    );
}

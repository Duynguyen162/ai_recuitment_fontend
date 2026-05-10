"use client";

import { useState, useEffect } from "react";
import { StickyNote, X } from "lucide-react";

import Button from "@/components/ui/Button";
import TextareaField from "@/components/ui/TextareaField";
import apiClient from "@/lib/apiClient";

import { Applicant } from "../_lib/types";
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
                    setNote(data[0].notes || "");
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
                        <h3>Ghi chú phỏng vấn</h3>
                        <p>
                            {applicant.candidate_name} • {applicant.email}
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

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

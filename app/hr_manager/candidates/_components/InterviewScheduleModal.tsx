"use client";

import { useState } from "react";
import { CalendarClock, MapPinned, MonitorSmartphone, X } from "lucide-react";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import TextareaField from "@/components/ui/TextareaField";

import { getMeetingFieldHint, getMeetingFieldLabel } from "../_lib/helpers";
import {
  Applicant,
  InterviewScheduleFormValues,
  InterviewMode,
} from "../_lib/types";
import styles from "../candidates.module.scss";

interface InterviewScheduleModalProps {
  applicant: Applicant | null;
  onClose: () => void;
  onSave: (values: InterviewScheduleFormValues) => void;
}

interface InterviewScheduleModalContentProps {
  applicant: Applicant;
  onClose: () => void;
  onSave: (values: InterviewScheduleFormValues) => void;
}

function InterviewScheduleModalContent({
  applicant,
  onClose,
  onSave,
}: InterviewScheduleModalContentProps) {
  const [mode, setMode] = useState<InterviewMode>(
    applicant.interview?.mode ?? "online",
  );
  const [interview_time, setInterviewTime] = useState(
    applicant.interview?.interview_time ?? "",
  );
  const [meeting_link, setMeetingLink] = useState(
    applicant.interview?.meeting_link ?? "",
  );
  const [location, setLocation] = useState(applicant.interview?.location ?? "");

  const [notes, setNotes] = useState(applicant.interview?.notes ?? "");

  const handleSubmit = () => {
    
    onSave({
      mode,
      interview_time,
      meeting_link: meeting_link.trim(),
      location: location.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.formModalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h3>Lên lịch phỏng vấn</h3>
            <p>
              {applicant.candidate_name} • {applicant.email}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formLabel}>Hình thức phỏng vấn</div>
          <div className={styles.modeGrid}>
            <button
              type="button"
              className={
                mode === "online" ? styles.modeCardActive : styles.modeCard
              }
              onClick={() => setMode("online")}
            >
              <MonitorSmartphone size={18} />
              <span>Phỏng vấn online</span>
            </button>
            <button
              type="button"
              className={
                mode === "offline" ? styles.modeCardActive : styles.modeCard
              }
              onClick={() => setMode("offline")}
            >
              <MapPinned size={18} />
              <span>Phỏng vấn offline</span>
            </button>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldWithIcon}>
            <div className={styles.fieldIcon}>
              <CalendarClock size={16} />
            </div>
            <InputField
              label="Thời gian phỏng vấn"
              type="datetime-local"
              value={interview_time}
              onChange={(event) => setInterviewTime(event.target.value)}
            />
          </div>

          <div className={styles.fieldWithIcon}>
            <div className={styles.fieldIcon}>
              <MapPinned size={16} />
            </div>
            <div className={styles.TextareaDetail}>
              {mode === "online" ? (
                <TextareaField
                  label="Link phỏng vấn"
                  rows={3}
                  value={meeting_link}
                  placeholder="Nhập link Google Meet / Zoom..."
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              ) : (
                <TextareaField
                  label="Địa điểm phỏng vấn"
                  rows={3}
                  value={location}
                  placeholder="Nhập địa chỉ công ty..."
                  onChange={(e) => setLocation(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!interview_time.trim()}
          >
            Lưu lịch phỏng vấn
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewScheduleModal({
  applicant,
  onClose,
  onSave,
}: InterviewScheduleModalProps) {
  if (!applicant) return null;

  return (
    <InterviewScheduleModalContent
      applicant={applicant}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

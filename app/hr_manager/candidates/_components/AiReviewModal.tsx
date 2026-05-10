"use client";

import { BadgeCheck, CircleAlert, FileText, TriangleAlert, X } from "lucide-react";
import cx from "classnames";

import Button from "@/components/ui/Button";

import { getScoreTone } from "../_lib/helpers";
import { Applicant } from "../_lib/types";
import styles from "../candidates.module.scss";

interface AiReviewModalProps {
  applicant: Applicant | null;
  onClose: () => void;
  onPreviewCv: (applicationId: number) => void;
}

export default function AiReviewModal({
  applicant,
  onClose,
  onPreviewCv,
}: AiReviewModalProps) {
  if (!applicant) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h3>Nhận xét AI chi tiết</h3>
            <p>
              {applicant.candidate_name} • {applicant.email}
            </p>
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

        <div className={styles.modalScoreRow}>
          <div
            className={cx(
              styles.modalScoreBadge,
              styles[getScoreTone(applicant.ai_score)],
            )}
          >
            {applicant.ai_score}
          </div>
          <div className={styles.modalSummary}>
            <h4>Tóm tắt</h4>
            <p>{applicant.ai_summary}</p>
          </div>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalSectionTitle}>
            <BadgeCheck size={16} />
            Điểm mạnh nổi bật
          </div>
          <ul className={styles.modalList}>
            {(applicant.ai_strengths.length > 0
              ? applicant.ai_strengths
              : ["Chưa có dữ liệu điểm mạnh chi tiết."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalSectionTitle}>
            <TriangleAlert size={16} />
            Rủi ro cần xác minh
          </div>
          <ul className={styles.modalList}>
            {(applicant.ai_risks.length > 0
              ? applicant.ai_risks
              : ["Chưa có rủi ro nổi bật từ AI."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalSectionTitle}>
            <CircleAlert size={16} />
            Khuyến nghị của AI
          </div>
          <p className={styles.recommendationText}>{applicant.recommendation}</p>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

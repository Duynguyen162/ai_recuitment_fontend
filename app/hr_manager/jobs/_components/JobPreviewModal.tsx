import Link from "next/link";
import { Edit2, FileText, X } from "lucide-react";
import cx from "classnames";

import styles from "../jobsManagement.module.scss";
import {
  formatJobType,
  STATUS_LABELS,
  type HrJob,
} from "../_lib/jobManagement";
import Button from "@/components/ui/Button";
import { formatSalary } from "@/utils/formatSalary";

interface JobPreviewModalProps {
  job: HrJob | null;
  onClose: () => void;
}

export default function JobPreviewModal({
  job,
  onClose,
}: JobPreviewModalProps) {
  if (!job) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-preview-title"
      >
        <div className={styles.modalHeader}>
          <div>
            <span
              className={cx(
                styles.statusBadge,
                styles[job.status],
                styles.modalStatus,
              )}
            >
              {STATUS_LABELS[job.status]}
            </span>
            <h3 id="job-preview-title">{job.title}</h3>
            <p>Xem nhanh thông tin job mà không cần rời khỏi danh sách.</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng xem chi tiết"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.previewMetaGrid}>
          <div className={styles.previewMetaCard}>
            <span className={styles.previewLabel}>Địa điểm</span>
            <strong>{job.location || "Đang cập nhật"}</strong>
          </div>
          <div className={styles.previewMetaCard}>
            <span className={styles.previewLabel}>Loại công việc</span>
            <strong>{formatJobType(job.job_type)}</strong>
          </div>
          <div className={styles.previewMetaCard}>
            <span className={styles.previewLabel}>Mức lương</span>
            <strong>{formatSalary(job.salary_min, job.salary_max)}</strong>
          </div>
          <div className={styles.previewMetaCard}>
            <span className={styles.previewLabel}>Kinh nghiệm</span>
            <strong>{job.years_of_experience} năm</strong>
          </div>
          <div className={styles.previewMetaCard}>
            <span className={styles.previewLabel}>Ngày tạo</span>
            <strong>{new Date(job.created_at).toLocaleDateString("vi-VN")}</strong>
          </div>
          <div className={styles.previewMetaCard}>
            <span className={styles.previewLabel}>Hạn ứng tuyển</span>
            <strong>{new Date(job.expired_at).toLocaleDateString("vi-VN")}</strong>
          </div>
        </div>

        {!!job.tags?.length && (
          <div className={styles.previewTagRow}>
            {job.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.previewContentGrid}>
          <section className={styles.previewSection}>
            <div className={styles.previewSectionTitle}>
              <FileText size={16} />
              Mô tả công việc
            </div>
            <p>{job.description}</p>
          </section>

          <section className={styles.previewSection}>
            <div className={styles.previewSectionTitle}>
              <FileText size={16} />
              Yêu cầu ứng viên
            </div>
            <p>{job.requirements}</p>
          </section>

          {job.benefits && (
            <section className={styles.previewSection}>
              <div className={styles.previewSectionTitle}>
                <FileText size={16} />
                Quyền lợi
              </div>
              <p>{job.benefits}</p>
            </section>
          )}
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.btnClose}>
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
          </div>
          {job.status !== "closed" && job.status !== "published" && (
            <Link href={`/hr_manager/jobs/${job.id}/edit`}>
              <Button>
                <Edit2 size={16} /> Mở trang chỉnh sửa
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

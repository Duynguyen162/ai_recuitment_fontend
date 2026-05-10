import styles from "../jobsManagement.module.scss";
import type { JobSummary } from "../_lib/jobManagement";

interface JobsSummaryGridProps {
  summary: JobSummary;
}

export default function JobsSummaryGrid({
  summary,
}: JobsSummaryGridProps) {
  return (
    <div className={styles.summaryGrid}>
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Đang hoạt động trang này</span>
        <strong>{summary.publishedJobs}</strong>
      </div>
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Bản nháp trang này</span>
        <strong>{summary.draftJobs}</strong>
      </div>
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Tổng tin đã tạo</span>
        <strong>{summary.totalJobs}</strong>
      </div>
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Sắp hết hạn 7 ngày</span>
        <strong>{summary.expiringSoon}</strong>
      </div>
    </div>
  );
}

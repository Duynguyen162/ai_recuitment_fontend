"use client";

import cx from "classnames";

import { formatJobStatus } from "../_lib/helpers";
import { HrJob } from "../_lib/types";
import styles from "../candidates.module.scss";

interface JobSidebarProps {
  jobs: HrJob[];
  jobsLoading: boolean;
  selectedJobId: number | null;
  onSelectJob: (jobId: number) => void;
  //   onRefresh: () => void;
}

export default function JobSidebar({
  jobs,
  jobsLoading,
  selectedJobId,
  onSelectJob,
  //   onRefresh,
}: JobSidebarProps) {
  return (
    <aside className={styles.jobPanel}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Danh sách job</span>
          <h2>Chọn job cần xem ứng viên</h2>
        </div>
        {/* <Button variant="ghost" onClick={onRefresh} title="Tải lại danh sách">
          <RefreshCcw size={16} />
        </Button> */}
      </div>

      <div className={styles.jobList}>
        {jobsLoading ? (
          <div className={styles.infoCard}>Đang tải danh sách job...</div>
        ) : jobs.length === 0 ? (
          <div className={styles.infoCard}>
            Chưa có job nào để xem ứng viên.
          </div>
        ) : (
          jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className={cx(styles.jobCard, {
                [styles.activeJob]: selectedJobId === job.id,
              })}
              onClick={() => onSelectJob(job.id)}
            >
              <div className={styles.jobCardTop}>
                <span className={styles.jobStatus}>
                  {formatJobStatus(job.status)}
                </span>
              </div>
              <strong>{job.title}</strong>
              <p>{job.location}</p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

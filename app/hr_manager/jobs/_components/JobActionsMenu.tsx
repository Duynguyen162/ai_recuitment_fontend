import Link from "next/link";
import { Clock3, Edit2, Eye, MoreVertical, Trash2 } from "lucide-react";

import styles from "../jobsManagement.module.scss";
import type { HrJob } from "../_lib/jobManagement";

interface JobActionsMenuProps {
  job: HrJob;
  isOpen: boolean;
  onToggle: (jobId: number | null) => void;
  onOpenPreview: (job: HrJob) => void;
  onChangeStatus: (job: HrJob, status: string) => void;
  onDelete: (job: HrJob) => void;
}

export default function JobActionsMenu({
  job,
  isOpen,
  onToggle,
  onOpenPreview,
  onChangeStatus,
  onDelete,
}: JobActionsMenuProps) {
  return (
    <div className={styles.actionDropdown} data-action-menu-root="true">
      <button
        className={styles.moreBtn}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(isOpen ? null : job.id);
        }}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div
          className={styles.menu}
          onClick={(event) => event.stopPropagation()}
        >
          <button onClick={() => onOpenPreview(job)}>
            <Eye size={16} /> Xem chi tiết
          </button>

          {job.status === "draft" && (
            <Link href={`/hr_manager/jobs/${job.id}/edit`}>
              <Edit2 size={16} /> Sửa tin
            </Link>
          )}

          {job.status === "published" && (
            <>
              <button onClick={() => onChangeStatus(job, "paused")}>
                <Clock3 size={16} /> Tạm dừng tuyển dụng
              </button>
              <button onClick={() => onChangeStatus(job, "closed")}>
                <Clock3 size={16} /> Đóng tin tuyển dụng
              </button>
            </>
          )}

          {job.status === "paused" && (
            <button onClick={() => onChangeStatus(job, "published")}>
              <Clock3 size={16} /> Mở lại tuyển dụng
            </button>
          )}

          <button
            className={styles.danger}
            onClick={() => {
              onToggle(null);
              onDelete(job);
            }}
          >
            <Trash2 size={16} /> Xóa bài đăng
          </button>
        </div>
      )}
    </div>
  );
}

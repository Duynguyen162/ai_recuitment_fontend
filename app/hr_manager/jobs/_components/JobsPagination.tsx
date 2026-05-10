import styles from "../jobsManagement.module.scss";
import {
  PAGE_SIZE_OPTIONS,
  type PaginationMeta,
} from "../_lib/jobManagement";
import Button from "@/components/ui/Button";

interface JobsPaginationProps {
  pagination: PaginationMeta;
  visibleFrom: number;
  visibleTo: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
}

export default function JobsPagination({
  pagination,
  visibleFrom,
  visibleTo,
  onPageChange,
  onPageSizeChange,
}: JobsPaginationProps) {
  return (
    <div className={styles.paginationBar}>
      <div className={styles.paginationInfo}>
        <span>
          Hiển thị {visibleFrom}-{visibleTo} trên {pagination.total} tin
        </span>
        <label className={styles.pageSizeBox}>
          <span>Mỗi trang</span>
          <select
            value={pagination.page_size}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.paginationActions}>
        <Button
          variant="outline"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          Trang trước
        </Button>
        <span className={styles.pageIndicator}>
          Trang {pagination.page}/{pagination.total_pages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.total_pages}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
}

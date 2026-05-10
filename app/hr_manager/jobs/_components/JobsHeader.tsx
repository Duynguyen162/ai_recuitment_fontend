import Link from "next/link";
import { Plus } from "lucide-react";

import styles from "../jobsManagement.module.scss";
import Button from "@/components/ui/Button";

export default function JobsHeader() {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1>Quản lý việc làm</h1>
        <p>
          Theo dõi danh sách tin đã tạo, mở trang chi tiết, vào form chỉnh sửa
          và xóa job từ giao diện quản trị.
        </p>
      </div>
      <Link href="/hr_manager/jobs/create">
        <Button variant="primary">
          <Plus size={18} /> Đăng tin mới
        </Button>
      </Link>
    </div>
  );
}

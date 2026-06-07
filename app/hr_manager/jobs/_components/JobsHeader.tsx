import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "../jobsManagement.module.scss";
import Button from "@/components/ui/Button";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import toast from "react-hot-toast";

export default function JobsHeader() {
  const { company } = useCompanyProfile();
  const isLocked = company.verification_status === "locked";

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      toast.error("Tài khoản công ty của bạn đang bị khóa bởi Ban quản trị.");
    }
  };

  return (
    <div className={styles.pageHeader}>
      <Link href="/hr_manager/jobs/create" onClick={handleClick}>
        <Button variant="primary" disabled={isLocked}>
          <Plus size={18} /> Đăng tin mới
        </Button>
      </Link>
    </div>
  );
}

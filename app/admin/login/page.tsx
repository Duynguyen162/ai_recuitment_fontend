import { Shield } from "lucide-react";
import AdminLoginForm from "./AdminLoginForm";
import styles from "./adminLoginPage.module.scss";

type AdminLoginPageProps = {
    searchParams?: Promise<{
        redirect?: string;
    }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    const params = await searchParams;
    const redirectUrl = params?.redirect;

    return (
        <div className={styles.adminLoginContainer}>
            <div className={styles.overlay}></div>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1>Hệ thống Quản trị</h1>
                    <p>Vui lòng xác thực quyền truy cập vào trung tâm điều khiển</p>
                </div>

                <div className={styles.content}>
                    <AdminLoginForm redirectUrl={redirectUrl} />
                </div>

                <div className={styles.footer}>
                    <span>&copy; 2024 AI Recruitment System • Secure Portal</span>
                </div>
            </div>
        </div>
    );
}

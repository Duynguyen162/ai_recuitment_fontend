"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import styles from "./page.module.scss";
import apiClient from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";

interface FollowedCompany {
    id: number;
    name: string;
    logo_url: string;
    follower_count?: number;
    description?: string;
    website?: string;
}

export default function FollowedCompaniesPage() {
    const [companies, setCompanies] = useState<FollowedCompany[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowedCompanies = async () => {
            try {
                const res = await apiClient.get(`/public/companies/followed`);

                if (res.data?.success) {
                    setCompanies(res.data.data);
                }
                setLoading(false);
            } catch (error) {
                toast.error("Lỗi khi tải danh sách công ty đang theo dõi.");
                setLoading(false);
            }
        };

        fetchFollowedCompanies();
    }, []);

    const handleUnfollow = async (companyId: number) => {
        // Lưu lại trạng thái cũ để revert nếu lỗi
        const previousCompanies = [...companies];
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));

        try {
            // TODO: Mở comment dòng dưới đây để gọi API hủy theo dõi thực tế
            // await apiClient.post(`/public/companies/${companyId}/follow`);
            toast.success("Đã hủy theo dõi công ty.");
        } catch (error) {
            // Revert lại nếu API lỗi
            setCompanies(previousCompanies);
            toast.error("Lỗi khi hủy theo dõi công ty.");
        }
    };

    if (loading) {
        return <div className={styles.loader}>Đang tải danh sách công ty...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <Toaster />
            <div className={styles.pageHeader}>
                <h1>Công ty đang theo dõi</h1>
                <p>Cập nhật tin tức và cơ hội việc làm mới nhất từ các công ty bạn quan tâm.</p>
            </div>

            {companies.length === 0 ? (
                <div className={styles.emptyState}>
                    <Building2 size={48} className={styles.emptyIcon} />
                    <p>Bạn chưa theo dõi công ty nào.</p>
                    <Link href="/candidate/search_job">
                        <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: "8px", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}>
                            Khám phá việc làm
                        </button>
                    </Link>
                </div>
            ) : (
                <div className={styles.companyGrid}>
                    {companies.map((company) => (
                        <div key={company.id} className={styles.companyCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.logo}>
                                    {company.logo_url && company.logo_url !== "string" ? (
                                        <img src={company.logo_url} alt={company.name} />
                                    ) : (
                                        <span className={styles.placeholder}>{company.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className={styles.companyInfo}>
                                    <Link href={`/candidate/companies/${company.id}`} className={styles.name}>
                                        {company.name}
                                    </Link>
                                    <div className={styles.followerCount}>
                                        <Users size={14} />
                                        {company.follower_count || 0} người theo dõi
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <Link href={`/candidate/companies/${company.id}`} className={styles.viewJobsLink}>
                                    Xem hồ sơ công ty
                                </Link>
                                <button
                                    className={styles.unfollowBtn}
                                    onClick={() => handleUnfollow(company.id)}
                                >
                                    Bỏ theo dõi
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

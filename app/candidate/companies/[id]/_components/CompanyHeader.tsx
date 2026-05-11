"use client";

import React, { useState } from "react";
import styles from "./CompanyHeader.module.scss";
import { Globe, Users, Plus, Check } from "lucide-react";
import cx from "classnames";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";

interface CompanyHeaderProps {
  company: {
    id: number;
    name: string;
    logo_url?: string;
    website?: string;
    follower_count: number;
    is_followed: boolean;
  };
}

export default function CompanyHeader({ company }: CompanyHeaderProps) {
  const [isFollowed, setIsFollowed] = useState(company.is_followed);
  const [followerCount, setFollowerCount] = useState(company.follower_count);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/public/companies/${company.id}/follow`);
      if (res.data?.success) {
        setIsFollowed(res.data.data.is_followed);
        setFollowerCount(res.data.data.follower_count);
        toast.success(
          res.data.data.is_followed
            ? "Đã theo dõi công ty!"
            : "Đã hủy theo dõi công ty."
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Vui lòng đăng nhập với tư cách ứng viên để theo dõi công ty.");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.companyInfo}>
        <div className={styles.logo}>
          {company.logo_url && company.logo_url !== "string" ? (
            <img src={company.logo_url} alt={company.name} />
          ) : (
            <span className={styles.placeholder}>{company.name.charAt(0)}</span>
          )}
        </div>
        <div className={styles.details}>
          <h1 className={styles.name}>{company.name}</h1>
          {company.website && (
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.website}
            >
              <Globe size={16} />
              {company.website}
            </a>
          )}
          <span className={styles.followerCount}>
            <Users size={16} />
            {followerCount} người theo dõi
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          onClick={handleFollow}
          disabled={loading}
          className={cx(styles.followBtn, {
            [styles.followed]: isFollowed,
            [styles.unfollowed]: !isFollowed,
          })}
        >
          {isFollowed ? (
            <>
              <Check size={18} />
              Đang theo dõi
            </>
          ) : (
            <>
              <Plus size={18} />
              Theo dõi
            </>
          )}
        </button>
      </div>
    </div>
  );
}

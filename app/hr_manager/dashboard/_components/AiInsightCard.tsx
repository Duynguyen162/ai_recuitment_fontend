"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Eye, FileText, Lock, ArrowRight } from "lucide-react";
import styles from "../dashboard.module.scss";

interface AiInsightCardProps {
  isVip: boolean;
  companyName: string | undefined;
}

export default function AiInsightCard({
  isVip,
  companyName,
}: AiInsightCardProps) {
  return (
    <div className={styles.aiInsightCard}>
      <div className={styles.aiInsightTop}>
        <div className={styles.aiInsightIcon}>
          {isVip ? <Sparkles size={20} /> : <Lock size={20} />}
        </div>
        <div>
          <h3>AI Matching Insights</h3>
          <p>
            {isVip
              ? `Hệ thống AI đang hoạt động tối ưu cho ${
                  companyName || "doanh nghiệp"
                }.`
              : "Điểm AI và nhận xét chi tiết hiện đang bị khóa."}
          </p>
        </div>
      </div>

      <div className={styles.aiFeatureList}>
        <div className={styles.aiFeatureItem}>
          <Sparkles size={16} />
          Chấm điểm mức độ phù hợp CV
        </div>
        <div className={styles.aiFeatureItem}>
          <Eye size={16} />
          Chi tiết nhận xét điểm mạnh và rủi ro
        </div>
        <div className={styles.aiFeatureItem}>
          <FileText size={16} />
          Trả lời theo tài liệu công ty đã nạp
        </div>
      </div>

      {!isVip && (
        <Link href="/hr_manager/pricing" className={styles.upgradeLink}>
          Nâng cấp VIP
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

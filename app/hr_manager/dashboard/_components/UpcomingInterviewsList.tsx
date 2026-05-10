"use client";

import React from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import styles from "../dashboard.module.scss";
import { InterviewItem } from "../_lib/types";

interface UpcomingInterviewsListProps {
  interviews: InterviewItem[];
}

export default function UpcomingInterviewsList({
  interviews,
}: UpcomingInterviewsListProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <h3>Lịch phỏng vấn sắp tới</h3>
        <Link href="/hr_manager/interviews" className={styles.viewAllBtn}>
          Chi tiết
        </Link>
      </div>
      <div className={styles.listContainer}>
        {interviews.length > 0 ? (
          interviews.map((item) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <div className={styles.avatar}>
                  <Video size={16} />
                </div>
                <div className={styles.details}>
                  <div className={styles.name}>{item.candidate_name}</div>
                  <div className={styles.meta}>
                    {item.job_title} • {item.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}
          >
            Chưa có lịch phỏng vấn nào sắp tới.
          </div>
        )}
      </div>
    </div>
  );
}

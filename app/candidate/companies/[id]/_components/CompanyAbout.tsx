"use client";

import React from "react";
import styles from "./CompanyAbout.module.scss";

interface CompanyAboutProps {
  description?: string;
}

export default function CompanyAbout({ description }: CompanyAboutProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Giới thiệu công ty</h2>
      {description ? (
        <div 
          className={styles.description} 
          dangerouslySetInnerHTML={{ __html: description }} 
        />
      ) : (
        <p className={styles.emptyState}>Công ty chưa cập nhật thông tin giới thiệu.</p>
      )}
    </div>
  );
}

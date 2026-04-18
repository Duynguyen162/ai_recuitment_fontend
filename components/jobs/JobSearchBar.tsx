"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import styles from "./JobSearchBar.module.scss";

interface JobSearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export default function JobSearchBar({
  initialQuery = "",
  onSearch,
}: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrapper}>
        <Search className={styles.icon} />
        <input
          type="text"
          className={styles.inputField}
          placeholder="Tên công việc, kỹ năng, công ty..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.submitBtn}>
        Tìm kiếm
      </button>
    </form>
  );
}

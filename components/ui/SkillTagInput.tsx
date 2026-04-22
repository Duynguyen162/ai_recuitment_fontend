"use client";

import React, { useState, KeyboardEvent, useRef } from "react";
import { X } from "lucide-react";
import cx from "classnames";
import styles from "./SkillTagInput.module.scss";

interface SkillTagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  placeholder?: string;
}

export default function SkillTagInput({
  label = "Kỹ năng chuyên môn",
  tags,
  onChange,
  error,
  placeholder = "Nhập kỹ năng và ấn Enter...",
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi người dùng ấn phím
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 1. Nếu ấn Enter hoặc Dấu phẩy -> Thêm Tag mới
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Ngăn chặn form tự động submit khi ấn Enter

      const newTag = inputValue.trim();
      // Chỉ thêm nếu tag không rỗng và chưa tồn tại trong mảng
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue(""); // Xóa ô input sau khi thêm thành công
    }

    // 2. Nếu ấn Backspace mà ô input đang trống -> Xóa tag cuối cùng
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    }
  };

  // Hàm xóa 1 tag bất kỳ khi ấn nút X
  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  // Hàm focus vào input thật khi click vào vùng div bọc ngoài
  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={styles.container}>
      {label && <label>{label}</label>}

      <div
        className={cx(styles.tagWrapper, {
          [styles.focused]: isFocused,
          [styles.error]: error,
        })}
        onClick={handleWrapperClick}
      >
        {/* Render danh sách các thẻ kỹ năng */}
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn việc focus lại vào input khi bấm nút X
                handleRemoveTag(index);
              }}
              aria-label={`Xóa kỹ năng ${tag}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}

        {/* Ô nhập liệu thật */}
        <input
          ref={inputRef}
          type="text"
          className={styles.inputField}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>

      {error ? (
        <p className={styles.errorText}>{error}</p>
      ) : (
        <span className={styles.helperText}>
          Gõ tên kỹ năng và ấn phím Enter (hoặc dấu phẩy) để thêm.
        </span>
      )}
    </div>
  );
}

"use client";

import { ButtonHTMLAttributes } from "react";
import cx from "classnames";
import styles from "./Button.module.scss";

// Kế thừa các thuộc tính gốc của nút (onClick, className, id,...)
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost" | "danger";
}

export default function Button({
  children,
  disabled,
  loading,
  type = "button", // Đổi mặc định thành "button" để tránh vô tình submit form
  variant = "primary", // Mặc định là nút chính (nền màu)
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      // Nối class mặc định + class theo biến thể + class truyền từ bên ngoài vào
      className={cx(styles.btn, styles[variant], className)}
      disabled={disabled || loading}
      {...props} // Đẩy toàn bộ onClick, onBlur... vào đây
    >
      {loading ? <span className={styles.spinner}></span> : children}
    </button>
  );
}
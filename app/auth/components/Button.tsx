"use client";
import styles from "./Button.module.scss";

interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}

export default function Button({
  children,
  disabled,
  loading,
  type = "submit",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={styles.btn}
      disabled={disabled || loading}
    >
      {loading ? <span className={styles.spinner}></span> : children}
    </button>
  );
}
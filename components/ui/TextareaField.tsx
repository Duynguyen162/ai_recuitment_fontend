"use client";

import { useId, forwardRef, TextareaHTMLAttributes } from "react";
import styles from "./TextareaField.module.scss";

// Kế thừa toàn bộ thuộc tính gốc của thẻ <textarea> (rows, placeholder, name, onBlur...)
interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId();
    
    return (
      <div className={styles.inputGroup}>
        <label htmlFor={id}>{label}</label>

        <textarea
          id={id}
          ref={ref}
          className={`${styles.input} ${error ? styles.error : ""} ${className || ""}`}
          {...props}
        />

        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    );
  }
);

TextareaField.displayName = "TextareaField";

export default TextareaField;
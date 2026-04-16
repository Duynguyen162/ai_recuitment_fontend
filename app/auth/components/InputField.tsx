"use client";

import { useId, forwardRef, InputHTMLAttributes } from "react";
import styles from "./InputField.module.scss";

// Kế thừa toàn bộ thuộc tính gốc của thẻ <input> (type, placeholder, name, onBlur...)
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Dùng forwardRef để hứng 'ref' từ React Hook Form
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId(); // Vẫn giữ nguyên useId của bạn để link label và input

    return (
      <div className={styles.inputGroup}>
        <label htmlFor={id}>{label}</label>

        <input
          id={id}
          ref={ref} // RẤT QUAN TRỌNG: Gắn ref vào đây để React Hook Form điều khiển
          className={`${styles.input} ${error ? styles.error : ""} ${className || ""}`}
          {...props} // Rải toàn bộ các props còn lại (onChange, onBlur, name, type...) tự động
        />

        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    );
  }
);

// Khai báo displayName giúp debug dễ hơn trong React DevTools
InputField.displayName = "InputField";

export default InputField;
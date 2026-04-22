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
    const id = useId(); 
    return (
      <div className={styles.inputGroup}>
        <label htmlFor={id}>{label}</label>

        <input
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

InputField.displayName = "InputField";

export default InputField;
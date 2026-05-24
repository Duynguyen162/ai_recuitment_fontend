"use client";

import React from "react";
import cx from "classnames";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Briefcase, Pencil } from "lucide-react";
import styles from "./StylesAll.module.scss";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import TextareaField from "@/components/ui/TextareaField";
import { useProfileSection } from "@/hooks/useProfileSection"; // Import Hook mới
import { Toaster } from "react-hot-toast";

// 1. Interface & Schema (Giữ nguyên)
interface Experience {
  id: string;
  company_name: string;
  job_title: string;
  description: string | null;
}

const expSchema = z.object({
  company_name: z.string().min(2, "Vui lòng nhập tên công ty"),
  job_title: z.string().min(2, "Vui lòng nhập chức danh"),
  description: z.string().optional(),
});
type ExpFormValues = z.infer<typeof expSchema>;

export default function ExperienceSection({ refreshTrigger }: { refreshTrigger?: number }) {
  // Gọi Custom Hook
  const {
    items: experiences,
    isAdding,
    editingId,
    handleSave,
    handleDelete,
    openAddForm,
    openEditForm,
    closeForm,
    isLoading,
  } = useProfileSection<Experience>("/profiles/experiences", refreshTrigger);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpFormValues>({
    resolver: zodResolver(expSchema),
  });

  const onSubmit = async (data: ExpFormValues) => {
    const success = await handleSave(data);
    if (success) {
      closeForm();
      reset({}); // Xóa trắng form RHF
    }
  };

  // 4. Mở form Edit
  const handleEdit = (exp: Experience) => {
    openEditForm(exp.id);
    reset({
      company_name: exp.company_name,
      job_title: exp.job_title,
      description: exp.description || "",
    });
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2>Kinh nghiệm làm việc</h2>
        <div className={styles.addBtnWrapper}>
          {!isAdding && (
            <Button
              variant="ghost"
              onClick={() => {
                openAddForm();
                reset({});
              }}
            >
              <Plus size={18} /> Thêm
            </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrapper}>
          <h3>{editingId ? "Chỉnh sửa kinh nghiệm" : "Thêm kinh nghiệm"}</h3>
          <div className={styles.inputGrid}>
            <InputField
              label="Chức danh / Vị trí *"
              placeholder="VD: Lập trình viên Frontend"
              error={errors.job_title?.message}
              {...register("job_title")}
            />
            <InputField
              label="Tên công ty *"
              placeholder="VD: Công ty TNHH AIDO"
              error={errors.company_name?.message}
              {...register("company_name")}
            />
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <TextareaField
              label="Mô tả trách nhiệm , công việc , thành tựu"
              placeholder="- Tối ưu hóa UI/UX...&#10;- Tăng tốc độ tải trang..."
              {...register("description")}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                closeForm();
                reset({});
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              Lưu kinh nghiệm
            </button>
          </div>
        </form>
      )}

      <div className={cx(styles.listContainer, { [styles.isLoading]: isLoading })}>
        {isLoading && <div className={styles.topLoader}></div>}
        {experiences.length === 0 && !isAdding && !isLoading && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>
            Chưa có kinh nghiệm nào được thêm.
          </p>
        )}
        {experiences.map((exp) => (
          <div key={exp.id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <h4>{exp.job_title}</h4>
              <div className={styles.subText}>
                <Briefcase
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                {exp.company_name}
              </div>
              {exp.description && (
                <div className={styles.desc}>{exp.description}</div>
              )}
            </div>
            <div className={styles.itemActions}>
              <button
                onClick={() => handleEdit(exp)}
                className={styles.editBtn}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className={styles.deleteBtn}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <Toaster />
      </div>
    </div>
  );
}

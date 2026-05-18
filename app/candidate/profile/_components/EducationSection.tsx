"use client";

import React from "react";
import cx from "classnames";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, GraduationCap, Pencil } from "lucide-react";
import styles from "./StylesAll.module.scss";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useProfileSection } from "@/hooks/useProfileSection";
import { Toaster } from "react-hot-toast";

// 1. Interface
interface Education {
  id: string;
  institution_name: string;
  major: string | null;
  degree: string | null;
}

// 2. Schema
const eduSchema = z.object({
  institution_name: z.string().min(2, "Vui lòng nhập tên trường"),
  major: z.string().optional(),
  degree: z.string().optional(),
});

type EduFormValues = z.infer<typeof eduSchema>;

export default function EducationSection() {
  const {
    items: educations,
    isAdding,
    editingId,
    handleSave,
    handleDelete,
    openAddForm,
    openEditForm,
    closeForm,
    isLoading,
  } = useProfileSection<Education>("/profiles/educations");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EduFormValues>({
    resolver: zodResolver(eduSchema),
  });

  const onSubmit = async (data: EduFormValues) => {
    const success = await handleSave(data);

    if (success) {
      closeForm();
      reset({
        institution_name: "",
        major: "",
        degree: "",
      });
    }
  };

  const handleEdit = (edu: Education) => {
    openEditForm(edu.id);

    reset({
      institution_name: edu.institution_name,
      major: edu.major || "",
      degree: edu.degree || "",
    });
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2>Học vấn</h2>
        <div className={styles.addBtnWrapper}>
          {!isAdding && (
            <Button
              variant="ghost"
              onClick={() => {
                openAddForm();
                reset({
                  institution_name: "",
                  major: "",
                  degree: "",
                });
              }}
            >
              <Plus size={18} /> Thêm
            </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrapper}>
          <h3>{editingId ? "Chỉnh sửa học vấn" : "Thêm học vấn"}</h3>

          <div className={styles.inputGrid}>
            <InputField
              label="Tên trường *"
              placeholder="VD: Đại học Thủy Lợi"
              error={errors.institution_name?.message}
              {...register("institution_name")}
            />
            <InputField
              label="Chuyên ngành"
              placeholder="VD: Kỹ thuật phần mềm"
              error={errors.major?.message}
              {...register("major")}
            />
            <InputField
              label="Bằng cấp"
              placeholder="VD: Cử nhân, Thạc sĩ"
              error={errors.degree?.message}
              {...register("degree")}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                closeForm();
                reset({
                  institution_name: "",
                  major: "",
                  degree: "",
                });
              }}
            >
              Hủy
            </button>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              {editingId ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      )}

      <div className={cx(styles.listContainer, { [styles.isLoading]: isLoading })}>
        {isLoading && <div className={styles.topLoader}></div>}
        {educations.length === 0 && !isAdding && !isLoading && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>
            Chưa có thông tin học vấn.
          </p>
        )}

        {educations.map((edu) => (
          <div key={edu.id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <h4>{edu.institution_name}</h4>

              <div className={styles.subText}>
                <GraduationCap size={14} style={{ marginRight: "4px" }} />
                {edu.major || "Chưa cập nhật chuyên ngành"}
              </div>

              {edu.degree && (
                <div className={styles.desc}>Bằng cấp: {edu.degree}</div>
              )}
            </div>

            <div className={styles.itemActions}>
              <button
                onClick={() => handleEdit(edu)}
                className={styles.editBtn}
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={() => handleDelete(edu.id)}
                className={styles.deleteBtn}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Toaster />
    </div>
  );
}

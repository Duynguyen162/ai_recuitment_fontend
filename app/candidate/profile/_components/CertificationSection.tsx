"use client";

import React from "react";
import cx from "classnames";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Award, Pencil } from "lucide-react";
import { Toaster } from "react-hot-toast";

import styles from "./StylesAll.module.scss";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useProfileSection } from "@/hooks/useProfileSection";

interface Certification {
  id: string;
  name: string;
  issuer: string | null;
}

const certSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên chứng chỉ"),
  issuer: z.string().optional(),
});

type CertFormValues = z.infer<typeof certSchema>;

export default function CertificationSection() {
  const {
    items: certifications,
    isAdding,
    handleSave,
    handleDelete,
    openAddForm,
    openEditForm,
    closeForm,
    isLoading,
  } = useProfileSection<Certification>("/profiles/certifications");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CertFormValues>({
    resolver: zodResolver(certSchema),
  });

  const onSubmit = async (data: CertFormValues) => {
    const success = await handleSave(data);
    if (success) {
      closeForm();
      reset({
        name: "",
        issuer: "",
      });
    }
  };

  const handleEdit = async (certification: Certification) => {
    openEditForm(certification.id);
    reset({
      name: certification.name,
      issuer: certification.issuer || "",
    });
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2>Chứng chỉ chuyên môn</h2>
        <div className={styles.addBtnWrapper}>
          {!isAdding && (
            <Button
              variant="ghost"
              onClick={() => {
                openAddForm();
                reset({
                  name: "",
                  issuer: "",
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
          <h3>Thêm chứng chỉ</h3>
          <div className={styles.inputGrid}>
            <InputField
              label="Tên chứng chỉ *"
              placeholder="VD: TOEIC 850, PMP"
              error={errors.name?.message}
              {...register("name")}
            />
            <InputField
              label="Tổ chức cấp"
              placeholder="VD: ETS, AWS"
              error={errors.issuer?.message}
              {...register("issuer")}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                closeForm();
                reset({
                  name: "",
                  issuer: "",
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
              Lưu chứng chỉ
            </button>
          </div>
        </form>
      )}

      <div className={cx(styles.listContainer, { [styles.isLoading]: isLoading })}>
        {isLoading && <div className={styles.topLoader}></div>}
        {certifications.length === 0 && !isAdding && !isLoading && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>
            Chưa có chứng chỉ nào.
          </p>
        )}
        {certifications.map((cert) => (
          <div key={cert.id} className={styles.listItem}>
            <div className={styles.itemContent}>
              <h4>{cert.name}</h4>
              <div className={styles.subText}>
                <Award
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                {cert.issuer || "Không xác định tổ chức"}
              </div>
            </div>
            <div className={styles.itemActions}>
              <button
                onClick={() => handleEdit(cert)}
                className={styles.editBtn}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(cert.id)}
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

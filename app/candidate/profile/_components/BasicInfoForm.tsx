"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";

import styles from "./BasicInfoForm.module.scss";
import InputField from "@/components/ui/InputField";
import SkillTagInput from "@/components/ui/SkillTagInput";
import apiClient from "@/lib/apiClient";
import TextareaField from "@/components/ui/TextareaField";

const basicInfoSchema = z.object({
  full_name: z.string().min(2, "Vui lòng nhập họ và tên"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  years_of_experience: z.coerce
    .number()
    .min(0, "Số năm kinh nghiệm không hợp lệ"),
  portfolio_url: z
    .string()
    .url("URL không hợp lệ")
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .url("URL không hợp lệ")
    .optional()
    .or(z.literal("")),
  github_url: z
    .string()
    .url("URL không hợp lệ")
    .optional()
    .or(z.literal("")),
  skill_tags: z.array(z.string()).default([]),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export default function BasicInfoForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      bio: "",
      years_of_experience: 0,
      portfolio_url: "",
      linkedin_url: "",
      github_url: "",
      skill_tags: [],
    },
  });

  useEffect(() => {
    const profileData = async () => {
      try {
        const res = await apiClient.get("/profiles/profileCandidate");
        const data = res.data.data;
        reset({
          full_name: data.full_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          years_of_experience: data.years_of_experience || 0,
          portfolio_url: data.portfolio_url || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          skill_tags: data.skill_tags || [],
        });
      } catch (error) {
        console.log(error);
      }
    };

    profileData();
  }, [reset]);

  const skill = useWatch({
    control,
    name: "skill_tags",
    defaultValue: [],
  });

  const onSubmit = async (data: BasicInfoFormValues) => {
    try {
      const payload = {
        full_name: data.full_name,
        phone: data.phone,
        bio: data.bio,
        years_of_experience: data.years_of_experience,
        portfolio_url: data.portfolio_url,
        linkedin_url: data.linkedin_url,
        github_url: data.github_url,
        skill_tags: data.skill_tags,
      };

      const res = await apiClient.post("/profiles/profileCandidate", payload);
      if (res.status === 200) {
        toast.success("Cập nhật thành công");
      } else {
        toast.success("Cập nhật không thành công");
      }
    } catch (error) {
      console.log("loi", error);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h3>Thông tin cốt lõi</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.inputGrid}>
          <InputField
            label="Họ và Tên *"
            placeholder="VD: Nguyễn Quang Duy"
            error={errors.full_name?.message}
            {...register("full_name")}
          />
          <InputField
            label="Số điện thoại"
            placeholder="VD: 0987654321"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <InputField
            label="Số năm kinh nghiệm"
            type="number"
            min="0"
            placeholder="VD: 2"
            error={errors.years_of_experience?.message}
            {...register("years_of_experience")}
          />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <SkillTagInput
            tags={skill}
            onChange={(newTags) =>
              setValue("skill_tags", newTags, { shouldValidate: true })
            }
            error={errors.skill_tags?.message}
          />
        </div>

        <TextareaField
          label="Giới thiệu bản thân (Bio)"
          placeholder="Mô tả ngắn về bản thân, mục tiêu nghề nghiệp..."
          error={errors.bio?.message}
          {...register("bio")}
        />

        <h3
          style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1rem" }}
        >
          Liên kết mạng xã hội
        </h3>
        <div className={styles.inputGrid}>
          <InputField
            label="Portfolio Website"
            placeholder="https://yourdomain.com"
            error={errors.portfolio_url?.message}
            {...register("portfolio_url")}
          />
          <InputField
            label="LinkedIn"
            placeholder="https://linkedin.com/in/username"
            error={errors.linkedin_url?.message}
            {...register("linkedin_url")}
          />
          <InputField
            label="GitHub"
            placeholder="https://github.com/username"
            error={errors.github_url?.message}
            {...register("github_url")}
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </form>
      <Toaster />
    </div>
  );
}

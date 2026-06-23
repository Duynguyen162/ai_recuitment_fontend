"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    CalendarClock,
    CircleDashed,
    FileText,
    MapPin,
    Sparkles,
} from "lucide-react";

import styles from "./jobForm.module.scss";
import InputField from "@/components/ui/InputField";
import TextareaField from "@/components/ui/TextareaField";
import SkillTagInput from "@/components/ui/SkillTagInput";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import AiJobGeneratorModal from "./AiJobGeneratorModal";

const jobFormSchema = z
    .object({
        title: z.string().min(3, "Nhập tiêu đề tối thiểu 3 ký tự"),
        description: z.string().min(20, "Mô tả công việc tối thiểu 20 ký tự"),
        requirements: z.string().min(20, "Yêu cầu ứng viên tối thiểu 20 ký tự"),
        location: z.string().min(2, "Nhập địa điểm làm việc"),
        tags: z.array(z.string().min(1)).default([]),
        salary_min: z.coerce.number().min(0, "Lương tối thiểu phải >= 0"),
        salary_max: z.coerce.number().min(0, "Lương tối đa phải >= 0"),
        years_of_experience: z.coerce
            .number()
            .min(0, "Số năm kinh nghiệm phải >= 0"),
        job_type: z.enum(["full_time", "part_time", "contract", "internship"]),
        expired_at: z.string().min(1, "Chọn hạn ứng tuyển"),
    })
    .refine((data) => data.salary_max >= data.salary_min, {
        path: ["salary_max"],
        message: "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu",
    });

export type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
    mode: "create" | "edit";
    initialValues?: Partial<JobFormValues>;
    jobId?: number;
}

function normalizeDateTimeLocal(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const localTime = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
    );
    return localTime.toISOString().slice(0, 16);
}

export default function JobForm({ mode, initialValues, jobId }: JobFormProps) {
    const router = useRouter();
    const [submitIntent, setSubmitIntent] = useState<"draft" | "publish">(
        "draft",
    );
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const { company } = useCompanyProfile();
    const isLocked = company.verification_status === "locked";

    const defaultValues = useMemo<JobFormValues>(
        () => ({
            title: initialValues?.title ?? "",
            description: initialValues?.description ?? "",
            requirements: initialValues?.requirements ?? "",
            location: initialValues?.location ?? "",
            tags: initialValues?.tags ?? [],
            salary_min: initialValues?.salary_min ?? 0,
            salary_max: initialValues?.salary_max ?? 0,
            years_of_experience: initialValues?.years_of_experience ?? 0,
            job_type: initialValues?.job_type ?? "full_time",
            expired_at: normalizeDateTimeLocal(initialValues?.expired_at),
        }),
        [initialValues],
    );

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        values: defaultValues,
    });

    const onSubmit = async (
        values: JobFormValues,
        intent: "draft" | "publish",
    ) => {
        if (isLocked) {
            toast.error("Tài khoản công ty của bạn đang bị khóa bởi Ban quản trị và không thể đăng bài tuyển dụng mới.");
            return;
        }
        const payload = {
            ...values,
            expired_at: new Date(values.expired_at).toISOString(),
        };

        if (mode === "create") {
            try {
                await apiClient.post("/job/create_jobs", {
                    ...payload,
                    status: intent === "publish" ? "published" : "draft",
                });
                toast.success(
                    intent === "publish"
                        ? "Đã tạo và đăng job thành công"
                        : "Đã tạo job nháp thành công",
                );
                router.push("/hr_manager/jobs");
                router.refresh();
            } catch {
                toast.error("Bạn cần không có quyền đăng bài");
            }
            return;
        }

        try {
            await apiClient.put(`/job/update_job/${jobId}`, payload);

            if (intent === "publish") {
                await apiClient.put(`/job/${jobId}/status?status=published`);
            }

            toast.success(
                intent === "publish"
                    ? "Đã cập nhật và đăng job thành công"
                    : "Đã lưu thay đổi bản nháp",
            );
            router.push("/hr_manager/jobs");
            router.refresh();
        } catch {
            toast.error(
                intent === "publish"
                    ? "Không thể đăng job sau khi cập nhật"
                    : "Lỗi cập nhật job",
            );
        }
    };

    const handleAiSuccess = (data: any) => {
        const opts = { shouldValidate: true, shouldDirty: true };
        setValue("title", data.title || "", opts);
        setValue("description", data.description || "", opts);
        setValue("requirements", data.requirements || "", opts);
        setValue("location", data.location || "", opts);
        setValue("tags", data.tags || [], opts);
        setValue("salary_min", data.salary_min || 0, opts);
        setValue("salary_max", data.salary_max || 0, opts);
        setValue("years_of_experience", data.years_of_experience || 0, opts);
        setValue("job_type", data.job_type || "full_time", opts);
    };

    return (
        <form className={styles.formLayout} onSubmit={(e) => e.preventDefault()}>
            <AiJobGeneratorModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                onSuccess={handleAiSuccess}
            />
            <div className={styles.heroCard}>
                <div className={styles.heroTop}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() => router.push("/hr_manager/jobs")}
                    >
                        <ArrowLeft size={15} />
                        Quay lại danh sách
                    </button>
                    <div className={styles.heroMeta}>
                        <span>
                            <FileText size={15} />
                            {mode === "create" ? "Form tạo mới" : `Job #${jobId ?? "--"}`}
                        </span>
                        <span>
                            <CircleDashed size={15} />
                            {submitIntent === "publish" ? "Sắp đăng" : "Đang lưu nháp"}
                        </span>
                    </div>
                </div>
                <div className={styles.heroBody}>
                    <h1>{mode === "create" ? "Tạo tin tuyển dụng" : "Chỉnh sửa job"}</h1>
                    <p>
                        Nhập đầy đủ thông tin để lưu bản nháp hoặc chuẩn bị đăng tin trong
                        luồng HR manager.
                    </p>
                </div>
            </div>

            <div className={styles.contentMain}>
                <div className={styles.formMain}>
                    {mode === "create" && (
                        <div className={styles.aiBanner}>
                            <div className={styles.aiBannerText}>
                                <Sparkles size={20} className={styles.aiIcon} />
                                <div>
                                    <strong>Tạo tin tuyển dụng tự động bằng AI</strong>
                                    <p>Tiết kiệm thời gian bằng cách mô tả ngắn gọn yêu cầu, AI sẽ tự động điền toàn bộ form cho bạn.</p>
                                </div>
                            </div>
                            <Button type="button" onClick={() => setAiModalOpen(true)} className={styles.aiButton}>
                                Bắt đầu tạo
                            </Button>
                        </div>
                    )}

                    <section className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitle}>Thông tin cơ bản</div>
                        </div>

                        <div className={styles.primaryGrid}>
                            <InputField
                                label="Tiêu đề công việc"
                                placeholder="VD: Senior Frontend Developer"
                                {...register("title")}
                                error={errors.title?.message}
                            />
                            <InputField
                                label="Địa điểm làm việc"
                                placeholder="VD: Hồ Chí Minh, Hybrid"
                                {...register("location")}
                                error={errors.location?.message}
                            />
                        </div>

                        <div className={styles.editorGrid}>
                            <TextareaField
                                label="Mô tả công việc"
                                rows={10}
                                placeholder="Mô tả vai trò, phạm vi công việc, team, KPI..."
                                {...register("description")}
                                error={errors.description?.message}
                            />
                            <TextareaField
                                label="Yêu cầu ứng viên"
                                rows={10}
                                placeholder="Liệt kê kỹ năng, kinh nghiệm, yêu cầu phối hợp..."
                                {...register("requirements")}
                                error={errors.requirements?.message}
                            />
                        </div>

                        <Controller
                            control={control}
                            name="tags"
                            render={({ field }) => (
                                <SkillTagInput
                                    label="Tags kỹ năng"
                                    tags={field.value}
                                    onChange={field.onChange}
                                    error={errors.tags?.message}
                                    placeholder="Nhập React, TypeScript, Figma..."
                                />
                            )}
                        />
                    </section>

                    <section className={styles.card}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitle}>Điều kiện và thời hạn</div>
                        </div>

                        <div className={styles.detailsGrid}>
                            <InputField
                                label="Lương tối thiểu"
                                type="number"
                                min={0}
                                {...register("salary_min")}
                                error={errors.salary_min?.message}
                            />
                            <InputField
                                label="Lương tối đa"
                                type="number"
                                min={0}
                                {...register("salary_max")}
                                error={errors.salary_max?.message}
                            />
                            <InputField
                                label="Số năm kinh nghiệm"
                                type="number"
                                min={0}
                                {...register("years_of_experience")}
                                error={errors.years_of_experience?.message}
                            />
                            <div className={styles.formGroup}>
                                <label>Loại công việc</label>
                                <select className={styles.select} {...register("job_type")}>
                                    <option value="full_time">Toàn thời gian</option>
                                    <option value="part_time">Bán thời gian</option>
                                    <option value="remote">Làm việc từ xa</option>
                                </select>
                                {errors.job_type && (
                                    <span className={styles.error}>
                                        {errors.job_type.message}
                                    </span>
                                )}
                            </div>
                            <div className={styles.dateField}>
                                <InputField
                                    label="Hạn ứng tuyển"
                                    type="datetime-local"
                                    {...register("expired_at")}
                                    error={errors.expired_at?.message}
                                />
                            </div>
                        </div>
                    </section>

                    <div className={styles.inlineActions}>
                        <p className={styles.inlineActionsHint}>
                            Kiểm tra lại thông tin trước khi lưu hoặc chuẩn bị đăng.
                        </p>
                        <div className={styles.inlineActionButtons}>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={isSubmitting}
                                disabled={isLocked}
                                onClick={() => {
                                    setSubmitIntent("publish");
                                    void handleSubmit((data) => onSubmit(data, "publish"))();
                                }}
                            >
                                Đăng bài
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                loading={isSubmitting}
                                disabled={isLocked}
                                onClick={() => {
                                    setSubmitIntent("draft");
                                    void handleSubmit((data) => onSubmit(data, "draft"))();
                                }}
                            >
                                {mode === "create" ? "Lưu bản nháp" : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

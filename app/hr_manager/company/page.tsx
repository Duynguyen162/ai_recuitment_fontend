"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import styles from "./company.module.scss";
import InputField from "@/components/ui/InputField";
import TextareaField from "@/components/ui/TextareaField";
import Button from "@/components/ui/Button";
import apiClient from "@/lib/apiClient";
import LicenseUpload from "./_component/licenceUpload";
import LogoUpload from "./_component/logoUpload";
import { useRouter } from "next/navigation";

const schema = z.object({
    name: z.string().min(2, "Tên công ty là bắt buộc"),
    website: z.string().url("Link không hợp lệ").or(z.literal("")),
    size: z.string().min(1, "Chọn quy mô"),
    description: z.string().min(20, "Ít nhất 20 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export default function CompanyProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [verifyStatus, setVerifyStatus] = useState("unverified");
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
    const [resubmitting, setResubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await apiClient.get("/companies/my_company");
                const data = res.data.data;

                if (data) {
                    reset(data);
                    setVerifyStatus(data.verification_status);
                    setLogoPreview(data.logo_url);
                    setLogoUrl(data.logo_url);
                    setLicenseUrl(data.license_url);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            const payload = {
                ...values,
                website: values.website || "",
                logo_url: logoUrl,
                license_url: licenseUrl,
            };

            if (verifyStatus === "unverified") {
                if (!licenseUrl) {
                    toast.error("Vui lòng upload giấy phép kinh doanh");
                    return;
                }

                await apiClient.post("/companies/register_company", payload);
                toast.success("Đăng ký công ty thành công!");
                setVerifyStatus("pending");
            } else {
                await apiClient.put("/companies/company", payload);
                toast.success("Cập nhật thành công!");
            }
        } catch {
            toast.error("Có lỗi xảy ra!");
        }
    };
    const handleResubmit = async () => {
        if (!licenseUrl) {
            toast.error("Vui lòng tải lên giấy phép kinh doanh mới");
            return;
        }

        try {
            setResubmitting(true);
            const res = await apiClient.post("/companies/my_company/resubmit_verification", {
                license_url: licenseUrl
            });
            if (res.data?.success) {
                toast.success("Đã gửi lại yêu cầu xác minh thành công!");
                setVerifyStatus("pending");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error("Gửi lại yêu cầu thất bại!");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Gửi lại yêu cầu thất bại!");
        } finally {
            setResubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <Toaster />

            {verifyStatus === "" && (
                <div className={styles.statusBanner}>
                    <AlertTriangle size={18} />
                    <span>Hồ sơ chưa xác minh. Vui lòng gửi giấy phép.</span>
                </div>
            )}
            {verifyStatus === "rejected" && (
                <div className={styles.statusBannerRejected}>
                    <AlertTriangle size={18} />
                    <span>Đã bị từ chối , thông tin công ty không rõ ràng</span>
                </div>
            )}

            {verifyStatus === "pending" && (
                <div className={styles.statusBannerPending}>
                    <AlertTriangle size={18} />
                    <span>Đang chờ được admin duyệt</span>
                </div>
            )}

            {verifyStatus === "approved" && (
                <div className={styles.verifiedSuccess}>
                    <ShieldCheck size={18} />
                    <span>Doanh nghiệp đã xác thực</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.logoCard}>
                    <h2>Logo công ty</h2>
                    <LogoUpload
                        logoPreview={logoPreview}
                        setLogoPreview={setLogoPreview}
                        setLogoUrl={setLogoUrl}
                        disabled={verifyStatus === "pending"}
                    />
                </div>

                <div className={styles.sectionCard}>
                    <h2>Thông tin công ty</h2>

                    <InputField
                        label="Tên công ty"
                        {...register("name")}
                        error={errors.name?.message}
                        disabled={verifyStatus === "pending"}
                    />

                    <InputField
                        label="Website"
                        {...register("website")}
                        error={errors.website?.message}
                        disabled={verifyStatus === "pending"}
                    />

                    <div className={styles.formGroup}>
                        <label>Quy mô nhân sự</label>
                        <select
                            className={styles.select}
                            {...register("size")}
                            disabled={verifyStatus === "pending"}
                        >
                            <option value="">Chọn quy mô</option>
                            <option value="1-50">1-50 nhân viên</option>
                            <option value="51-200">51-200 nhân viên</option>
                            <option value="201-500">201-500 nhân viên</option>
                            <option value="500+">500+ nhân viên</option>
                        </select>

                        {errors.size && (
                            <span className={styles.error}>{errors.size.message}</span>
                        )}
                    </div>

                    <TextareaField
                        label="Mô tả công ty"
                        {...register("description")}
                        error={errors.description?.message}
                        disabled={verifyStatus === "pending"}
                    />
                </div>

                <div className={styles.sectionCard}>
                    <h2>Giấy phép kinh doanh</h2>
                    <LicenseUpload
                        licenseUrl={licenseUrl}
                        setLicenseUrl={setLicenseUrl}
                        disabled={verifyStatus === "pending"}
                    />
                    {licenseUrl && (
                        <img src={licenseUrl} alt="Giấy phép kinh doanh" />
                    )}
                </div>

                 <div className={styles.submitBtn} style={{ display: "flex", gap: "1rem" }}>
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={verifyStatus === "pending"}
                    >
                        {verifyStatus === "unverified"
                            ? "Gửi duyệt công ty"
                            : "Cập nhật thông tin"}
                    </Button>
                    {verifyStatus === "rejected" && (
                        <Button
                            type="button"
                            variant="primary"
                            loading={resubmitting}
                            onClick={handleResubmit}
                            disabled={!licenseUrl}
                        >
                            Gửi lại giấy phép
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}

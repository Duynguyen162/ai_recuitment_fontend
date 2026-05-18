"use client";

import React, {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
    useRef,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    Eye,
    Lock,
    Search,
    Sparkles,
    Users,
} from "lucide-react";
import cx from "classnames";
import toast, { Toaster } from "react-hot-toast";

import Button from "@/components/ui/Button";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import apiClient from "@/lib/apiClient";
import { previewFileFromServer } from "@/utils/fileUtils";

import AiReviewModal from "./_components/AiReviewModal";
import ApplicantsTable from "./_components/ApplicantsTable";
import InterviewNotesModal from "./_components/InterviewNotesModal";
import InterviewScheduleModal from "./_components/InterviewScheduleModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { TAB_ORDER, getTabLabel } from "./_lib/constants";
import { filterApplicants, formatJobStatus } from "./_lib/helpers";
import { normalizeApplicant, normalizeJob } from "./_lib/normalizers";
import {
    Applicant,
    AppStatus,
    CandidatesTab,
    HrJob,
    InterviewScheduleFormValues,
} from "./_lib/types";
import styles from "./candidates.module.scss";

export default function JobApplicantsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialJobIdRef = useRef(searchParams.get("jobId"));

    const [jobs, setJobs] = useState<HrJob[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<number | "all">(
        initialJobIdRef.current ? Number(initialJobIdRef.current) : "all",
    );
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalApplicants, setTotalApplicants] = useState(0);
    const [isFetchingBackground, setIsFetchingBackground] = useState(false);
    const [counts, setCounts] = useState<Record<CandidatesTab, number>>({
        all: 0, applied: 0, interviewing: 0, hired: 0, rejected: 0, withdrawn: 0, left_company: 0
    });
    const [activeTab, setActiveTab] = useState<CandidatesTab>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
        null,
    );
    const [scheduleApplicant, setScheduleApplicant] = useState<Applicant | null>(
        null,
    );
    const [notesApplicant, setNotesApplicant] = useState<Applicant | null>(null);
    const [confirmingAction, setConfirmingAction] = useState<{ applicant: Applicant; nextStatus: AppStatus } | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const { isVip, loading: loadingCompany } = useCompanyProfile();

    const fetchJobs = useCallback(async () => {
        setJobsLoading(true);
        try {
            const response = await apiClient.get("/job/get_jobs_create_by_hr", {
                params: { page: 1, page_size: 100 },
            });
            const rawJobs: unknown[] = Array.isArray(response.data?.data)
                ? (response.data.data as unknown[])
                : [];

            const normalizedJobs: HrJob[] = rawJobs
                .map(normalizeJob)
                .filter((job): job is HrJob => job !== null);

            setJobs(normalizedJobs);

            if (normalizedJobs.length === 0) {
                setSelectedJobId("all");
                setApplicants([]);
                return;
            }

            const preferredJobId =
                initialJobIdRef.current &&
                    normalizedJobs.some((job) => job.id === Number(initialJobIdRef.current))
                    ? Number(initialJobIdRef.current)
                    : "all";

            setSelectedJobId(preferredJobId);

            if (String(preferredJobId) !== initialJobIdRef.current && preferredJobId !== "all") {
                router.replace(`/hr_manager/candidates?jobId=${preferredJobId}`, { scroll: false });
            } else if (preferredJobId === "all" && initialJobIdRef.current) {
                router.replace(`/hr_manager/candidates`, { scroll: false });
            }
        } catch {
            toast.error("Không thể tải danh sách job");
            setJobs([]);
            setSelectedJobId("all");
        } finally {
            setJobsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedApplicant(null);
                setScheduleApplicant(null);
                setNotesApplicant(null);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    useEffect(() => {
        const fetchApplicants = async () => {
            if (applicants.length === 0) {
                setApplicantsLoading(true);
            }
            setIsFetchingBackground(true);
            try {
                // TODO: Gọi API đếm số lượng (stats) theo job để hiển thị trên Tab
                const statsEndpoint = selectedJobId !== "all"
                    ? `/application/hr/candidates/stats?job_id=${selectedJobId}`
                    : `/application/hr/candidates/stats`;
                const statsRes = await apiClient.get(statsEndpoint);
                setCounts(statsRes.data);

                // TODO: Gọi API lấy danh sách với phân trang, lọc status, search
                const params = new URLSearchParams({
                    page: String(page),
                    page_size: String(pageSize),
                });

                if (selectedJobId !== "all") {
                    params.append("job_id", String(selectedJobId));
                }

                if (activeTab !== "all") {
                    params.append("status", activeTab);
                }

                if (deferredSearchQuery) {
                    params.append("search", deferredSearchQuery);
                }

                const endpoint = `/application/hr/candidates?${params.toString()}`;
                const response = await apiClient.get(endpoint);

                const rawApplicants: unknown[] = Array.isArray(response.data?.data)
                    ? (response.data.data as unknown[])
                    : [];

                const normalizedApplicants: Applicant[] = rawApplicants
                    .map(normalizeApplicant)
                    .filter((app): app is Applicant => app !== null);

                setApplicants(normalizedApplicants);
                setTotalApplicants(response.data?.total || normalizedApplicants.length);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    toast.error("Vui lòng cập nhật API backend: thêm endpoint lấy ứng viên có phân trang");
                } else {
                    toast.error("Không thể tải danh sách ứng viên");
                }
                setApplicants([]);
                setTotalApplicants(0);
            } finally {
                setApplicantsLoading(false);
                setIsFetchingBackground(false);
            }
        };

        fetchApplicants();
    }, [selectedJobId, activeTab, deferredSearchQuery, page, pageSize]);

    useEffect(() => {
        setActiveTab("all");
        setSearchQuery("");
        setPage(1);
        setSelectedApplicant(null);
        setScheduleApplicant(null);
        setNotesApplicant(null);
    }, [selectedJobId]);

    const selectedJob = useMemo(
        () => jobs.find((job) => job.id === selectedJobId) ?? null,
        [jobs, selectedJobId],
    );

    const openAiReview = (applicant: Applicant) => {
        if (!isVip) {
            toast("Cần gói VIP để xem chi tiết nhận xét AI");
            return;
        }

        setSelectedApplicant(applicant);
    };

    const handleSelectJob = (jobId: number | "all") => {
        setSelectedJobId(jobId);
        if (jobId === "all") {
            router.replace(`/hr_manager/candidates`, { scroll: false });
        } else {
            router.replace(`/hr_manager/candidates?jobId=${jobId}`, {
                scroll: false,
            });
        }
    };

    const updateApplicantState = (
        applicantId: string,
        updates: Partial<Applicant>,
        successMessage: string,
    ) => {

        setApplicants((prev) =>
            prev.map((app) =>
                app.id === applicantId ? { ...app, ...updates } : app,
            ),
        );
        toast.success(successMessage);
    };

    const handleStatusAction = async (applicant: Applicant, nextStatus: AppStatus) => {
        if (nextStatus === "interviewing") {
            setScheduleApplicant(applicant);
            return;
        }

        if (nextStatus === "hired" || nextStatus === "rejected") {
            setConfirmingAction({ applicant, nextStatus });
            return;
        }

        try {
            await apiClient.put(`/application/${applicant.application_id}/status`, {
                status: nextStatus,
            });

            updateApplicantState(
                applicant.id,
                { status: nextStatus },
                "Đã cập nhật trạng thái ứng viên",
            );
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái ứng viên");
        }
    };

    const executeConfirmedStatusAction = async () => {
        if (!confirmingAction) return;
        const { applicant, nextStatus } = confirmingAction;

        setIsUpdatingStatus(true);
        try {
            await apiClient.put(`/application/${applicant.application_id}/status`, {
                status: nextStatus,
            });

            updateApplicantState(
                applicant.id,
                { status: nextStatus },
                nextStatus === "hired"
                    ? "Đã cập nhật ứng viên sang tuyển dụng"
                    : "Đã từ chối ứng viên",
            );
            setConfirmingAction(null);
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái ứng viên");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveInterviewSchedule = async (values: InterviewScheduleFormValues) => {
        if (!scheduleApplicant) return;

        try {
            const payload = {
                interview_time: new Date(values.interview_time).toISOString(),
                meeting_link: values.meeting_link,
                location: values.location,
                notes: values.notes,
            };

            if (scheduleApplicant.interview?.id) {
                await apiClient.put(
                    `/interview/schedules/${scheduleApplicant.interview.id}`,
                    payload
                );
            } else {
                await apiClient.post("/interview/schedules", {
                    ...payload,
                    application_id: scheduleApplicant.application_id,
                });
            }

            updateApplicantState(
                scheduleApplicant.id,
                {
                    status: "interviewing",
                    interview: {
                        ...scheduleApplicant.interview,
                        interview_time: values.interview_time,
                        meeting_link: values.meeting_link,
                        location: values.location,
                        notes: values.notes,
                        mode: values.mode,
                    },
                },
                "Đã lưu lịch phỏng vấn",
            );
            setScheduleApplicant(null);
        } catch (error) {
            toast.error("Không thể lưu lịch phỏng vấn");
        }
    };

    const handleSaveInterviewNotes = async (note: string) => {
        if (!notesApplicant) return;
        try {
            const response = await apiClient.put(
                `/interview/schedules/${notesApplicant.application_id}/note`,
                { notes: note, }
            );
            console.log(response.data);

            updateApplicantState(
                notesApplicant.id,
                { notes: note },
                note ? "Đã lưu ghi chú phỏng vấn" : "Đã xóa ghi chú phỏng vấn",
            );

        } catch (error) {
            toast.error("Không thể lưu ghi chú phỏng vấn")
        }

        setNotesApplicant(null);
    };

    const handlePreviewCV = async (applicationId: number | null) => {
        try {
            await previewFileFromServer(`/application/hr/${applicationId}/cv/view`);
        } catch {
            toast.error("Không thể mở file CV lúc này");
        }
    };

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.header}>
                    <div>
                        <h1>Ứng viên theo từng job</h1>
                        <p>
                            Chọn một job ở cột bên trái để xem đúng danh sách ứng viên đã ứng
                            tuyển vào job đó.
                        </p>
                    </div>
                    {!loadingCompany && !isVip && (
                        <Link href="/hr_manager/pricing" className={styles.upgradeCta}>
                            Nâng cấp VIP
                            <ArrowRight size={16} />
                        </Link>
                    )}
                </div>

                <div className={styles.aiGateCard}>
                    <div className={styles.aiGateHeader}>
                        <div className={styles.aiGateIcon}>
                            {isVip ? <Sparkles size={18} /> : <Lock size={18} />}
                        </div>
                        <div>
                            <h3>AI đánh giá ứng viên</h3>
                            <p>
                                {isVip
                                    ? "Bạn đang mở khóa điểm AI và bảng nhận xét chi tiết cho từng ứng viên."
                                    : "Điểm AI và chi tiết nhận xét đang bị khóa. Nâng cấp VIP để mở khóa ngay trong danh sách ứng viên."}
                            </p>
                        </div>
                    </div>

                    <div className={styles.aiGateFeatures}>
                        <div className={styles.aiFeature}>
                            <Sparkles size={16} />
                            AI Match Score theo từng CV
                        </div>
                        <div className={styles.aiFeature}>
                            <Eye size={16} />
                            Popup nhận xét điểm mạnh, rủi ro, khuyến nghị
                        </div>
                    </div>
                </div>

                <div className={styles.workspace} style={{ display: 'block' }}>
                    <section className={styles.applicantsPanel} style={{ width: '100%' }}>
                        <div className={styles.filterSection}>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryCard}>
                                    <span>Tổng ứng viên</span>
                                    <strong>{counts.all}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span>Mới nộp</span>
                                    <strong>{counts.applied}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span>Phỏng vấn</span>
                                    <strong>{counts.interviewing}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span>Đã nhận</span>
                                    <strong>{counts.hired}</strong>
                                </div>
                            </div>

                            <div className={styles.tabs} style={{ marginTop: '1.5rem' }}>
                                {TAB_ORDER.map((tab) => (
                                    <button
                                        key={tab}
                                        className={cx(styles.tabBtn, {
                                            [styles.active]: activeTab === tab,
                                        })}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setPage(1);
                                        }}
                                    >
                                        {getTabLabel(tab)}
                                        <span className={styles.count}>
                                            {tab === "all" ? counts.all : counts[tab]}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className={styles.toolbar} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div className={styles.searchBox} style={{ flex: 1, minWidth: '250px' }}>
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên, email hoặc tên CV..."
                                        value={searchQuery}
                                        onChange={(event) => {
                                            setSearchQuery(event.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className={styles.jobFilterWrapper} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontWeight: 400, whiteSpace: 'nowrap', color: 'black' }}>Lọc:</label>
                                    <select
                                        value={selectedJobId}
                                        onChange={(e) => {
                                            handleSelectJob(e.target.value === "all" ? "all" : Number(e.target.value));
                                        }}
                                        style={{ padding: '0.5rem', color: '#000000ff', borderRadius: '6px', border: '1px solid #e2e8f0', minWidth: '200px' }}
                                    >
                                        <option value="all">Tất cả Job</option>
                                        {jobs.map(job => (
                                            <option key={job.id} value={job.id}>{job.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <ApplicantsTable
                                applicants={applicants}
                                jobsLoading={jobsLoading}
                                applicantsLoading={applicantsLoading}
                                loadingCompany={loadingCompany}
                                activeTab={activeTab}
                                isVip={isVip}
                                page={page}
                                pageSize={pageSize}
                                totalApplicants={totalApplicants}
                                isFetchingBackground={isFetchingBackground}
                                onPageChange={setPage}
                                onPreviewCv={handlePreviewCV}
                                onOpenAiReview={openAiReview}
                                onSelectAction={handleStatusAction}
                                onOpenNotes={setNotesApplicant}
                            />
                        </div>
                    </section>
                </div>
                <Toaster />
            </div>

            <AiReviewModal
                applicant={selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
                onPreviewCv={handlePreviewCV}
            />

            <InterviewScheduleModal
                key={scheduleApplicant?.id ?? "schedule-modal"}
                applicant={scheduleApplicant}
                onClose={() => setScheduleApplicant(null)}
                onSave={handleSaveInterviewSchedule}
            />

            <InterviewNotesModal
                key={notesApplicant?.id ?? "notes-modal"}
                applicant={notesApplicant}
                onClose={() => setNotesApplicant(null)}
                onSave={handleSaveInterviewNotes}
            />

            <ConfirmModal
                isOpen={!!confirmingAction}
                title={confirmingAction?.nextStatus === "hired" ? "Xác nhận tuyển dụng" : "Xác nhận từ chối"}
                message={
                    confirmingAction
                        ? (confirmingAction.nextStatus === "hired"
                            ? `Bạn có chắc chắn muốn chuyển ứng viên "${confirmingAction.applicant.candidate_name}" sang trạng thái Tuyển dụng?`
                            : `Bạn có chắc chắn muốn từ chối ứng viên "${confirmingAction.applicant.candidate_name}"?`)
                        : ""
                }
                confirmText={confirmingAction?.nextStatus === "hired" ? "Tuyển dụng" : "Từ chối"}
                cancelText="Hủy"
                onConfirm={executeConfirmedStatusAction}
                onCancel={() => setConfirmingAction(null)}
                isLoading={isUpdatingStatus}
                isDestructive={confirmingAction?.nextStatus === "rejected"}
            />
        </>
    );
}
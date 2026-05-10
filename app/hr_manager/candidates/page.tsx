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
import JobSidebar from "./_components/JobSidebar";
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
    const [selectedJobId, setSelectedJobId] = useState<number | null>(
        initialJobIdRef.current ? Number(initialJobIdRef.current) : null,
    );
    const [applicants, setApplicants] = useState<Applicant[]>([]);
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
                setSelectedJobId(null);
                setApplicants([]);
                return;
            }

            const preferredJobId =
                initialJobIdRef.current &&
                    normalizedJobs.some((job) => job.id === Number(initialJobIdRef.current))
                    ? Number(initialJobIdRef.current)
                    : normalizedJobs[0].id;

            setSelectedJobId(preferredJobId);

            if (String(preferredJobId) !== initialJobIdRef.current) {
                router.replace(`/hr_manager/candidates?jobId=${preferredJobId}`, { scroll: false });
            }
        } catch {
            toast.error("Không thể tải danh sách job");
            setJobs([]);
            setSelectedJobId(null);
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
        if (!selectedJobId) {
            setApplicants([]);
            return;
        }

        const fetchApplicants = async () => {
            setApplicantsLoading(true);
            try {
                const response = await apiClient.get(
                    `/application/list_candidate/${selectedJobId}`,
                );
                const rawApplicants: unknown[] = Array.isArray(response.data?.data)
                    ? (response.data.data as unknown[])
                    : [];

                const normalizedApplicants: Applicant[] = rawApplicants
                    .map(normalizeApplicant)
                    .filter((app): app is Applicant => app !== null);

                setApplicants(normalizedApplicants);
            } catch {
                toast.error("Không thể tải danh sách ứng viên của job này");
                setApplicants([]);
            } finally {
                setApplicantsLoading(false);
            }
        };

        fetchApplicants();
    }, [selectedJobId]);

    useEffect(() => {
        setActiveTab("all");
        setSearchQuery("");
        setSelectedApplicant(null);
        setScheduleApplicant(null);
        setNotesApplicant(null);
    }, [selectedJobId]);

    const selectedJob = useMemo(
        () => jobs.find((job) => job.id === selectedJobId) ?? null,
        [jobs, selectedJobId],
    );

    const counts = useMemo(
        () => ({
            all: applicants.length,
            applied: applicants.filter((app) => app.status === "applied").length,
            interviewing: applicants.filter((app) => app.status === "interviewing")
                .length,
            hired: applicants.filter((app) => app.status === "hired").length,
            rejected: applicants.filter((app) => app.status === "rejected").length,
            withdrawn: applicants.filter((app) => app.status === "withdrawn").length,
            left_company: applicants.filter((app) => app.status === "left_company").length,
        }),
        [applicants],
    );

    const filteredApplicants = useMemo(
        () => filterApplicants(applicants, activeTab, deferredSearchQuery),
        [activeTab, applicants, deferredSearchQuery],
    );

    const openAiReview = (applicant: Applicant) => {
        if (!isVip) {
            toast("Cần gói VIP để xem chi tiết nhận xét AI");
            return;
        }

        setSelectedApplicant(applicant);
    };

    const handleSelectJob = (jobId: number) => {
        setSelectedJobId(jobId);
        router.replace(`/hr_manager/candidates?jobId=${jobId}`, {
            scroll: false,
        });
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

        try {
            await apiClient.put(`/application/${applicant.application_id}/status`, {
                status: nextStatus,
            });

            updateApplicantState(
                applicant.id,
                { status: nextStatus },
                nextStatus === "hired"
                    ? "Đã cập nhật ứng viên sang tuyển dụng"
                    : "Đã cập nhật trạng thái ứng viên",
            );
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái ứng viên");
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

                <div className={styles.workspace}>
                    <JobSidebar
                        jobs={jobs}
                        jobsLoading={jobsLoading}
                        selectedJobId={selectedJobId}
                        onSelectJob={handleSelectJob}
                    // onRefresh={() => window.location.reload()}
                    />

                    <section className={styles.applicantsPanel}>
                        <div className={styles.selectedJobHero}>
                            {selectedJob ? (
                                <>
                                    <div>
                                        <span className={styles.panelEyebrow}>Job đang chọn</span>
                                        <h2>{selectedJob.title}</h2>
                                        <div className={styles.heroMeta}>
                                            <span>
                                                <BriefcaseBusiness size={14} />
                                                {formatJobStatus(selectedJob.status)}
                                            </span>
                                            <span>
                                                <Users size={14} />
                                                {counts.all} ứng viên
                                            </span>
                                            <span>
                                                <CalendarDays size={14} />
                                                {selectedJob.location}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href="/hr_manager/jobs">
                                        <Button variant="outline">Về danh sách job</Button>
                                    </Link>
                                </>
                            ) : (
                                <div className={styles.emptyHero}>
                                    Chọn một job để bắt đầu xem ứng viên.
                                </div>
                            )}
                        </div>

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

                        <div className={styles.filterSection}>
                            <div className={styles.tabs}>
                                {TAB_ORDER.map((tab) => (
                                    <button
                                        key={tab}
                                        className={cx(styles.tabBtn, {
                                            [styles.active]: activeTab === tab,
                                        })}
                                        onClick={() => setActiveTab(tab)}
                                        disabled={!selectedJob}
                                    >
                                        {getTabLabel(tab)}
                                        <span className={styles.count}>
                                            {tab === "all" ? counts.all : counts[tab]}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className={styles.toolbar}>
                                <div className={styles.searchBox}>
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên, email hoặc tên CV..."
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        disabled={!selectedJob}
                                    />
                                </div>
                            </div>

                            <ApplicantsTable
                                applicants={filteredApplicants}
                                jobsLoading={jobsLoading}
                                applicantsLoading={applicantsLoading}
                                loadingCompany={loadingCompany}
                                activeTab={activeTab}
                                hasSelectedJob={Boolean(selectedJob)}
                                isVip={isVip}
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
        </>
    );
}
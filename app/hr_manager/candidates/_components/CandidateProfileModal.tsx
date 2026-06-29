"use client";

import { useEffect, useState } from "react";
import {
    X, User, Mail, Phone, MapPin, Calendar, Briefcase,
    GraduationCap, Award, Layers, Loader2, Clock, Video,
    ExternalLink, Edit3, CalendarDays
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import styles from "../candidates.module.scss";
import { InterviewSchedule } from "../_lib/types";

function getAvatarUrl(url: string | null | undefined) {
    if (!url) return undefined;
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/${url}`;
}

interface Experience {
    company_name: string;
    job_title: string;
    description?: string;
}
interface Education {
    school: string;
    degree: string;
    major?: string;
    start_date: string;
    end_date?: string;
}
interface Certification {
    name: string;
    issuer?: string;
    issued_date?: string;
}
interface ProfileData {
    candidate_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    summary?: string;
    experiences?: Experience[];
    educations?: Education[];
    certifications?: Certification[];
    skills?: string[];
    avatar_url?: string;
    interview?: InterviewSchedule | null;
}

interface CandidateProfileModalProps {
    applicationId: number;
    candidateName: string;
    email: string;
    onClose: () => void;
    onReschedule?: () => void;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "2px solid #e2e8f0" }}>
                <span style={{ color: "#3b82f6" }}>{icon}</span>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>{title}</h4>
            </div>
            {children}
        </div>
    );
}

export default function CandidateProfileModal({
    applicationId,
    candidateName,
    email,
    onClose,
    onReschedule,
}: CandidateProfileModalProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "interview">("profile");

    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get(`/application/hr/${applicationId}/candidate_profile`);
                if (mounted) setProfile(res.data?.data ?? res.data);
            } catch {
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, [applicationId]);

    const name = profile?.full_name || profile?.candidate_name || candidateName;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div style={{ overflow: 'hidden', width: '100%', maxWidth: '680px', borderRadius: '20px' }}>
                <div
                    className={styles.formModalCard}
                    style={{ width: '100%', maxWidth: '680px', maxHeight: "85vh", overflowY: "auto", display: 'flex', flexDirection: 'column', padding: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={styles.modalHeader} style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.25rem", flexShrink: 0, overflow: "hidden" }}>
                                {profile?.avatar_url ? (
                                    <img src={getAvatarUrl(profile.avatar_url)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Hồ sơ trực tuyến</h3>
                                <p style={{ margin: 0, opacity: 0.7 }}>{name} • {email}</p>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
                    </div>

                    {/* Tab Selection */}
                    {profile && !loading && !error && (
                        <div className={styles.modalTabs} style={{ display: "flex", gap: "0.5rem", padding: "0 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <button
                                className={`${styles.modalTabBtn} ${activeTab === "profile" ? styles.active : ""}`}
                                onClick={() => setActiveTab("profile")}
                            >
                                Chi tiết hồ sơ
                            </button>
                            <button
                                className={`${styles.modalTabBtn} ${activeTab === "interview" ? styles.active : ""}`}
                                onClick={() => setActiveTab("interview")}
                            >
                                Lịch phỏng vấn & Ghi chú
                            </button>
                        </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
                        {loading && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "3rem", color: "#64748b" }}>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Đang tải hồ sơ ứng viên...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>
                                Không thể tải hồ sơ ứng viên. Vui lòng thử lại sau.
                            </div>
                        )}

                        {profile && !loading && !error && (
                            <>
                                {activeTab === "profile" && (
                                    <>
                                        {/* Thông tin cá nhân */}
                                        <Section icon={<User size={16} />} title="Thông tin cá nhân">
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                                <InfoRow icon={<Mail size={14} />} label="Email" value={profile.email || email} />
                                                {profile.phone && <InfoRow icon={<Phone size={14} />} label="Điện thoại" value={profile.phone} />}
                                                {profile.address && <InfoRow icon={<MapPin size={14} />} label="Địa chỉ" value={profile.address} />}
                                                {profile.date_of_birth && <InfoRow icon={<Calendar size={14} />} label="Ngày sinh" value={new Date(profile.date_of_birth).toLocaleDateString("vi-VN")} />}
                                            </div>
                                            {profile.summary && (
                                                <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#475569", lineHeight: 1.6 }}>
                                                    {profile.summary}
                                                </div>
                                            )}
                                        </Section>

                                        {/* Kỹ năng */}
                                        {profile.skills && profile.skills.length > 0 && (
                                            <Section icon={<Layers size={16} />} title="Kỹ năng">
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                                    {profile.skills.map((skill, i) => (
                                                        <span key={i} style={{ background: "#eff6ff", color: "#2563eb", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </Section>
                                        )}

                                        {/* Kinh nghiệm làm việc */}
                                        {profile.experiences && profile.experiences.length > 0 && (
                                            <Section icon={<Briefcase size={16} />} title="Kinh nghiệm làm việc">
                                                {profile.experiences.map((exp, i) => (
                                                    <div key={i} style={{ marginBottom: "1rem", paddingLeft: "0.75rem", borderLeft: "2px solid #e2e8f0" }}>
                                                        <div style={{ color: "#000000ff", fontWeight: 600, fontSize: "0.8rem", marginTop: "0.15rem" }}>
                                                            {exp.job_title} - {exp.company_name}
                                                        </div>
                                                        {exp.description && (
                                                            <div style={{ marginTop: "0.4rem", fontSize: "0.85rem", color: "#475569", lineHeight: 1.5 }}>{exp.description}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </Section>
                                        )}

                                        {/* Học vấn */}
                                        {profile.educations && profile.educations.length > 0 && (
                                            <Section icon={<GraduationCap size={16} />} title="Học vấn">
                                                {profile.educations.map((edu, i) => (
                                                    <div key={i} style={{ marginBottom: "0.75rem", paddingLeft: "0.75rem", borderLeft: "2px solid #e2e8f0" }}>
                                                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{edu.school}</div>
                                                        <div style={{ color: "#475569", fontSize: "0.85rem" }}>
                                                            {edu.degree}{edu.major ? ` • ${edu.major}` : ""}
                                                        </div>
                                                    </div>
                                                ))}
                                            </Section>
                                        )}

                                        {/* Chứng chỉ */}
                                        {profile.certifications && profile.certifications.length > 0 && (
                                            <Section icon={<Award size={16} />} title="Chứng chỉ">
                                                {profile.certifications.map((cert, i) => (
                                                    <div key={i} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>{cert.name}</div>
                                                            {cert.issuer && <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{cert.issuer}</div>}
                                                        </div>
                                                        {cert.issued_date && (
                                                            <span style={{ color: "#94a3b8", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{cert.issued_date}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </Section>
                                        )}
                                    </>
                                )}

                                {activeTab === "interview" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                        {profile.interview ? (
                                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1.5rem", position: "relative" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1d4ed8", fontWeight: 700, fontSize: "1rem" }}>
                                                        <CalendarDays size={18} />
                                                        Chi tiết Lịch hẹn
                                                    </div>
                                                    <span style={{
                                                        padding: "0.25rem 0.75rem",
                                                        borderRadius: "999px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        background: new Date(profile.interview.interview_time) > new Date() ? "#eff6ff" : "#f1f5f9",
                                                        color: new Date(profile.interview.interview_time) > new Date() ? "#1d4ed8" : "#475569"
                                                    }}>
                                                        {new Date(profile.interview.interview_time) > new Date() ? "Sắp diễn ra" : "Đã diễn ra"}
                                                    </span>
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        <Clock size={16} style={{ color: "#64748b" }} />
                                                        <div>
                                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>THỜI GIAN</div>
                                                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>
                                                                {new Date(profile.interview.interview_time).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        {profile.interview.meeting_link ? (
                                                            <Video size={16} style={{ color: "#2563eb" }} />
                                                        ) : (
                                                            <MapPin size={16} style={{ color: "#e11d48" }} />
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                                                                {profile.interview.meeting_link ? "PHÒNG HỌP TRỰC TUYẾN" : "ĐỊA ĐIỂM"}
                                                            </div>
                                                            {profile.interview.meeting_link ? (
                                                                <a
                                                                    href={profile.interview.meeting_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "underline" }}
                                                                >
                                                                    Tham gia họp trực tuyến
                                                                    <ExternalLink size={12} />
                                                                </a>
                                                            ) : (
                                                                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>
                                                                    {profile.interview.location || "Đang cập nhật"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {profile.interview.notes && (
                                                    <div style={{ background: "#fffbeb", border: "1px dashed #fcd34d", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
                                                        <div style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: 700, marginBottom: "0.25rem" }}>GHI CHÚ / MÔ TẢ:</div>
                                                        <div style={{ fontSize: "0.85rem", color: "#78350f", lineHeight: 1.5 }}>
                                                            {profile.interview.notes}
                                                        </div>
                                                    </div>
                                                )}

                                                {onReschedule && (
                                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                        <button
                                                            onClick={onReschedule}
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "0.375rem",
                                                                padding: "0.5rem 1rem",
                                                                background: "#fff",
                                                                border: "1px solid #cbd5e1",
                                                                borderRadius: "8px",
                                                                color: "#334155",
                                                                fontWeight: 600,
                                                                fontSize: "0.85rem",
                                                                cursor: "pointer",
                                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                                transition: "all 0.15s ease"
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#fff"; }}
                                                        >
                                                            <Edit3 size={14} />
                                                            Đổi lịch phỏng vấn
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: "center", padding: "3rem 1.5rem", border: "1px dashed #cbd5e1", borderRadius: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                                                <CalendarDays size={40} style={{ color: "#94a3b8" }} />
                                                <div>
                                                    <h4 style={{ margin: 0, color: "#1e293b", fontSize: "0.95rem", fontWeight: 700 }}>Chưa thiết lập lịch phỏng vấn</h4>
                                                    <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                                                        Ứng viên này chưa có lịch hẹn phỏng vấn nào được lên kế hoạch.
                                                    </p>
                                                </div>
                                                {onReschedule && (
                                                    <button
                                                        onClick={onReschedule}
                                                        style={{
                                                            padding: "0.5rem 1rem",
                                                            background: "#2563eb",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            color: "#fff",
                                                            fontWeight: 600,
                                                            fontSize: "0.85rem",
                                                            cursor: "pointer",
                                                            boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
                                                            transition: "all 0.15s ease"
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                                                    >
                                                        Thiết lập lịch ngay
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontSize: "0.875rem", color: "#1e293b", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ color: "#64748b" }}>{icon}</span>
                {value}
            </span>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import {
    X, User, Mail, Phone, MapPin, Calendar, Briefcase,
    GraduationCap, Award, Layers, Loader2
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import styles from "../candidates.module.scss";

interface Experience {
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
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
}

interface CandidateProfileModalProps {
    applicationId: number;
    candidateName: string;
    email: string;
    onClose: () => void;
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
}: CandidateProfileModalProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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
            <div style={{ overflow: 'hidden', maxWidth: 'fit-content', borderRadius: '20px' }}>
                <div
                    className={styles.formModalCard}
                    style={{ width: 'auto', maxWidth: '680px', maxHeight: "85vh", overflowY: "auto" }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={styles.modalHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.25rem", flexShrink: 0 }}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Hồ sơ trực tuyến</h3>
                                <p style={{ margin: 0, opacity: 0.7 }}>{name} • {email}</p>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "0 0.25rem" }}>
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

                        {profile && !loading && (
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
                                                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{exp.position}</div>
                                                <div style={{ color: "#3b82f6", fontSize: "0.85rem", fontWeight: 600 }}>{exp.company}</div>
                                                <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                                                    {exp.start_date} – {exp.end_date || "Hiện tại"}
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
                                                <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                                                    {edu.start_date} – {edu.end_date || "Hiện tại"}
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

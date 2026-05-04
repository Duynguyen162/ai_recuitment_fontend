"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Lock,
  CheckSquare,
  Sparkles,
  Eye,
  ArrowRight,
  X,
  TriangleAlert,
  BadgeCheck,
  CircleAlert,
} from "lucide-react";
import cx from "classnames";
import styles from "./candidates.module.scss";
import Button from "@/components/ui/Button";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

type AppStatus = "applied" | "interviewing" | "hired" | "rejected";

interface Applicant {
  id: string;
  candidate_name: string;
  email: string;
  applied_at: string;
  ai_score: number;
  ai_summary: string;
  ai_strengths: string[];
  ai_risks: string[];
  recommendation: string;
  status: AppStatus;
}

export default function JobApplicantsPage() {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | AppStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const { isVip, loading: loadingCompany } = useCompanyProfile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Thay bằng API thật khi backend sẵn sàng.
        // const res = await apiClient.get(`/hr/jobs/${jobId}/applicants`, {
        //   params: { status: activeTab === "all" ? undefined : activeTab, q: searchQuery },
        // });
        // setApplicants(res.data.data);
        setApplicants([
          {
            id: "app-1",
            candidate_name: "Nguyễn Quang Duy",
            email: "duy@gmail.com",
            applied_at: "2026-04-28",
            ai_score: 92,
            ai_summary:
              "Ứng viên có độ phù hợp rất cao với JD Frontend, nền tảng React mạnh và có tư duy sản phẩm tốt.",
            ai_strengths: [
              "Kinh nghiệm React và TypeScript bám sát yêu cầu vị trí.",
              "Có dự án thực tế với tối ưu hiệu năng và kiến trúc component.",
              "Khả năng trình bày rõ ràng, CV nêu bật thành tích định lượng.",
            ],
            ai_risks: [
              "Kinh nghiệm dẫn dắt đội nhóm chưa thể hiện rõ trong CV.",
              "Cần xác minh thêm khả năng mentoring junior.",
            ],
            recommendation:
              "Nên ưu tiên mời phỏng vấn vòng 1 trong nhóm ứng viên đầu tiên.",
            status: "applied",
          },
          {
            id: "app-2",
            candidate_name: "Trần Lê B",
            email: "tranleb@gmail.com",
            applied_at: "2026-04-27",
            ai_score: 75,
            ai_summary:
              "Ứng viên có nền tảng backend tốt nhưng cần đánh giá thêm mức độ phù hợp với môi trường sản phẩm tăng trưởng nhanh.",
            ai_strengths: [
              "Có kinh nghiệm Node.js và thiết kế API rõ ràng.",
              "Từng làm việc với môi trường production và CI/CD.",
            ],
            ai_risks: [
              "Chưa thấy rõ kinh nghiệm với microservice quy mô lớn.",
              "Thiếu minh chứng về phối hợp liên phòng ban.",
            ],
            recommendation:
              "Phù hợp để phỏng vấn sâu thêm về hệ thống và khả năng phối hợp.",
            status: "interviewing",
          },
          {
            id: "app-3",
            candidate_name: "Lê Thị C",
            email: "lethic@gmail.com",
            applied_at: "2026-04-26",
            ai_score: 45,
            ai_summary:
              "Mức độ phù hợp hiện tại thấp do thiếu các kỹ năng chính và chưa có kinh nghiệm sát với vị trí đang tuyển.",
            ai_strengths: [
              "CV trình bày gọn, có thái độ học hỏi tốt.",
            ],
            ai_risks: [
              "Thiếu kỹ năng chuyên môn cốt lõi theo JD.",
              "Kinh nghiệm thực tế trong domain liên quan còn hạn chế.",
            ],
            recommendation:
              "Chỉ nên giữ trong nhóm dự phòng nếu công ty có thể đào tạo thêm.",
            status: "rejected",
          },
        ]);
      } catch {
        toast.error("Không thể tải danh sách ứng viên");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedApplicant(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleStatusUpdate = async (appId: string, newStatus: AppStatus) => {
    try {
      // TODO: Thay bằng API cập nhật trạng thái ứng viên.
      // await apiClient.put(`/hr/applications/${appId}/status`, { status: newStatus });
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app,
        ),
      );
      toast.success("Đã cập nhật trạng thái");
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const openAiReview = (applicant: Applicant) => {
    if (!isVip) {
      toast("Cần gói VIP để xem chi tiết nhận xét AI");
      return;
    }

    setSelectedApplicant(applicant);
  };

  const getScoreTone = (score: number) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  const getCount = (status: "all" | AppStatus) => {
    if (status === "all") return applicants.length;
    return applicants.filter((app) => app.status === status).length;
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchKeyword =
      app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchKeyword;
    return matchKeyword && app.status === activeTab;
  });

  return (
    <>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <div>
            <h1>Danh sách ứng viên</h1>
            <p>
              Theo dõi hồ sơ, điểm AI và mở nhận xét chi tiết trong cửa sổ riêng.
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

        <div className={styles.filterSection}>
          <div className={styles.tabs}>
            {(
              ["all", "applied", "interviewing", "hired", "rejected"] as const
            ).map((status) => (
              <button
                key={status}
                className={cx(styles.tabBtn, {
                  [styles.active]: activeTab === status,
                })}
                onClick={() => setActiveTab(status)}
              >
                {status === "all"
                  ? "Tất cả"
                  : status === "applied"
                    ? "Mới nộp"
                    : status === "interviewing"
                      ? "Đang phỏng vấn"
                      : status === "hired"
                        ? "Đã tuyển"
                        : "Từ chối"}
                <span className={styles.count}>{getCount(status)}</span>
              </button>
            ))}
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <CheckSquare size={16} color="#94a3b8" />
                  </th>
                  <th>Ứng viên</th>
                  <th>Ngày nộp</th>
                  <th>
                    <div className={styles.aiHeading}>
                      AI Match <Sparkles size={14} color="#14b8a6" />
                    </div>
                  </th>
                  <th>Chi tiết nhận xét</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading || loadingCompany ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                      Không có ứng viên nào.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <div className={styles.candidateInfo}>
                          <div className={styles.avatar}>
                            {app.candidate_name.charAt(0)}
                          </div>
                          <div>
                            <div className={styles.name}>{app.candidate_name}</div>
                            <div className={styles.email}>{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(app.applied_at).toLocaleDateString("vi-VN")}</td>
                      <td>
                        {isVip ? (
                          <div
                            className={cx(
                              styles.aiScore,
                              styles[getScoreTone(app.ai_score)],
                            )}
                          >
                            {app.ai_score}
                          </div>
                        ) : (
                          <Link
                            href="/hr_manager/pricing"
                            className={styles.lockedAi}
                            title="Nâng cấp VIP để xem điểm"
                          >
                            <Lock size={14} />
                            VIP
                          </Link>
                        )}
                      </td>
                      <td>
                        {isVip ? (
                          <button
                            className={styles.reviewBtn}
                            onClick={() => openAiReview(app)}
                          >
                            <Eye size={14} />
                            Xem nhận xét AI
                          </button>
                        ) : (
                          <Link
                            href="/hr_manager/pricing"
                            className={styles.lockedRemark}
                          >
                            <Lock size={14} />
                            Mở khóa nhận xét AI
                          </Link>
                        )}
                      </td>
                      <td>
                        <span
                          className={cx(styles.statusBadge, styles[app.status])}
                        >
                          {app.status === "applied"
                            ? "Chờ duyệt"
                            : app.status === "interviewing"
                              ? "Phỏng vấn"
                              : app.status === "hired"
                                ? "Đã nhận"
                                : "Từ chối"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.actionGroup}>
                          <select
                            className={styles.actionSelect}
                            value={app.status}
                            onChange={(event) =>
                              handleStatusUpdate(
                                app.id,
                                event.target.value as AppStatus,
                              )
                            }
                          >
                            <option value="applied">Chờ duyệt</option>
                            <option value="interviewing">Phỏng vấn</option>
                            <option value="hired">Tuyển dụng</option>
                            <option value="rejected">Từ chối</option>
                          </select>

                          <Button
                            variant="ghost"
                            style={{ padding: "0.375rem 0.6rem" }}
                            title={
                              isVip ? "Xem nhận xét AI" : "Tính năng dành cho VIP"
                            }
                            onClick={() => openAiReview(app)}
                          >
                            {isVip ? <Eye size={18} /> : <Lock size={18} />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Toaster />
      </div>

      {selectedApplicant && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className={styles.modalCard}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3>Nhận xét AI chi tiết</h3>
                <p>
                  {selectedApplicant.candidate_name} • {selectedApplicant.email}
                </p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedApplicant(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalScoreRow}>
              <div
                className={cx(
                  styles.modalScoreBadge,
                  styles[getScoreTone(selectedApplicant.ai_score)],
                )}
              >
                {selectedApplicant.ai_score}
              </div>
              <div className={styles.modalSummary}>
                <h4>Tóm tắt</h4>
                <p>{selectedApplicant.ai_summary}</p>
              </div>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>
                <BadgeCheck size={16} />
                Điểm mạnh nổi bật
              </div>
              <ul className={styles.modalList}>
                {selectedApplicant.ai_strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>
                <TriangleAlert size={16} />
                Rủi ro cần xác minh
              </div>
              <ul className={styles.modalList}>
                {selectedApplicant.ai_risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>
                <CircleAlert size={16} />
                Khuyến nghị của AI
              </div>
              <p className={styles.recommendationText}>
                {selectedApplicant.recommendation}
              </p>
            </div>

            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setSelectedApplicant(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success(
                    `Đã đánh dấu ${selectedApplicant.candidate_name} để ưu tiên xem xét`,
                  );
                  setSelectedApplicant(null);
                }}
              >
                Đánh dấu ưu tiên
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

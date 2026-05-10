"use client";

import Link from "next/link";
import { Eye, FileText, Lock, Mail, Sparkles, StickyNote } from "lucide-react";
import cx from "classnames";

import Button from "@/components/ui/Button";

import { getAvailableActions, STATUS_LABELS } from "../_lib/constants";
import {
  canEditInterviewNotes,
  getInterviewSummary,
  getScoreTone,
  shouldShowActionControls,
} from "../_lib/helpers";
import { Applicant, AppStatus, CandidatesTab } from "../_lib/types";
import styles from "../candidates.module.scss";

interface ApplicantsTableProps {
  applicants: Applicant[];
  jobsLoading: boolean;
  applicantsLoading: boolean;
  loadingCompany: boolean;
  activeTab: CandidatesTab;
  hasSelectedJob: boolean;
  isVip: boolean;
  onPreviewCv: (applicationId: number) => void;
  onOpenAiReview: (applicant: Applicant) => void;
  onSelectAction: (applicant: Applicant, nextStatus: AppStatus) => void;
  onOpenNotes: (applicant: Applicant) => void;
}

function getActionLabel(status: AppStatus) {
  switch (status) {
    case "interviewing":
      return "Phỏng vấn";
    case "hired":
      return "Tuyển dụng";
    case "rejected":
      return "Từ chối";
    case "applied":
      return "Chờ duyệt";
    case "withdrawn":
      return "Hủy/Rút lui";
    case "left_company":
      return "Đã nghỉ việc";
  }
}

export default function ApplicantsTable({
  applicants,
  jobsLoading,
  applicantsLoading,
  loadingCompany,
  activeTab,
  hasSelectedJob,
  isVip,
  onPreviewCv,
  onOpenAiReview,
  onSelectAction,
  onOpenNotes,
}: ApplicantsTableProps) {
  const availableActions = getAvailableActions(activeTab);
  const showActionControls = shouldShowActionControls(activeTab);

  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Ứng viên</th>
            {activeTab !== "interviewing" && <th>Ngày nộp</th>}
            {activeTab !== "interviewing" && <th>CV</th>}
            {activeTab !== "interviewing" && (
              <th>
                <div className={styles.aiHeading}>
                  AI Match <Sparkles size={14} color="#3b82f6" />
                </div>
              </th>
            )}
            {activeTab !== "interviewing" && <th>Trạng thái</th>}
            <th style={{ textAlign: "right" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobsLoading || applicantsLoading || loadingCompany ? (
            <tr>
              <td colSpan={6} className={styles.tableMessage}>
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : !hasSelectedJob ? (
            <tr>
              <td colSpan={6} className={styles.tableMessage}>
                Chọn một job ở cột bên trái để xem ứng viên.
              </td>
            </tr>
          ) : applicants.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.tableMessage}>
                Chưa có ứng viên phù hợp với bộ lọc hiện tại.
              </td>
            </tr>
          ) : (
            applicants.map((app) => {
              const interviewSummary = getInterviewSummary(app.interview);

              return (
                <tr key={app.id}>
                  <td>
                    <div className={styles.candidateInfo}>
                      <div className={styles.avatar}>
                        {app.candidate_name.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.name}>{app.candidate_name}</div>
                        <div className={styles.email}>
                          <Mail size={12} />
                          {app.email}
                        </div>
                        {activeTab === "interviewing" && interviewSummary && (
                          <div className={styles.interviewCard} style={{ marginTop: "0.5rem" }}>
                            <div className={styles.interviewHeader}>
                              {interviewSummary}
                            </div>
                            {(app.interview?.meeting_link || app.interview?.location) && (
                              <div className={styles.interviewDetail}>
                                {app.interview.mode === "offline"
                                  ? "Địa chỉ: " + app.interview.location
                                  : "Link: " + app.interview.meeting_link}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {activeTab !== "interviewing" && (
                    <td>
                      <div className={styles.dateApply}>
                        {new Date(app.applied_at).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                  )}
                  {activeTab !== "interviewing" && (
                    <td>
                      {app.cv_id ? (
                        <button
                          type="button"
                          className={styles.cvPreviewBtn}
                          onClick={() => onPreviewCv(app.application_id)}
                        >
                          <FileText size={14} />
                          {app.cv_name ?? "Xem CV"}
                        </button>
                      ) : (
                        <span className={styles.cvMissing}>Chưa có CV</span>
                      )}
                    </td>
                  )}
                  {activeTab !== "interviewing" && (
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
                  )}
                  {activeTab !== "interviewing" && (
                    <td>
                      <div className={styles.statusCell}>
                        <span
                          className={cx(styles.statusBadge, styles[app.status])}
                        >
                          {STATUS_LABELS[app.status]}
                        </span>
                        {interviewSummary && (
                          <div className={styles.interviewCard}>
                            <div className={styles.interviewHeader}>
                              {interviewSummary}
                            </div>
                            {(app.interview?.meeting_link || app.interview?.location) && (
                              <div className={styles.interviewDetail}>
                                {app.interview.mode === "offline"
                                  ? "Địa chỉ: " + app.interview.location
                                  : "Link: " + app.interview.meeting_link}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  <td style={{ textAlign: "right" }}>
                    <div className={styles.actionGroup}>
                      {showActionControls && availableActions.length > 0 && (
                        <select
                          className={styles.actionSelect}
                          value=""
                          onChange={(event) => {
                            const value = event.target.value as AppStatus | "";
                            if (!value) return;
                            onSelectAction(app, value);
                          }}
                        >
                          <option value="">Chọn xử lý</option>
                          {availableActions.map((status) => (
                            <option key={status} value={status}>
                              {getActionLabel(status)}
                            </option>
                          ))}
                        </select>
                      )}

                      {canEditInterviewNotes(app.status, activeTab) && (
                        <Button
                          variant={app.notes ? "primary" : "outline"}
                          className={styles.noteBtnSmall}
                          onClick={() => onOpenNotes(app)}
                          title="Ghi chú sau phỏng vấn"
                        >
                          <StickyNote size={14} />
                          {app.notes ? "Xem ghi chú" : "Thêm ghi chú"}
                        </Button>
                      )}

                      {activeTab !== "interviewing" && (
                        <Button
                          variant="ghost"
                          style={{ padding: "0.375rem 0.6rem" }}
                          title={
                            isVip ? "Xem nhận xét AI" : "Tính năng dành cho VIP"
                          }
                          onClick={() => onOpenAiReview(app)}
                        >
                          {isVip ? <Eye size={18} /> : <Lock size={18} />}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

import { AppStatus, CandidatesTab } from "./types";

export const STATUS_LABELS: Record<AppStatus, string> = {
  applied: "Chờ duyệt",
  interviewing: "Phỏng vấn",
  hired: "Đã nhận",
  rejected: "Từ chối",
  withdrawn: "Đã rút lui",
  left_company: "Đã nghỉ việc",
};

export const TAB_ORDER: CandidatesTab[] = [
  "all",
  "applied",
  "interviewing",
  "hired",
  "rejected",
  "withdrawn",
  "left_company",
];

export function getTabLabel(tab: CandidatesTab) {
  switch (tab) {
    case "all":
      return "Tất cả";
    case "applied":
      return "Mới nộp";
    case "interviewing":
      return "Đang phỏng vấn";
    case "hired":
      return "Đã tuyển";
    case "rejected":
      return "Từ chối";
    case "withdrawn":
      return "Rút lui/Hủy";
    case "left_company":
      return "Nghỉ việc";
  }
}

export function getAvailableActions(tab: CandidatesTab): AppStatus[] {
  if (tab === "applied") {
    return ["interviewing", "rejected", "withdrawn"];
  }

  if (tab === "interviewing") {
    return ["hired", "rejected", "withdrawn"];
  }

  if (tab === "hired") {
    return ["left_company"];
  }

  return [];
}

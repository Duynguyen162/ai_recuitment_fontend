import apiClient from "@/lib/apiClient";

/**
 * Hàm tiện ích để xem trước file từ Server
 * @param fileId ID của file cần xem
 * @param endpoint Đường dẫn API gốc (Ví dụ: '/profiles/cv_upload')
 */
export const previewFileFromServer = async (fileId: string, endpoint: string = '/profiles/cv_upload') => {
  if (!fileId) throw new Error("Không có ID file");

  try {
    const response = await apiClient.get(`${endpoint}/${fileId}/view`, {
      responseType: "blob",
    });

    const fileType = response.headers["content-type"] || "application/pdf";
    const blob = new Blob([response.data], { type: fileType });
    const fileURL = URL.createObjectURL(blob);
    
    const newTab = window.open(fileURL, "_blank");
    
    if (newTab) {
      newTab.onload = () => {
        setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
      };
    }
  } catch (error) {
    console.error("Lỗi khi mở file:", error);
    throw error; // Ném lỗi ra ngoài để component tự quyết định cách hiển thị (Toast hoặc Alert)
  }
};
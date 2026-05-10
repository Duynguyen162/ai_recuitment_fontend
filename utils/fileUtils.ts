import apiClient from "@/lib/apiClient";


export const previewFileFromServer = async (url: string) => {
  if (!url) throw new Error("Không có URL file");

  try {
    const response = await apiClient.get(url, {
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
    throw error;
  }
};

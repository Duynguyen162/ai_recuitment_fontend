import apiClient from "@/lib/apiClient";

const extractUploadedUrl = (payload: unknown): string => {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.url,
      record.file_url,
      record.fileUrl,
      record.path,
      record.location,
      record.secure_url,
    ];

    const matched = candidates.find((value) => typeof value === "string");
    if (typeof matched === "string") {
      return matched;
    }
  }

  throw new Error("Upload response does not contain a file URL");
};

export const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post(
    `/upload/file?folder=${folder}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return extractUploadedUrl(res.data?.data ?? res.data);
};

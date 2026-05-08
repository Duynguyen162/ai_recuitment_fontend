export const formatDate = (date?: string | Date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getDeadlineText = (date?: string | Date) => {
  if (!date) return "";

  const now = new Date();
  const deadline = new Date(date);

  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Đã hết hạn";
  if (diffDays === 0) return "Hết hạn hôm nay";
  if (diffDays <= 3) return `Còn ${diffDays} ngày`;

  return `Còn ${diffDays} ngày`;
};

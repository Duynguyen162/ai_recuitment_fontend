export const formatSalary = (
  min?: number | string,
  max?: number | string,
  currency: string = "VND",
) => {
  if (!min && !max) return "Thoả thuận";

  const format = (value: number | string) =>
    Number(value).toLocaleString("vi-VN");

  if (min && max) {
    return `${format(min)} - ${format(max)} ${currency}`;
  }

  if (min) return `Từ ${format(min)} ${currency}`;
  if (max) return `Đến ${format(max)} ${currency}`;

  return "";
};

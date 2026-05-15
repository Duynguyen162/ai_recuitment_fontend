import { z } from "zod";

// 1. Định nghĩa các quy tắc cốt lõi (Core Rules) để tái sử dụng
// Quy tắc mật khẩu: Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt (FR-C-01.1)
const passwordRule = z
  .string()
  .trim()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ thường")
  .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ hoa")
  .regex(/[0-9]/, "Phải chứa ít nhất 1 chữ số")
  .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt")
  .refine(
    (val) => new TextEncoder().encode(val).length <= 72,
    {
      message: "Mật khẩu quá dài",
    }
  );

const emailRule = z
  .string()
  .min(1, "Vui lòng nhập email")
  .email("Địa chỉ email không hợp lệ");

// 2. Lắp ráp thành Schema cho từng Form cụ thể

// Schema cho form Login
export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Vui lòng nhập mật khẩu"), // Khi login chỉ cần check xem có nhập hay không
});

// Xuất type tự động từ Schema để dùng trong TypeScript
export type LoginInput = z.infer<typeof loginSchema>;

// Schema cho form Đăng ký (Register)
export const registerSchema = z
  .object({
    role: z.enum(["candidate", "hr_manager"], {
      message: "Vui lòng chọn vai trò hợp lệ",
    }),
    email: emailRule,
    // Tái sử dụng quy tắc mật khẩu nghiêm ngặt ở đây
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Logic kiểm tra mật khẩu nhập lại
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Schema cho form Reset Mật khẩu (Cập nhật mật khẩu mới)
export const resetPasswordSchema = z
  .object({
    // Tái sử dụng lại quy tắc mật khẩu
    newPassword: passwordRule,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

import React, { useState } from "react";
import { X, Sparkles, Wand2 } from "lucide-react";
import styles from "../jobsManagement.module.scss";
import Button from "@/components/ui/Button";
import TextareaField from "@/components/ui/TextareaField";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";

interface AiJobGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

export default function AiJobGeneratorModal({ isOpen, onClose, onSuccess }: AiJobGeneratorModalProps) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Vui lòng nhập yêu cầu công việc");
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.post("/job/generate_ai", { prompt });
            if (res.data?.success) {
                toast.success("Tạo nội dung thành công!");
                onSuccess(res.data.data);
                onClose();
                setPrompt("");
            } else {
                toast.error("Không thể tạo nội dung");
            }
        } catch (error) {
            toast.error("Phải đăng ký tài khoản Vip mới dùng được tính năng này");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: "#fff", padding: "1.5rem", borderRadius: "1rem", width: "100%", maxWidth: "560px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "#1e293b", fontSize: "1.1rem" }}>
                        <Sparkles size={18} color="#3b82f6" />
                        Tạo tin tuyển dụng bằng AI
                    </h3>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <TextareaField
                        label="Mô tả ngắn gọn yêu cầu tuyển dụng"
                        placeholder="VD: Tuyển dụng Dev Frontend NextJS kinh nghiệm 2 năm, biết Tailwind CSS, lương tối đa 15 triệu, làm fulltime ở Hà Nội..."
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem", border: "1px dashed #cbd5e1" }}>
                        <strong>💡 Mẹo:</strong> Càng chi tiết, AI viết càng chính xác. Hãy nêu rõ: vị trí, số năm kinh nghiệm, kỹ năng bắt buộc, mức lương mong muốn và hình thức làm việc.
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleGenerate} loading={loading} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Wand2 size={16} /> {loading ? "Đang tạo..." : "Bắt đầu tạo"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

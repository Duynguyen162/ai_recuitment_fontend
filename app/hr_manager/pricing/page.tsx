"use client";

import React, { useState, useEffect } from "react";
import { Check, Minus, Sparkles } from "lucide-react";
import cx from "classnames";
import styles from "./pricing.module.scss";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

interface SubscriptionPlan {
  id: string | number;
  code: string;
  name: string;
  cycle: "monthly" | "yearly";
  price_vnd: number;
  vip_duration_days: number;
  is_active: boolean;
}

export default function PricingPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiClient.get("/payment/plans");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setPlans(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin gói VIP:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (plan: "free" | SubscriptionPlan) => {
    if (plan === "free") {
      router.push("/hr_manager/dashboard");
      return;
    }
    router.push(`/hr_manager/pricing/checkout?cycle=${plan.cycle}&plan_code=${plan.code}`);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.topBadge}>Mở khóa sức mạnh AI</div>
      <div className={styles.header}>
        <h1>
          Tuyển dụng thông minh hơn với <span>Sức mạnh AI</span>
        </h1>
        <p>
          Mở khóa AI matching, nhận xét chi tiết và kho tài liệu công ty để AI
          học từ dữ liệu nội bộ của doanh nghiệp.
        </p>
      </div>

      <div className={styles.pricingGrid}>
        {/* Gói Cơ bản (Miễn phí) */}
        <div className={styles.pricingCard}>
          <div className={styles.tierName}>Gói Cơ bản</div>
          <div className={styles.tierDesc}>
            Phù hợp cho doanh nghiệp đang cần ATS cơ bản để đăng tin và quản lý
            ứng viên.
          </div>

          <div className={styles.priceWrap}>
            <span className={styles.price}>0đ</span>
            <span className={styles.period}> / mãi mãi</span>
          </div>

          <ul className={styles.featuresList}>
            <li>
              <Check size={18} className={styles.iconCheck} /> Đăng tối đa 3 tin
              tuyển dụng cùng lúc
            </li>
            <li>
              <Check size={18} className={styles.iconCheck} /> Nhận và quản lý hồ
              sơ ứng viên
            </li>
            <li>
              <Check size={18} className={styles.iconCheck} /> Lên lịch phỏng vấn
              cơ bản
            </li>
            <li className={styles.disabled}>
              <Minus size={18} className={styles.iconMinus} /> Upload tài liệu
              công ty để đưa vào vector DB
            </li>
            <li className={styles.disabled}>
              <Minus size={18} className={styles.iconMinus} /> Chấm điểm độ phù
              hợp CV bằng AI
            </li>
            <li className={styles.disabled}>
              <Minus size={18} className={styles.iconMinus} /> Nhận xét điểm mạnh
              và rủi ro của ứng viên
            </li>
            <li className={styles.disabled}>
              <Minus size={18} className={styles.iconMinus} /> AI chatbot trả lời
              ứng viên
            </li>
          </ul>

          <button
            className={cx(styles.actionBtn, styles.btnOutline)}
            onClick={() => handleUpgrade("free")}
          >
            Sử dụng miễn phí
          </button>
        </div>

        {/* Các Gói VIP Động được Admin thêm vào */}
        {isLoading ? (
          <div className={styles.pricingCard} style={{ justifyContent: "center", alignItems: "center" }}>
            <span style={{ color: "#64748b" }}>Đang tải gói dịch vụ...</span>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className={cx(styles.pricingCard, styles.vipCard)}>
              <div className={styles.popularBadge}>
                {plan.cycle === "yearly" ? "Tiết kiệm 20%" : "Phổ biến"}
              </div>

              <div className={styles.tierName}>{plan.name}</div>
              <div className={styles.tierDesc}>
                Mở khóa tối đa sức mạnh sàng lọc hồ sơ CV bằng AI. Thời hạn sử dụng {plan.vip_duration_days} ngày.
              </div>

              <div className={styles.priceWrap}>
                <span className={styles.price}>{formatPrice(plan.price_vnd)}</span>
                <span className={styles.period}>
                  {plan.cycle === "yearly" ? " / năm" : plan.cycle === "monthly" ? " / tháng" : ` / ${plan.vip_duration_days} ngày`}
                </span>
              </div>

              <ul className={styles.featuresList}>
                <li>
                  <Check size={18} className={styles.iconCheck} />{" "}
                  <strong>Không giới hạn</strong> tin tuyển dụng
                </li>
                <li>
                  <Check size={18} className={styles.iconCheck} />{" "}
                  <strong>Không giới hạn</strong> tài liệu công ty đưa vào vector DB
                </li>
                <li className={styles.highlight}>
                  <Sparkles size={18} className={styles.iconSparkle} />
                  Tự động chấm điểm AI matching
                </li>
                <li className={styles.highlight}>
                  <Sparkles size={18} className={styles.iconSparkle} />
                  Nhận xét chi tiết điểm mạnh, điểm yếu và rủi ro
                </li>
                <li className={styles.highlight}>
                  <Sparkles size={18} className={styles.iconSparkle} />
                  AI chatbot dựa trên tài liệu nội bộ 24/7
                </li>
                <li>
                  <Check size={18} className={styles.iconCheck} /> Đánh dấu doanh
                  nghiệp uy tín
                </li>
              </ul>

              <button
                className={cx(styles.actionBtn, styles.btnPrimary)}
                onClick={() => handleUpgrade(plan)}
                disabled={isProcessing}
              >
                Nâng cấp ngay
              </button>
            </div>
          ))
        )}
      </div>
      <Toaster />
    </div>
  );
}

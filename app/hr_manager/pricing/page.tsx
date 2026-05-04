"use client";

import React, { useState } from "react";
import { Check, Minus, Sparkles } from "lucide-react";
import cx from "classnames";
import styles from "./pricing.module.scss";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleUpgrade = async (plan: "free" | "vip") => {
    if (plan === "free") {
      router.push("/hr_manager/dashboard");
      return;
    }

    setIsProcessing(true);
    toast.loading("Đang khởi tạo cổng thanh toán...", { id: "payment" });

    try {
      // TODO: Thay bằng API tạo link thanh toán thật.
      // const res = await apiClient.post("/payment/create-checkout", {
      //   plan: "vip",
      //   cycle: billingCycle,
      // });
      // window.location.href = res.data.data.checkout_url;
      setTimeout(() => {
        toast.success("Nâng cấp thành công. Gói VIP đã sẵn sàng.", {
          id: "payment",
        });
        setIsProcessing(false);
      }, 2000);
    } catch {
      toast.error("Lỗi khởi tạo thanh toán", { id: "payment" });
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>
          Tuyển dụng thông minh hơn với <span>Sức mạnh AI</span>
        </h1>
        <p>
          Mở khóa AI matching, nhận xét chi tiết và kho tài liệu công ty để AI
          học từ dữ liệu nội bộ của doanh nghiệp.
        </p>
      </div>

      <div className={styles.billingToggle}>
        <button
          className={cx({ [styles.active]: billingCycle === "monthly" })}
          onClick={() => setBillingCycle("monthly")}
        >
          Đóng theo tháng
        </button>
        <button
          className={cx({ [styles.active]: billingCycle === "yearly" })}
          onClick={() => setBillingCycle("yearly")}
        >
          Đóng theo năm <span className={styles.discount}>Tiết kiệm 20%</span>
        </button>
      </div>

      <div className={styles.pricingGrid}>
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

        <div className={cx(styles.pricingCard, styles.vipCard)}>
          <div className={styles.popularBadge}>Khuyên dùng</div>

          <div className={styles.tierName}>Gói AI Pro</div>
          <div className={styles.tierDesc}>
            Tự động hóa quy trình lọc hồ sơ với AI và kho tri thức riêng của
            doanh nghiệp.
          </div>

          <div className={styles.priceWrap}>
            {billingCycle === "monthly" ? (
              <div>
                <span className={styles.price}>499.000đ</span>
                <span className={styles.period}> / tháng</span>
              </div>
            ) : (
              <div>
                <span className={styles.price}>4.800.000đ</span>
                <span className={styles.period}> / năm</span>
              </div>
            )}
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
            onClick={() => handleUpgrade("vip")}
            disabled={isProcessing}
          >
            {isProcessing ? "Đang xử lý..." : "Nâng cấp AI Pro ngay"}
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

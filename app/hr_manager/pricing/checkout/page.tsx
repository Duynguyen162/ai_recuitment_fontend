"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Check, HelpCircle, Copy, CheckCircle2, Loader2, Landmark, User, CreditCard, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import styles from "./checkout.module.scss";

interface PaymentResponseData {
  payment_type: string;
  txn_ref: string;
  amount: number;
  transfer_content: string;
  bank_name: string;
  bank_account: string;
  account_holder: string;
  qr_image_url: string | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cycleParam = searchParams.get("cycle");
  const planCodeParam = searchParams.get("plan_code");
  const cycle = cycleParam === "yearly" ? "yearly" : "monthly";

  const [paymentStep, setPaymentStep] = useState<"form" | "pending" | "success">("form");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponseData | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiClient.get("/payment/plans");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setPlans(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách gói cho checkout:", error);
      }
    };
    fetchPlans();
  }, []);

  const selectedPlan = plans.find(p => p.code === planCodeParam)
    || plans.find(p => p.cycle === cycle)
    || { name: "Gói AI Pro (VIP)", price_vnd: cycle === "monthly" ? 499000 : 4800000, cycle, code: planCodeParam || "vip_" + cycle };

  const price = selectedPlan.price_vnd;
  const monthlyPlan = plans.find(p => p.cycle === "monthly") || { price_vnd: 499000 };
  const originalPrice = selectedPlan.cycle === "yearly" ? (monthlyPlan.price_vnd * 12) : monthlyPlan.price_vnd;
  const discount = originalPrice - price;

  // 1. Tạo thanh toán qua Backend và nhận thông tin tài khoản ngân hàng SePay
  const handlePayment = async () => {
    setIsProcessing(true);
    toast.loading("Đang khởi tạo thông tin giao dịch...", { id: "checkout" });

    try {
      const response = await apiClient.post("/payment/create-checkout", {
        plan_code: selectedPlan.code,
      });

      if (response.data && response.data.success && response.data.data) {
        setPaymentData(response.data.data);
        setPaymentStep("pending");
        toast.success("Khởi tạo mã QR thành công!", { id: "checkout" });
      } else {
        throw new Error(response.data?.message || "Không nhận được phản hồi thanh toán.");
      }
    } catch (error: any) {
      console.error("Lỗi khởi tạo thanh toán SePay:", error);
      toast.error(
        error.response?.data?.message || 
        "Lỗi khởi tạo giao dịch từ hệ thống. Vui lòng thử lại sau.", 
        { id: "checkout" }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Poll trạng thái thanh toán từ Backend SePay Webhook
  useEffect(() => {
    if (paymentStep !== "pending" || !paymentData?.txn_ref) return;

    let timerId: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      try {
        const response = await apiClient.get("/payment/sepay-status", {
          params: { txn_ref: paymentData.txn_ref },
        });

        if (response.data && response.data.success && response.data.data?.status === "completed") {
          toast.success("Giao dịch thành công! Đang kích hoạt VIP...", { id: "sepay-status" });
          setPaymentStep("success");
          return; // Kết thúc đệ quy poll
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái thanh toán SePay:", error);
      }

      // Tiếp tục thực hiện poll sau mỗi 5 giây
      timerId = setTimeout(checkPaymentStatus, 5000);
    };

    timerId = setTimeout(checkPaymentStatus, 5000);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [paymentStep, paymentData]);

  const handleCopy = (text: string, fieldLabel: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${fieldLabel}`);
  };

  const handleBackToDashboard = () => {
    window.location.href = "/hr_manager/dashboard";
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hủy giao dịch hiện tại, quay lại màn hình chọn hình thức thanh toán
  const handleCancelPayment = () => {
    setPaymentStep("form");
    setPaymentData(null);
  };

  // Màn hình 1: Form điền thông tin và xác nhận thanh toán
  if (paymentStep === "form") {
    return (
      <div className={styles.checkoutContainer}>
        <Link href="/hr_manager/pricing" className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>Quay lại bảng giá</span>
        </Link>

        <div className={styles.checkoutLayout}>
          {/* Left Column: Invoice Details */}
          <div className={styles.leftCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Thông tin thanh toán</h2>
              <p className={styles.cardSub}>Vui lòng kiểm tra lại thông tin gói dịch vụ trước khi tiếp tục.</p>

              <div className={styles.invoiceTable}>
                <div className={styles.invoiceRow}>
                  <span className={styles.label}>Gói dịch vụ</span>
                  <span className={styles.value}>{selectedPlan.name}</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span className={styles.label}>Chu kỳ thanh toán</span>
                  <span className={styles.value}>
                    {selectedPlan.cycle === "yearly" ? "Đóng theo năm (Tiết kiệm)" : "Đóng theo tháng"}
                  </span>
                </div>
                <div className={styles.invoiceRow}>
                  <span className={styles.label}>Đơn giá gốc</span>
                  <span className={styles.valueLineThrough}>
                    {formatPrice(originalPrice)}
                  </span>
                </div>
                
                {selectedPlan.cycle === "yearly" && (
                  <div className={styles.invoiceRowDiscount}>
                    <span className={styles.label}>Giảm giá khuyến mại</span>
                    <span className={styles.valueDiscount}>
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                <hr className={styles.divider} />

                <div className={styles.invoiceRowTotal}>
                  <span className={styles.totalLabel}>Tổng tiền thanh toán</span>
                  <span className={styles.totalValue}>{formatPrice(price)}</span>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Phương thức thanh toán</h2>
              <div className={styles.paymentMethodList}>
                <div className={styles.paymentMethodItemActive}>
                  <div className={styles.methodLeft}>
                    <div className={styles.radioIndicator} />
                    <div className={styles.methodInfo}>
                      <span className={styles.methodName}>Chuyển khoản qua QR Ngân hàng (SePay)</span>
                      <span className={styles.methodDesc}>Quét mã QR VietQR từ mọi ứng dụng ngân hàng. Kích hoạt VIP tự động sau 1 phút.</span>
                    </div>
                  </div>
                  <div className={styles.vietQrBadge}>
                    Viet<span>QR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Benefits Summary & Actions */}
          <div className={styles.rightCol}>
            <div className={styles.summaryCard}>
              <div className={styles.vipBadge}>
                <Sparkles size={16} />
                <span>Đặc quyền AI Pro</span>
              </div>

              <h3 className={styles.summaryTitle}>Nâng cấp để mở khóa</h3>
              
              <ul className={styles.benefitList}>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span><strong>Không giới hạn</strong> số lượng tin đăng tuyển</span>
                </li>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>Đưa tài liệu nội bộ vào <strong>Vector Database</strong></span>
                </li>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>AI chấm điểm độ phù hợp CV của ứng viên</span>
                </li>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>Đánh giá điểm mạnh, điểm yếu và rủi ro ứng viên</span>
                </li>
                <li>
                  <Check size={18} className={styles.checkIcon} />
                  <span>Tự động kích hoạt AI Chatbot tuyển dụng 24/7</span>
                </li>
              </ul>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={styles.payBtn}
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
              </button>

              <div className={styles.securityBadge}>
                <ShieldCheck size={16} />
                <span>Thanh toán bảo mật kết nối qua SePay</span>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Màn hình 2: Màn hình chờ chuyển khoản ngân hàng (QR Code)
  if (paymentStep === "pending" && paymentData) {
    // Dựng link QR động của SePay có số tiền cố định
    const qrUrl = `https://qr.sepay.vn/img?acc=${paymentData.bank_account}&bank=${paymentData.bank_name}&amount=${paymentData.amount}&des=${encodeURIComponent(paymentData.transfer_content)}`;

    return (
      <div className={styles.checkoutContainer}>
        <button onClick={handleCancelPayment} className={styles.backLinkBtn}>
          <ArrowLeft size={18} />
          <span>Hủy & Quay lại</span>
        </button>

        <div className={styles.checkoutLayout}>
          {/* Cột trái: Mã QR Code chuyển khoản */}
          <div className={styles.leftCol}>
            <div className={styles.qrCard}>
              <h2 className={styles.qrCardTitle}>Mã QR Chuyển khoản</h2>
              <p className={styles.qrCardSub}>Mở ứng dụng Mobile Banking quét VietQR để điền thông tin tự động.</p>
              
              <div className={styles.qrImageWrapper}>
                <img src={qrUrl} alt="Mã VietQR chuyển khoản SePay" className={styles.qrImage} />
                
                <div className={styles.pulseIndicator}>
                  <div className={styles.pulseDot}></div>
                  <span>Đang chờ bạn quét mã chuyển khoản...</span>
                </div>
              </div>

              <div className={styles.sandboxNotice}>
                <HelpCircle size={16} />
                <span>Vui lòng chuyển khoản đúng số tiền và nội dung để hệ thống tự động kích hoạt.</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin tài khoản và hướng dẫn chi tiết */}
          <div className={styles.rightCol}>
            <div className={styles.bankDetailCard}>
              <h3 className={styles.detailCardTitle}>Thông tin tài khoản nhận</h3>
              
              <div className={styles.bankInfoList}>
                <div className={styles.bankInfoItem}>
                  <div className={styles.itemLabel}>
                    <Landmark size={16} />
                    <span>Ngân hàng nhận</span>
                  </div>
                  <div className={styles.itemValueWrapper}>
                    <span className={styles.itemValueBold}>{paymentData.bank_name}</span>
                    <button 
                      onClick={() => handleCopy(paymentData.bank_name, "Tên ngân hàng")}
                      className={styles.copyButton}
                      title="Sao chép tên ngân hàng"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.bankInfoItem}>
                  <div className={styles.itemLabel}>
                    <CreditCard size={16} />
                    <span>Số tài khoản</span>
                  </div>
                  <div className={styles.itemValueWrapper}>
                    <span className={styles.itemValueBold}>{paymentData.bank_account}</span>
                    <button 
                      onClick={() => handleCopy(paymentData.bank_account, "Số tài khoản")}
                      className={styles.copyButton}
                      title="Sao chép số tài khoản"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.bankInfoItem}>
                  <div className={styles.itemLabel}>
                    <User size={16} />
                    <span>Tên chủ tài khoản</span>
                  </div>
                  <div className={styles.itemValueWrapper}>
                    <span className={styles.itemValue}>{paymentData.account_holder}</span>
                  </div>
                </div>

                <div className={styles.bankInfoItem}>
                  <div className={styles.itemLabel}>
                    <Sparkles size={16} />
                    <span>Số tiền chuyển</span>
                  </div>
                  <div className={styles.itemValueWrapper}>
                    <span className={styles.itemValueHighlight}>{formatPrice(paymentData.amount)}</span>
                    <button 
                      onClick={() => handleCopy(paymentData.amount.toString(), "Số tiền")}
                      className={styles.copyButton}
                      title="Sao chép số tiền"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.bankInfoItemHighlight}>
                  <div className={styles.itemLabelHighlight}>
                    <AlertCircle size={16} />
                    <span>Nội dung chuyển khoản bắt buộc</span>
                  </div>
                  <div className={styles.transferContentWrapper}>
                    <span className={styles.transferContent}>{paymentData.transfer_content}</span>
                    <button 
                      onClick={() => handleCopy(paymentData.transfer_content, "Nội dung chuyển khoản")}
                      className={styles.copyButtonHighlight}
                      title="Sao chép nội dung chuyển khoản"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.warningAlertBox}>
                <AlertCircle size={20} className={styles.warningIcon} />
                <p>
                  <strong>LƯU Ý QUAN TRỌNG:</strong> Hãy giữ nguyên nội dung chuyển khoản <strong>{paymentData.transfer_content}</strong> khi thực hiện chuyển tiền để hệ thống cập nhật tài khoản VIP tự động ngay lập tức.
                </p>
              </div>

              <div className={styles.pollingStatusBox}>
                <Loader2 size={16} className={styles.spinIcon} />
                <span>Hệ thống đang tự động theo dõi giao dịch của bạn...</span>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Màn hình 3: Thanh toán thành công (Success Screen)
  if (paymentStep === "success" && paymentData) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <CheckCircle2 className={styles.successIcon} size={64} />
          </div>
          
          <div className={styles.vipActiveBadge}>
            <Sparkles size={16} />
            <span>Kích hoạt VIP thành công</span>
          </div>

          <h1 className={styles.successTitle}>Nâng cấp tài khoản VIP thành công!</h1>
          <p className={styles.successDescription}>
            Cảm ơn bạn. Hệ thống đã nhận được tiền chuyển khoản. Gói AI Pro (VIP) đã được mở khóa toàn diện cho tài khoản tuyển dụng của bạn.
          </p>

          <div className={styles.detailsBox}>
            <h3 className={styles.detailsTitle}>Thông tin giao dịch</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.itemLabel}>Mã tham chiếu đơn hàng</span>
                <span className={styles.itemValue}>{paymentData.txn_ref}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.itemLabel}>Phương thức</span>
                <span className={styles.itemValue}>Chuyển khoản Ngân hàng (SePay)</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.itemLabel}>Số tiền giao dịch</span>
                <span className={styles.itemValueHighlight}>{formatPrice(paymentData.amount)}</span>
              </div>
            </div>
          </div>

          <button onClick={handleBackToDashboard} className={styles.successBtn}>
            Về bảng điều khiển
          </button>
        </div>
        <Toaster />
      </div>
    );
  }

  return null;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}>Đang tải thông tin thanh toán...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

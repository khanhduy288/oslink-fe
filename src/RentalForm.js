import React, { useState } from "react";
import axios from "axios";
import "./RentalForm.css";
import BottomNav from "./BottomNav";
import { jwtDecode } from "jwt-decode";

function RentalForm() {
  const username = localStorage.getItem("username") || "guest";
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;
  const userLevel = user?.level || 1;
  const [tabs, setTabs] = useState(1);
  const [months, setMonths] = useState(1);
  const [packageType, setPackageType] = useState("normal");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [rentMode, setRentMode] = useState("month"); // "month" | "week"
  const [weeks, setWeeks] = useState(1); // 1-2-3 tuần
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const basePrice = 150000;
  const vipPrice = 250000;
  const comboPrices = [
    { tabs: 3, discount: 50000, price: 400000 },
    { tabs: 5, discount: 150000, price: 600000 },
  ];

const calculatePrice = () => {
  // ================= GÓI TUẦN =================
  if (months < 1) {
    const weeks = Math.round(months * 4); // 0.25 => 1 tuần
    const weeklyPricePerTab = 50000;
    return tabs * weeks * weeklyPricePerTab;
  }

  // ================= GÓI THÁNG =================
  if (packageType === "vip") {
    return tabs * vipPrice * months;
  }

  let remainingTabs = tabs;
  let total = 0;
  const sortedCombos = [...comboPrices].sort((a, b) => b.tabs - a.tabs);

  for (const combo of sortedCombos) {
    while (remainingTabs >= combo.tabs) {
      total += combo.price;
      remainingTabs -= combo.tabs;
    }
  }

  total += remainingTabs * basePrice;
  return total * months;
};


  const totalBeforeDiscount = calculatePrice();
  const discountAmount = Math.floor((totalBeforeDiscount * voucherDiscount) / 100);
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError("");
    try {
      const res = await axios.post(
        "https://api.tabtreo.com/vouchers/validate",
        { code: voucherCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVoucherDiscount(res.data.discountPercent);
    } catch (err) {
      setVoucherDiscount(0);
      setVoucherError(err.response?.data?.message || "Voucher không hợp lệ");
    } finally {
      setVoucherLoading(false);
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();
  if (!token) {
    alert("Bạn chưa đăng nhập!");
    return;
  }

  setShowQR(true);
  setQrReady(false); // 👉 ban đầu chưa hiện QR
};

  const handleCloseQR = () => setShowQR(false);

const handleConfirmPayment = async () => {
  if (loading) return;
  setLoading(true);

  const finalTotal = totalAfterDiscount;

  let finalPricePerTab;

  if (months < 1) {
    finalPricePerTab = 50000;
  } else {
    finalPricePerTab = Math.ceil(finalTotal / tabs / months);
  }

  try {
    for (let i = 0; i < tabs; i++) {
      await axios.post(
        "https://api.tabtreo.com/rentals",
        {
          username,
          tabs: 1,
          months,
          pricePerTab: finalPricePerTab,
          voucherCode: voucherCode || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // ✅ CHỈ SAU KHI TẠO ĐƠN THÀNH CÔNG
    setQrReady(true);

  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi tạo đơn thuê");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="rental-container">
      <h2 className="title">Thuê Tab</h2>

      {/* Gói thuê */}
      <div className="package-cards">
        <div
          className={`package-card normal ${packageType === "normal" ? "active" : ""}`}
          onClick={() => setPackageType("normal")}
        >
          <div className="badge">Tiết kiệm</div>
          <h3>GÓI THƯỜNG</h3>
          <p className="price">150.000 VND / 1 Tab / 1 tháng</p>
          <div className="combo">
            <p>3 Tab ⚡ Giảm 50K → 400K</p>
            <p>5 Tab ⚡ Giảm 150K → 600K</p>
          </div>
          <button className="select-btn">Chọn gói</button>
        </div>

        <div
          className={`package-card vip ${packageType === "vip" ? "active" : ""}`}
          onClick={() => setPackageType("vip")}
        >
          <div className="badge">Ưu đãi lớn</div>
          <h3>GÓI VIP</h3>
          <p className="price">250.000 VND / 1 Tab / 1 tháng</p>
          <ul className="vip-features">
            <li>Ổn định</li>
            <li>Mượt hơn</li>
          </ul>
          <button className="select-btn">Chọn gói</button>
        </div>
      </div>

      {/* Form thuê */}
      <form className="rental-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Số lượng Tab</label>
          <div className="stepper">
            <button type="button" onClick={() => setTabs(Math.max(1, tabs - 1))}>-</button>
            <input type="number" value={tabs} readOnly />
            <button type="button" onClick={() => setTabs(Math.min(10, tabs + 1))}>+</button>
          </div>
        </div>

        <div className="form-group">
          <label>Thời gian thuê</label>

          {/* Nút chọn chế độ */}
          <div className="rent-mode">
            <button
              type="button"
              className={rentMode === "month" ? "active" : ""}
              onClick={() => {
                setRentMode("month");
                setMonths(1);
              }}
            >
              Theo tháng
            </button>

            <button
              type="button"
              className={rentMode === "week" ? "active" : ""}
              onClick={() => {
                setRentMode("week");
                setWeeks(1);
                setMonths(0.25);
              }}
            >
              Theo tuần
            </button>
          </div>

          {/* CHỌN THÁNG */}
          {rentMode === "month" && (
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              <option value={1}>1 tháng</option>
              {[...Array(11)].map((_, i) => (
                <option key={i + 2} value={i + 2}>
                  {i + 2} tháng
                </option>
              ))}
            </select>
          )}

          {/* CHỌN TUẦN */}
          {rentMode === "week" && (
            <select
              value={weeks}
              onChange={(e) => {
                const w = Number(e.target.value);
                setWeeks(w);
                setMonths(w * 0.25); // quy đổi cho backend
              }}
            >
              <option value={1}>1 tuần</option>
              <option value={2}>2 tuần</option>
              <option value={3}>3 tuần</option>
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Mã voucher (nếu có)</label>
          <div className="voucher-input">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            />
            <button type="button" onClick={applyVoucher}>
              {voucherLoading ? "Đang kiểm tra..." : "Áp dụng"}
            </button>
          </div>
          {voucherError && <p className="voucher-error">{voucherError}</p>}
          {voucherDiscount > 0 && (
            <p className="voucher-success">Giảm {voucherDiscount}% (-{discountAmount.toLocaleString()} VND)</p>
          )}
        </div>

        <p className="total">Tạm tính: {totalAfterDiscount.toLocaleString()} VND</p>

        <button type="submit" className="rent-btn">Thuê Tab</button>
      </form>

{/* Modal QR */}
{showQR && (
  <div className="qr-modal" onClick={handleCloseQR}>
    <div className="qr-content" onClick={(e) => e.stopPropagation()}>
      <h3>Quét QR hoặc chuyển khoản</h3>

{qrReady ? (
  <>
    <img src="/images/qrthanhtoan.png" alt="QR Payment" />

    <div className="qr-info-box">
      <strong>Viettinbank:</strong> <span>0981263234</span>
      <button onClick={() => {
        navigator.clipboard.writeText("0981263234");
        alert("Đã copy STK!");
      }}>
        Copy STK
      </button>
    </div>

    <div className="qr-info-box">
      <strong>Nội dung CK:</strong>{" "}
      <span>{packageType === "vip" ? `${username} vip` : username}</span>
    </div>

    <div className="qr-info-box">
      <strong>💵 Số tiền:</strong> {totalAfterDiscount.toLocaleString()} VND
    </div>
    <p style={{
      color: "red",
      fontWeight: "bold",
      fontSize: "13px",
      marginTop: "8px",
      textAlign: "center"
    }}>
      ⚠️ Sau khi chuyển khoản, vui lòng chụp bill và gửi cho admin support để được xử lý nhanh nhất!
    </p>
  </>
) : (
  <div style={{ textAlign: "center", padding: "20px" }}>
    <p style={{ fontWeight: "bold", fontSize: "16px" }}>
      👉 Bấm xác nhận để tạo đơn và hiển thị QR thanh toán
    </p>
  </div>
)}


      <div className="qr-buttons">
        <button
          className="confirm-btn"
          onClick={handleConfirmPayment}
          disabled={loading || qrReady}
        >
          {loading ? "Đang tạo đơn..." : qrReady ? "Đã tạo đơn" : "Xác nhận tạo đơn"}
        </button>
        <button className="close-btn" onClick={handleCloseQR}>
          Đóng
        </button>
      </div>

      <p className="qr-note">
        ⏱️ Quá trình cấp TAB mất khoảng 3 phút / 1 tab. Nhiều TAB sẽ cấp dần từng tab.
      </p>
    </div>
  </div>
)}
      <BottomNav />
    </div>
  );
}

export default RentalForm;
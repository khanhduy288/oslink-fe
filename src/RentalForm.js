import React, { useState } from "react";
import axios from "axios";
import "./RentalForm.css";

function RentalForm() {
  const username = localStorage.getItem("username") || "guest";
  const token = localStorage.getItem("token");

  const [tabs, setTabs] = useState(1);
  const [months, setMonths] = useState(1);
  const [packageType, setPackageType] = useState("normal"); // gói thường/vip
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const basePrice = 150000;
  const vipPrice = 250000;
  const comboPrices = [
    { tabs: 3, discount: 50000, price: 400000 },
    { tabs: 5, discount: 150000, price: 600000 },
  ];

  // Tính tổng tiền
  const calculatePrice = () => {
    if (packageType === "vip") return tabs * vipPrice * months;

    const applicableCombo = [...comboPrices].reverse().find(combo => tabs >= combo.tabs);
    if (applicableCombo) {
      const comboCount = Math.floor(tabs / applicableCombo.tabs);
      const remainderTabs = tabs % applicableCombo.tabs;
      return comboCount * applicableCombo.price * months + remainderTabs * basePrice * months;
    } else {
      return tabs * basePrice * months;
    }
  };

  // Lấy giá mỗi tab để gửi lên BE
  const getPricePerTab = () => {
    if (packageType === "vip") return vipPrice;

    const applicableCombo = [...comboPrices].reverse().find(combo => tabs >= combo.tabs);
    if (applicableCombo) {
      const comboCount = Math.floor(tabs / applicableCombo.tabs);
      const remainderTabs = tabs % applicableCombo.tabs;
      const totalPrice = comboCount * applicableCombo.price + remainderTabs * basePrice;
      return Math.ceil(totalPrice / tabs);
    } else {
      return basePrice;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowQR(true);
  };

  const handleCloseQR = () => setShowQR(false);

const handleConfirmPayment = async () => {
  const now = Date.now();
  const waitTime = 180000; // 3 phút
  const diff = now - lastSubmitTime;

  if (diff < waitTime) {
    const remaining = Math.ceil((waitTime - diff) / 1000);
    alert(`Vui lòng chờ ${remaining} giây trước khi tạo đơn tiếp theo!`);
    return;
  }

  if (!token) {
    alert("Bạn chưa đăng nhập!");
    return;
  }

  if (loading) return;
  setLoading(true);

  // Tính giá per tab theo gói
  const pricePerTab = packageType === "vip" ? 250000 : 150000;

  try {
    await axios.post(
      "https://api.tabtreo.com/rentals",
      { username, tabs, months, pricePerTab },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setLastSubmitTime(Date.now());
    alert(`Tạo ${tabs} tab thành công!`);
    setShowQR(false);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Lỗi khi tạo đơn thuê");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="form-container">
      <section style={{ marginBottom: "40px" }}>
        <h2>Thuê Tab</h2>

        <div className="price-table">
          <h3>💰 Giá cơ bản</h3>
          <p>
            <strong>150.000 VND</strong> / 1 Tab / 1 tháng <span className="highlight">(Gói Thường)</span>
          </p>

          <h3>🎁 Combo siêu tiết kiệm</h3>
          <ul>
            <li>3 Tab 👉 Giảm <strong>50K</strong> → chỉ <strong>400K</strong></li>
            <li>5 Tab 👉 Giảm <strong>150K</strong> → chỉ <strong>600K</strong></li>
          </ul>

          <h3>🌟 Gói VIP</h3>
          <p><strong>250.000 VND</strong> / 1 Tab / 1 tháng</p>
          <p>Ưu tiên cấp Tab nhanh ⚡ + hỗ trợ riêng 🎧</p>

          <div style={{ marginTop: "10px" }}>
            <p>🔥 <strong>Càng thuê nhiều – Giá càng rẻ – Ưu đãi càng lớn!</strong></p>
            <p>⏱️ Quá trình cấp Tab: <strong>~3 phút / 1 Tab</strong></p>
            <p>💬 Cần hỗ trợ tải game? <strong>Liên hệ Zalo Support</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Chọn loại gói</label>
          <select value={packageType} onChange={(e) => setPackageType(e.target.value)}>
            <option value="normal">Gói Thường</option>
            <option value="vip">Gói VIP</option>
          </select>

          <label>Số lượng Tab (tối đa 10)</label>
          <input
            type="number"
            value={tabs}
            min={1}
            max={10}
            onChange={(e) => setTabs(Math.min(10, Number(e.target.value)))}
            required
          />

          <label>Thời gian thuê (tháng)</label>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} tháng
              </option>
            ))}
          </select>

          <p>
            Tạm tính: <strong>{calculatePrice().toLocaleString()} VND</strong>
          </p>
          <button type="submit">Thuê Tab</button>
        </form>
      </section>

      {showQR && (
        <div className="qr-modal" onClick={handleCloseQR}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ textAlign: "center" }}>Quét QR hoặc chuyển khoản</h3>
            <img
              src="/images/qrthanhtoan.png"
              alt="QR Payment"
              style={{
                width: "250px",
                height: "250px",
                margin: "20px auto",
                display: "block",
                border: "2px solid #ccc",
                borderRadius: "12px",
                background: "#fff",
                padding: "6px",
              }}
            />

            {/* 🏦 Thông tin ngân hàng */}
            <div
              style={{
                marginTop: "10px",
                background: "#f6faff",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d4e3ff",
                textAlign: "center",
              }}
            >
              <strong>MBank + Viettinbank:</strong>{" "}
              <span style={{ color: "#007bff", fontWeight: "600" }}>0981263234</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("0981263234");
                  alert("Đã copy STK!");
                }}
                style={{
                  marginLeft: "8px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: "#007bff",
                  color: "#fff",
                }}
              >
                Copy STK
              </button>
            </div>

            {/* 💬 Nội dung CK */}
            <div
              style={{
                marginTop: "10px",
                background: "#f6faff",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #d4e3ff",
                display: "inline-block",
                fontSize: "14px",
                textAlign: "center",
                width: "100%",
              }}
            >
              <strong>Nội dung CK:</strong>{" "}
              <span style={{ color: "#007bff", fontWeight: "600" }}>
                {packageType === "vip" ? `${username} vip` : username}
              </span>
              <button
                onClick={() => {
                  const txt = packageType === "vip" ? `${username} vip` : username;
                  navigator.clipboard.writeText(txt);
                  alert("Đã copy nội dung CK!");
                }}
                style={{
                  marginLeft: "8px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: "#007bff",
                  color: "#fff",
                }}
              >
                Copy ND
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <p>
                <strong>💵 Số tiền cần chuyển:</strong>{" "}
                {(getPricePerTab() * tabs * months).toLocaleString()} VND
              </p>
              <p style={{ color: "red", fontWeight: "bold" }}>
                ⚠️ Lưu ý: Bank xong bấm xác nhận gửi bill cho support!
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "10px" }}>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "10px 25px",
                  borderRadius: "5px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontWeight: "bold",
                }}
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={handleCloseQR}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "10px 25px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Đóng
              </button>
            </div>

            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "14px",
                color: "#555",
              }}
            >
              ⏱️ Quá trình cấp TAB mất khoảng 3 phút / 1 tab. Nhiều TAB sẽ cấp dần từng tab.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default RentalForm;

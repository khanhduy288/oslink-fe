import React, { useState } from "react";
import axios from "axios";
import "./RentalForm.css";

function RentalForm() {
  const username = localStorage.getItem("username") || "guest";
  const token = localStorage.getItem("token");

  const [tabs, setTabs] = useState(1);
  const [months, setMonths] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const basePrice = 150000;
  const comboPrices = [
    { tabs: 3, discount: 50000, price: 400000 },
    { tabs: 5, discount: 150000, price: 600000 },
    { tabs: 10, discount: 400000, price: 1100000 },
  ];

  const calculatePrice = () => {
    const applicableCombo = [...comboPrices].reverse().find(combo => tabs >= combo.tabs);
    if (applicableCombo) {
      const comboCount = Math.floor(tabs / applicableCombo.tabs);
      const remainderTabs = tabs % applicableCombo.tabs;
      return comboCount * applicableCombo.price * months + remainderTabs * basePrice * months;
    } else {
      return tabs * basePrice * months;
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

  try {
    await axios.post(
      "https://api.tabtreo.com/rentals",
      { username, tabs, months },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setLastSubmitTime(Date.now());
    alert(`Tạo ${tabs} đơn thành công!`);
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
          <h3>💰 Giá cơ bản:</h3>
          <p>👉 150K / 1 Tab / 1 tháng</p>
        
          <h3>🎁 Combo siêu tiết kiệm:</h3>
          <ul>
            <li>3 Tab 👉 Giảm 50K = chỉ 400K</li>
            <li>5 Tab 👉 Giảm 150K = chỉ 600K</li>
            <li>10 Tab 👉 Giảm 400K = chỉ 1100K</li>
          </ul>
        
          <p>🔥 Càng thuê nhiều – Giá càng rẻ – Ưu đãi càng lớn!</p>
          <p>🔥 Quá Trình Cấp TAB (3 phút / 1 tab)</p>
          <p>Nhiều TAB sẽ cấp từng tab vào Room</p>
          <p>🔥 Cần hỗ trợ tải game - Ibox Zalo Support ngay!</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Số lượng Tab (tối đa 10)</label>
          <input
            type="number"
            value={tabs}
            min={1}
            max={10} // giới hạn tối đa 10
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
        style={{ width: "250px", height: "250px", margin: "20px auto", display: "block" }}
      />
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <p><strong>💵 Số tiền cần chuyển:</strong> {calculatePrice().toLocaleString()} VND</p>
        <p><strong>📝 Nội dung CK:</strong> {username}</p>
        <p>🏧 Phương thức thanh toán: Vietinbank | Momo | ZaloPay</p>
        <p><strong>STK:</strong> 0981263234 - <strong>Trần Văn Đông</strong></p>
        <p style={{ color: "red", fontWeight: "bold" }}>
          ⚠️ Lưu ý: Nếu cần support liên hệ admin
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-around" }}>
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
            opacity: loading ? 0.5 : 1,
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
      <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", color: "#555" }}>
        ⚠️ Quá trình cấp TAB mất khoảng 3 phút / 1 tab. Nhiều TAB sẽ cấp từng tab.
      </p>
    </div>
  </div>
)}

    </div>
  );
}

export default RentalForm;

import React, { useState } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode"; // sửa import
import "./RentalForm.css";

function RentalForm() {
  const username = localStorage.getItem("username") || "guest";
  const token = localStorage.getItem("token");

  const [tabs, setTabs] = useState(1);
  const [months, setMonths] = useState(1);
  const [showQR, setShowQR] = useState(false);

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
    setShowQR(false);

    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    try {
      // gửi username, tabs và months → backend sẽ tạo n bản ghi
      await axios.post(
        "https://oslinksymtem.onrender.com/rentals",
        { username, tabs, months },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Tạo ${tabs} đơn thành công!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi tạo đơn thuê");
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
            {comboPrices.map((combo, idx) => (
              <li key={idx}>
                {combo.tabs} Tab 👉 Giảm {combo.discount / 1000}K = chỉ {combo.price / 1000}K
              </li>
            ))}
          </ul>
          <p>🔥 Càng thuê nhiều – Giá càng rẻ – Ưu đãi càng lớn!</p>
          <p>🔥Cần hỗ trợ tải game - Ibox Zalo Support ngay!</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Số lượng Tab</label>
          <input
            type="number"
            value={tabs}
            min={1}
            onChange={(e) => setTabs(Number(e.target.value))}
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
            Tạm tính: <strong>{calculatePrice() / 1000}K</strong>
          </p>
          <button type="submit">Thuê Tab</button>
        </form>
      </section>

      {showQR && (
        <div className="qr-modal" onClick={handleCloseQR}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <h3>Quét QR để thanh toán</h3>
            <img
              src="/images/qrthanhtoan.png"
              alt="QR Payment"
              style={{ width: "250px", height: "250px", marginBottom: "20px" }}
            />
            <p>
              <strong>💵 Số tiền cần chuyển:</strong> {calculatePrice().toLocaleString()} VND
            </p>
            <p>
              <strong>📝 Nội dung CK:</strong> {username}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button
                onClick={handleConfirmPayment}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={handleCloseQR}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalForm;

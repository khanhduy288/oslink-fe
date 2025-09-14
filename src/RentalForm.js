import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./RentalForm.css";

function RentalForm() {
  const { serviceId } = useParams();
  const [userId, setUserId] = useState("");
  const [months, setMonths] = useState(1);

  const basePrice = 150000; // 150K / 1 Tab / 1 tháng
  const comboPrices = [
    { tabs: 3, discount: 50000, price: 400000 },
    { tabs: 5, discount: 150000, price: 600000 },
    { tabs: 10, discount: 400000, price: 1100000 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://oslinksymtem.onrender.com/rentals", {
        userId,
        rentalTime: months, // gửi số tháng thay cho phút
        serviceId,
      });
      toast.success("Tạo mới thành công!");
      setUserId("");
      setMonths(1);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="form-container">
      <h2>Thuê dịch vụ #{serviceId}</h2>

      {/* Bảng giá + combo */}
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
      </div>

      <form onSubmit={handleSubmit}>
        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <label>Thời gian thuê (tháng)</label>
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} tháng
            </option>
          ))}
        </select>

        <p>Tạm tính: <strong>{months * basePrice / 1000}K / 1 Tab</strong></p>

        <button type="submit">Xác nhận</button>
      </form>
    </div>
  );
}

export default RentalForm;

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "./RentalList.css";

dayjs.extend(utc);
dayjs.extend(timezone);

function RentalList() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extendModal, setExtendModal] = useState({ show: false, rental: null, months: 1 });
  
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "guest";

  const basePrice = 150000;
  const comboPrices = [
    { tabs: 3, discount: 50000, price: 400000 },
    { tabs: 5, discount: 150000, price: 600000 },
    { tabs: 10, discount: 400000, price: 1100000 },
  ];

  const BACKEND_URL = "https://api.tabtreo.com"; // <-- đổi backend mới

  useEffect(() => {
    if (!token) {
      setError("Bạn chưa đăng nhập!");
      setLoading(false);
      return;
    }

    fetchRentals();
  }, []);

  const fetchRentals = () => {
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/rentals`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRentals(res.data))
      .catch((err) => setError(err.response?.data?.message || "Lỗi khi tải danh sách thuê"))
      .finally(() => setLoading(false));
  };

const getRemainingHours = (rental) => {
  const created = dayjs(rental.createdAt).tz("Asia/Bangkok"); // trực tiếp convert từ UTC sang Bangkok
  const rentalEnd = created.add(rental.rentalTime, "minute");
  const now = dayjs().tz("Asia/Bangkok");
  const diff = rentalEnd.diff(now, "minute");
  return diff > 0 ? (diff / 60).toFixed(1) : 0;
};


const handleCancelChangeTab = async (rentalId) => {
  try {
    await axios.patch(
      `${BACKEND_URL}/rentals/${rentalId}`,
      { status: "active" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.info("Đã hủy yêu cầu đổi tab, trở lại trạng thái active");
    fetchRentals();
  } catch (err) {
    toast.error("Hủy yêu cầu thất bại!");
    console.error(err);
  }
};

// 🟢 User chỉ đổi status sang pending_change_tab
const handleRequestChangeTab = async (rentalId) => {
  try {
    await axios.patch(
      `${BACKEND_URL}/rentals/${rentalId}`,
      { status: "pending_change_tab" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Đã gửi yêu cầu đổi tabs, chờ admin duyệt");
    fetchRentals(); // refresh danh sách
  } catch (err) {
    toast.error("Gửi yêu cầu thất bại!");
    console.error(err);
  }
};

  const calculatePrice = (tabs, months) => {
    const applicableCombo = [...comboPrices].reverse().find(combo => tabs >= combo.tabs);
    if (applicableCombo) {
      const comboCount = Math.floor(tabs / applicableCombo.tabs);
      const remainderTabs = tabs % applicableCombo.tabs;
      return comboCount * applicableCombo.price * months + remainderTabs * basePrice * months;
    } else {
      return tabs * basePrice * months;
    }
  };

  const isExpired = (rental) => {
    const created = dayjs.utc(rental.createdAt).tz("Asia/Bangkok");
    const rentalEnd = created.add(rental.rentalTime, "minute");
    return dayjs().tz("Asia/Bangkok").isAfter(rentalEnd);
  };

  const openExtendModal = (rental) => setExtendModal({ show: true, rental, months: 1 });
  const closeExtendModal = () => setExtendModal({ show: false, rental: null, months: 1 });

  const handleConfirmExtend = async () => {
    const { rental, months } = extendModal;
    if (!rental) return;

    const tabs = Math.ceil(rental.rentalTime / (30 * 24 * 60)); 
    const extendTimeInMinutes = tabs * months * 30 * 24 * 60;

    try {
      await axios.post(
        `${BACKEND_URL}/rentals/${rental.id}/request-extend`,
        { requestedExtendMonths: months, tabs, extendTimeInMinutes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Yêu cầu gia hạn đã gửi, chờ admin xác nhận!");
      closeExtendModal();
      fetchRentals();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi gửi yêu cầu gia hạn");
    }
  };

  if (loading) return <p>Đang tải danh sách thuê...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (rentals.length === 0) return <p>Bạn chưa có đơn thuê nào.</p>;

  return (
    <div className="list-container">
      <h2>Danh sách thuê của bạn</h2>
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Username</th>
            <th>Thời gian thuê</th>
            <th>Ngày tạo</th>
            <th>Còn lại (giờ)</th> 
            <th>Room Code</th>
            <th>Room Pass</th>
            <th>Status</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((rental) => (
            <tr key={rental.id} className={isExpired(rental) ? "expired" : ""}>
              <td data-label="ID">{rental.id}</td>
              <td data-label="Username">{rental.username}</td>
              <td data-label="Thời gian thuê">{rental.rentalTime / 60} giờ</td>
              <td data-label="Ngày tạo">
                {new Date(rental.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" })}
              </td>
              <td data-label="Thời gian còn lại (giờ)">{getRemainingHours(rental)}</td> 
              <td data-label="Room Code">
                {rental.roomCode
                  ? rental.roomCode
                      .split(" ")             
                      .slice(0, -1)           
                      .join(" ")              
                  : "Chưa tạo"}
              </td>
              <td data-label="Room Pass">
                {rental.roomCode ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span>{rental.roomCode.split(" ").slice(-1)[0]}</span>
                    <button
                      className="copy-pass"
                      onClick={() => {
                        navigator.clipboard.writeText(rental.roomCode.split(" ").slice(-1)[0]);
                        toast.success("Copied Pass!");
                      }}
                    >
                      Copy Pass
                    </button>
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td data-label="Status">{rental.status}</td>
              <td data-label="Thao tác">
                {rental.status === "active" && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button className="action-btn extend" onClick={() => openExtendModal(rental)}>
                      Gia hạn
                    </button>
                    <button
                      className="action-btn change-tab"
                      onClick={() => handleRequestChangeTab(rental.id)}
                    >
                      Đổi tab
                    </button>
                  </div>
                )}

                {rental.status === "pending_change_tab" && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span>Đang chờ đổi tab...</span>
                    <button
                      className="action-btn cancel"
                      onClick={() => handleCancelChangeTab(rental.id)}
                    >
                      Hủy yêu cầu
                    </button>
                  </div>
                )}

                {rental.status === "pending_extend" && <span>Chờ admin</span>}
                {rental.status === "pending" && <span>Đang xác nhận</span>}
                {rental.status === "expired" && <span>Hết hạn</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {extendModal.show && (
        <div className="qr-modal" onClick={closeExtendModal}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gia hạn đơn ID: {extendModal.rental.id}</h3>
            <label>Thời gian gia hạn (tháng):</label>
            <select
              value={extendModal.months}
              onChange={(e) =>
                setExtendModal({ ...extendModal, months: Number(e.target.value) })
              }
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} tháng
                </option>
              ))}
            </select>
            <p>
              Tạm tính:{" "}
              <strong>
                {calculatePrice(
                  Math.ceil(extendModal.rental.rentalTime / (30 * 24 * 60)),
                  extendModal.months
                ) / 1000}
                K
              </strong>
            </p>

            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <p>Quét mã QR để thanh toán</p>
              <img
                src="/images/qrthanhtoan.png"
                alt="QR thanh toán"
                style={{ width: "220px", border: "1px solid #ccc", borderRadius: "8px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button
                onClick={handleConfirmExtend}
                style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", borderRadius: "5px" }}
              >
                Xác nhận
              </button>
              <button
                onClick={closeExtendModal}
                style={{ backgroundColor: "#f44336", color: "white", padding: "10px 20px", borderRadius: "5px" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default RentalList;

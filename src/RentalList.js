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
  const [showDetail, setShowDetail] = useState({});

  const token = localStorage.getItem("token");

  const basePrice = 150000;
  const comboPrices = [
    { tabs: 3, discount: 50000, price: 400000 },
    { tabs: 5, discount: 150000, price: 600000 },
    { tabs: 10, discount: 400000, price: 1100000 },
  ];

  const BACKEND_URL = "https://api.tabtreo.com";

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
  if (!rental.expiresAt) return 0;
  const rentalEnd = dayjs(rental.expiresAt).tz("Asia/Bangkok"); // dùng expiresAt trực tiếp
  const now = dayjs().tz("Asia/Bangkok");
  const diff = rentalEnd.diff(now, "minute"); // số phút còn lại
  return diff > 0 ? (diff / 60).toFixed(1) : 0; // đổi ra giờ
};


  const handleCancelChangeTab = async (rentalId) => {
    try {
      await axios.patch(`${BACKEND_URL}/rentals/${rentalId}`, { status: "active" }, { headers: { Authorization: `Bearer ${token}` } });
      toast.info("Đã hủy yêu cầu đổi tab, trở lại trạng thái active");
      fetchRentals();
    } catch (err) {
      toast.error("Hủy yêu cầu thất bại!");
      console.error(err);
    }
  };

  const handleRequestChangeTab = async (rentalId) => {
    try {
      await axios.patch(`${BACKEND_URL}/rentals/${rentalId}`, { status: "pending_change_tab" }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đã gửi yêu cầu đổi tabs, chờ admin duyệt");
      fetchRentals();
    } catch (err) {
      toast.error("Gửi yêu cầu thất bại!");
      console.error(err);
    }
  };

  // Thay vì basePrice cố định
  const calculatePrice = (rental, months) => {
    if (!rental.pricePerTab) return 0;
    return rental.pricePerTab * months;
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

    // 1 tab cố định → chỉ cộng theo số tháng
    const extendTimeInMinutes = months * 30 * 24 * 60;

    try {
      await axios.post(
        `${BACKEND_URL}/rentals/${rental.id}/request-extend`,
        {
          requestedExtendMonths: months,
          extendTimeInMinutes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Gửi yêu cầu gia hạn thành công!");
      setExtendModal({ show: false, rental: null, months: 1 });
      fetchRentals();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu gia hạn:", error);
      toast.error("Không thể gửi yêu cầu. Vui lòng thử lại!");
    }
  };

  if (loading) return <p>Đang tải danh sách thuê...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (rentals.length === 0) return <p>Bạn chưa có đơn thuê nào.</p>;

  return (
    <div className="rental-card-container">
      {rentals.map((rental) => (
        <div key={rental.id} className={`rental-card ${isExpired(rental) ? "expired" : ""}`}>
          {/* Phần summary luôn hiện */}
          <div className="card-summary">
            <div><strong>ID:</strong> {rental.id}</div>
            <div>
              <strong>Room Code:</strong>{" "}
              {rental.roomCode ? rental.roomCode.split(" ").slice(0, -1).join(" ") : "Chờ 3-5 phút"}
            </div>
            <div>
              <strong>Room Pass:</strong>{" "}
              {rental.roomCode ? (
                <>
                  <span>{rental.roomCode.split(" ").slice(-1)[0]}</span>
                  <button
                    className="copy-pass"
                    onClick={() => {
                      navigator.clipboard.writeText(rental.roomCode.split(" ").slice(-1)[0]);
                      toast.success("Copied Pass!");
                    }}
                    style={{ marginLeft: "6px" }}
                  >
                    Copy
                  </button>
                </>
              ) : "-"}
            </div>
            <div><strong>Còn lại:</strong> {getRemainingHours(rental)} giờ</div>
            <button
              className="toggle-detail-btn"
              onClick={() => setShowDetail(prev => ({ ...prev, [rental.id]: !prev[rental.id] }))}
            >
              {showDetail[rental.id] ? "Ẩn chi tiết" : "Xem chi tiết"}
            </button>
          </div>

          {/* Detail chỉ hiện khi bấm */}
          {showDetail[rental.id] && (
            <div className="card-detail">
              <p><strong>Username:</strong> {rental.username}</p>
              <p><strong>Thời gian thuê:</strong> {rental.rentalTime / 60} giờ</p>
              <p><strong>Ngày tạo:</strong> {dayjs(rental.createdAt).tz("Asia/Bangkok").format("DD/MM/YYYY HH:mm:ss")}</p>
              <p><strong>Status:</strong> {rental.status}</p>

              <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {rental.status === "active" && (
                  <>
                    <button className="action-btn extend" onClick={() => openExtendModal(rental)}>Gia hạn</button>
                    <button className="action-btn change-tab" onClick={() => handleRequestChangeTab(rental.id)}>Đổi tab</button>
                  </>
                )}
                {rental.status === "pending_change_tab" && (
                  <>
                    <span>Đang chờ đổi tab...</span>
                    <button className="action-btn cancel" onClick={() => handleCancelChangeTab(rental.id)}>Hủy yêu cầu</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

{/* Modal gia hạn */}
{extendModal.show && (
  <div className="qr-modal" onClick={closeExtendModal}>
    <div className="qr-content" onClick={(e) => e.stopPropagation()}>
      <h3>Gia hạn đơn ID: {extendModal.rental.id}</h3>
      <label>Thời gian gia hạn (tháng):</label>
      <select
        value={extendModal.months}
        onChange={(e) => setExtendModal({ ...extendModal, months: Number(e.target.value) })}
      >
        {[...Array(12)].map((_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1} tháng</option>
        ))}
      </select>

      <p>
        Tạm tính: <strong>{calculatePrice(extendModal.rental, extendModal.months).toLocaleString()} VND</strong>
      </p>


      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <p>Quét mã QR để thanh toán</p>

        <img
          src="/images/qrthanhtoan.png"
          alt="QR thanh toán"
          style={{
            width: "350px",
            height: "350px",
            maxWidth: "95%",
            objectFit: "contain",
            border: "2px solid #ccc",
            borderRadius: "16px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            background: "#fff",
            padding: "8px"
          }}
        />

        {/* ✅ Nội dung chuyển khoản (đã thêm số tháng) */}
        <div style={{
          marginTop: "10px",
          background: "#f6faff",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d4e3ff",
          display: "inline-block",
          fontSize: "14px"
        }}>
          <strong>Nội dung CK:</strong>{" "}
          <span style={{ color: "#007bff", fontWeight: "600" }}>
            Gia hạn {extendModal.months}T{" "}
            {extendModal.rental.roomCode
              ? extendModal.rental.roomCode.split(" ").slice(0, -1).join("_")
              : "Room"}
          </span>
          <button
            onClick={() => {
              const txt = `Gia hạn ${extendModal.months}T ${
                extendModal.rental.roomCode
                  ? extendModal.rental.roomCode.split(" ").slice(0, -1).join("_")
                  : "Room"
              }`;
              navigator.clipboard.writeText(txt);
              toast.success("Đã copy nội dung!");
            }}
            style={{
              marginLeft: "8px",
              padding: "4px 8px",
              fontSize: "12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: "#007bff",
              color: "#fff"
            }}
          >
            Copy
          </button>
        </div>
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

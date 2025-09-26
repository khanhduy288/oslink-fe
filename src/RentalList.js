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
  const [showDetail, setShowDetail] = useState({});

  const token = localStorage.getItem("token");
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
    const created = dayjs(rental.createdAt).tz("Asia/Bangkok");
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

  const handleRequestChangeTab = async (rentalId) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/rentals/${rentalId}`,
        { status: "pending_change_tab" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã gửi yêu cầu đổi tabs, chờ admin duyệt");
      fetchRentals();
    } catch (err) {
      toast.error("Gửi yêu cầu thất bại!");
      console.error(err);
    }
  };

  const isExpired = (rental) => {
    const created = dayjs.utc(rental.createdAt).tz("Asia/Bangkok");
    const rentalEnd = created.add(rental.rentalTime, "minute");
    return dayjs().tz("Asia/Bangkok").isAfter(rentalEnd);
  };

  if (loading) return <p>Đang tải danh sách thuê...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (rentals.length === 0) return <p>Bạn chưa có đơn thuê nào.</p>;

  return (
    <div className="rental-card-container">
      {rentals.map((rental) => (
        <div
          key={rental.id}
          className={`rental-card ${isExpired(rental) ? "expired" : ""}`}
        >
          {/* Summary hiển thị luôn */}
          <div className="card-summary">
            <div><strong>ID:</strong> {rental.id}</div>
            <div>
              <strong>Room Code:</strong> {rental.roomCode ? rental.roomCode.split(" ").slice(0, -1).join(" ") : "Chờ 3-5 phút"}
            </div>
            <div>
              <strong>Room Pass:</strong> {rental.roomCode ? (
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
              onClick={() =>
                setShowDetail((prev) => ({ ...prev, [rental.id]: !prev[rental.id] }))
              }
            >
              {showDetail[rental.id] ? "Ẩn chi tiết" : "Xem chi tiết"}
            </button>
          </div>

          {/* Detail hiển thị khi bấm */}
          {showDetail[rental.id] && (
            <div className="card-detail">
              <div><strong>Username:</strong> {rental.username}</div>
              <div><strong>Thời gian thuê:</strong> {rental.rentalTime / 60} giờ</div>
              <div><strong>Ngày tạo:</strong> {new Date(rental.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" })}</div>
              <div><strong>Status:</strong> {rental.status}</div>

              {/* Thao tác */}
              <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {rental.status === "active" && (
                  <button className="action-btn change-tab" onClick={() => handleRequestChangeTab(rental.id)}>
                    Đổi tab
                  </button>
                )}
                {rental.status === "pending_change_tab" && (
                  <button className="action-btn cancel" onClick={() => handleCancelChangeTab(rental.id)}>
                    Hủy yêu cầu
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <ToastContainer />
    </div>
  );
}

export default RentalList;

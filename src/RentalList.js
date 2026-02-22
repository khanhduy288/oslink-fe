import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "./RentalList.css";
import BottomNav from "./BottomNav";

dayjs.extend(utc);
dayjs.extend(timezone);

function RentalList() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRentals, setSelectedRentals] = useState([]);
  const [extendModal, setExtendModal] = useState({ show: false, months: 1 });
  const [showDetail, setShowDetail] = useState({});
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [extendMode, setExtendMode] = useState("month"); // month | week
  const [weeks, setWeeks] = useState(1); // 1–2–3
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

  const handleRequestChangeTab = async (rentalId) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/rentals/${rentalId}`,
        { status: "pending_change_tab" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã gửi yêu cầu đổi tab, chờ admin duyệt");
      fetchRentals();
    } catch (err) {
      console.error(err);
      toast.error("Gửi yêu cầu đổi tab thất bại!");
    }
  };

const getRemainingTime = (rental) => {
  if (!rental.expiresAt) return "Hết hạn";

  const now = dayjs.utc();                 // LUÔN UTC
  const end = dayjs.utc(rental.expiresAt); // LUÔN UTC

  const diffMinutes = end.diff(now, "minute");
  if (diffMinutes <= 0) return "Hết hạn";

  const days = Math.floor(diffMinutes / 1440);
  const hours = Math.floor((diffMinutes % 1440) / 60);
  const minutes = diffMinutes % 60;

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;

  return result.trim();
};

  const isExpired = (rental) => {
    if (!rental.expiresAt) return true;
    return dayjs.utc().isAfter(dayjs.utc(rental.expiresAt));
  };

  const handleSelectRental = (id) => {
    setSelectedRentals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

const calculateTotalPrice = (selectedRentalObjects, months = 1) => {
  const WEEK_PRICE_PER_TAB = 50000;
  const basePrice = 150000;

  const comboPrices = [
    { tabs: 3, price: 400000 },
    { tabs: 5, price: 600000 },
  ];

  // ================= GÓI TUẦN =================
  if (months < 1) {
    const weeks = Math.round(months * 4); // 0.25 => 1 tuần
    return selectedRentalObjects.length * weeks * WEEK_PRICE_PER_TAB;
  }

  // ================= GÓI THÁNG =================
  let remainingTabs = selectedRentalObjects.length;
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

  const openExtendModal = () => {
    if (selectedRentals.length === 0) {
      toast.info("Hãy chọn ít nhất 1 đơn để gia hạn!");
      return;
    }

    const invalidRentals = rentals.filter(
      (r) => selectedRentals.includes(r.id) && !["active", "expired"].includes(r.status)
    );

    if (invalidRentals.length > 0) {
      toast.warning(
        `Có ${invalidRentals.length} đơn chưa được xác nhận hoặc đang chờ duyệt. Vui lòng chỉ chọn các đơn đang hoạt động hoặc đã hết hạn!`
      );
      return;
    }

    setExtendModal({ show: true, months: 1 });
    setExtendMode("month");
    setWeeks(1);
    setVoucher("");
    setDiscount(0);
  };

  const closeExtendModal = () => {
    setExtendModal({ show: false, months: 1 });
  };

const handleApplyVoucher = async () => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/vouchers/validate`,
      { code: voucher },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDiscountPercent(res.data.discountPercent); // <-- lưu %
    toast.success(`Voucher hợp lệ: giảm ${res.data.discountPercent}%`);
  } catch (err) {
    setDiscountPercent(0); // reset
    toast.error(err.response?.data?.message || "Voucher không hợp lệ");
  }
};



const handleConfirmExtend = async () => {
  const months = extendModal.months;

  const extendMinutes =
    months < 1
      ? Math.round(months * 4) * 7 * 24 * 60 // tuần
      : months * 30 * 24 * 60;              // tháng

  try {
    await Promise.all(
      selectedRentalObjects.map((rental) =>
        axios.post(
          `${BACKEND_URL}/rentals/${rental.id}/request-extend`,
          {
            months,                         // ✅ BẮT BUỘC – FIX LỖI
            extendMinutes,                  // phút gia hạn
            currentExpiresAt: rental.expiresAt, // 🔥 để BE cộng tiếp
            voucherCode: voucher || null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      )
    );

    toast.success("Gửi yêu cầu gia hạn thành công!");
    setSelectedRentals([]);
    setExtendModal({ show: false, months: 1 });
    setVoucher("");
    fetchRentals();
  } catch (err) {
    console.error(err);
    toast.error("Không thể gửi yêu cầu gia hạn!");
  }
};

  if (loading) return <p>Đang tải danh sách thuê...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const selectedRentalObjects = selectedRentals
    .map((id) => rentals.find((r) => r.id === id))
    .filter(Boolean);
  const totalTabs = selectedRentalObjects.length;
  const totalPrice = calculateTotalPrice(selectedRentalObjects, extendModal.months);
const totalPriceBeforeDiscount = calculateTotalPrice(
  selectedRentalObjects,
  extendModal.months
);

const totalPriceAfterDiscount = discountPercent
  ? Math.round((totalPriceBeforeDiscount * (100 - discountPercent)) / 100)
  : totalPriceBeforeDiscount;

const discountAmount =
  totalPriceBeforeDiscount - totalPriceAfterDiscount;

  return (
    
    <div className="rental-card-container">
      <div style={{ marginBottom: "10px" }}>
        <button
          className="action-btn extend"
          onClick={openExtendModal}
          disabled={selectedRentals.length === 0}
        >
          Gia hạn combo ({selectedRentals.length} đơn)
        </button>
      </div>

      {rentals.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "30px", color: "#666" }}>
            Bạn chưa có đơn thuê nào
          </p>
        ) : (
          rentals.map((rental) => (
        <div
          key={rental.id}
          className={`rental-card ${isExpired(rental) ? "expired" : ""}`}
        >
          <div className="card-summary">
            <input
              type="checkbox"
              checked={selectedRentals.includes(rental.id)}
              onChange={() => handleSelectRental(rental.id)}
            />
            <div>
              <strong>ID:</strong> {rental.id}
            </div>
            <div>
              <strong>Room Code:</strong>{" "}
              {rental.roomCode
                ? rental.roomCode.split(" ").slice(0, -1).join(" ")
                : "Chờ 3-5 phút"}
            </div>
            <div>
              <strong>Pass:</strong>{" "}
              {rental.roomCode ? (
                <>
                  <span>{rental.roomCode.split(" ").slice(-1)[0]}</span>
                  <button
                    className="copy-pass"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        rental.roomCode.split(" ").slice(-1)[0]
                      );
                      toast.success("Copied Pass!");
                    }}
                    style={{ marginLeft: "6px" }}
                  >
                    Copy
                  </button>
                </>
              ) : (
                "-"
              )}
            </div>
            <div>
              <strong>Còn lại:</strong> {getRemainingTime(rental)}
            </div>
            <button
              className="toggle-detail-btn"
              onClick={() =>
                setShowDetail((prev) => ({
                  ...prev,
                  [rental.id]: !prev[rental.id],
                }))
              }
            >
              {showDetail[rental.id] ? "Ẩn chi tiết" : "Xem chi tiết"}
            </button>
          </div>

          {showDetail[rental.id] && (
            <div className="card-detail">
              <p>
                <strong>Username:</strong> {rental.username}
              </p>
              <p>
                <strong>Thời gian thuê:</strong> {rental.rentalTime / 60} giờ
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {dayjs(rental.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
              <p>
                <strong>Status:</strong> {rental.status}
              </p>

              <button
                onClick={() => handleRequestChangeTab(rental.id)}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Đổi tab
              </button>
            </div>
          )}
        </div>
        ))
)}

      {extendModal.show && (
        <div className="qr-modal" onClick={closeExtendModal}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gia hạn combo ({selectedRentals.length} đơn)</h3>

        <label>Thời gian gia hạn:</label>

        <div className="rent-mode">
          <button
            type="button"
            className={extendMode === "month" ? "active" : ""}
            onClick={() => {
              setExtendMode("month");
              setExtendModal({ ...extendModal, months: 1 });
            }}
          >
            Theo tháng
          </button>

          <button
            type="button"
            className={extendMode === "week" ? "active" : ""}
            onClick={() => {
              setExtendMode("week");
              setWeeks(1);
              setExtendModal({ ...extendModal, months: 0.25 });
            }}
          >
            Theo tuần
          </button>
        </div>

        {/* ===== CHỌN THÁNG ===== */}
        {extendMode === "month" && (
          <select
            value={extendModal.months}
            onChange={(e) =>
              setExtendModal({ ...extendModal, months: Number(e.target.value) })
            }
          >
            <option value={1}>1 tháng</option>
            {[...Array(11)].map((_, i) => (
              <option key={i + 2} value={i + 2}>
                {i + 2} tháng
              </option>
            ))}
          </select>
        )}

        {/* ===== CHỌN TUẦN ===== */}
        {extendMode === "week" && (
          <select
            value={weeks}
            onChange={(e) => {
              const w = Number(e.target.value);
              setWeeks(w);
              setExtendModal({ ...extendModal, months: w * 0.25 });
            }}
          >
            <option value={1}>1 tuần</option>
            <option value={2}>2 tuần</option>
            <option value={3}>3 tuần</option>
          </select>
        )}

            <div style={{ margin: "10px 0" }}>
              <label>Mã voucher:</label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="Voucher nếu có"
                style={{ marginLeft: "3px", padding: "4px 8px" }}
              />
              <button
                onClick={handleApplyVoucher}
                style={{
                  marginLeft: "8px",
                  padding: "4px 8px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Áp dụng
              </button>
            </div>
              {discountAmount > 0 && (
                <p style={{ color: "green" }}>Đã giảm: {discountAmount.toLocaleString()} VND</p>
              )}

              <p>
                Tổng tiền: <strong>{totalPriceAfterDiscount.toLocaleString()} VND</strong> ({totalTabs} tab)
              </p>


            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <p>Quét mã QR để thanh toán</p>
              <img
                src="/images/qrthanhtoan.png"
                alt="QR thanh toán"
                style={{
                  width: "200px",
                  height: "200px",
                  maxWidth: "80%",
                  objectFit: "contain",
                  border: "2px solid #ccc",
                  borderRadius: "16px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                  background: "#fff",
                  padding: "8px",
                }}
              />

              <div
                style={{
                  marginTop: "8px",
                  background: "#2e4b6eff",
                  fontSize: "14px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #d4e3ff",
                  textAlign: "center",
                }}
              >
                <strong>Viettinbank:</strong>{" "}
                <span style={{ color: "#007bff", fontWeight: "600" }}>0981263234</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("0981263234");
                    toast.success("Đã copy STK!");
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
                  Copy
                </button>
              </div>

              <div
                style={{
                  marginTop: "10px",
                  background: "#1b3a5fff",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #d4e3ff",
                  display: "inline-block",
                  fontSize: "14px",
                }}
              >
                <strong>Nội dung CK:</strong>{" "}
                <span style={{ color: "#007bff", fontWeight: "600" }}>
                  Gia hạn combo {selectedRentals.length}T (
                  {extendModal.months < 1
                    ? `${Math.round(extendModal.months * 4)} tuần`
                    : `${extendModal.months} tháng`}
                  )
                </span>
                <button
                  onClick={() => {
                    const txt = `Gia hạn combo ${selectedRentals.length}T (${
                      extendModal.months < 1
                        ? `${Math.round(extendModal.months * 4)} tuần`
                        : `${extendModal.months} tháng`
                    })`;
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
                    color: "#fff",
                  }}
                >
                  Copy ND
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleConfirmExtend}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px",
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={closeExtendModal}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
          
        </div>
        
      )}
        <BottomNav />
      <ToastContainer />
      
    </div>
  );
}

export default RentalList;

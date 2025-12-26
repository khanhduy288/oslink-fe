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
    if (!rental.expiresAt) return "0 phút";
    const rentalEnd = dayjs(rental.expiresAt).tz("Asia/Bangkok");
    const now = dayjs().tz("Asia/Bangkok");
    const diffMinutes = rentalEnd.diff(now, "minute");
    if (diffMinutes <= 0) return "Hết hạn";
    const days = Math.floor(diffMinutes / (24 * 60));
    const hours = Math.floor((diffMinutes % (24 * 60)) / 60);
    const minutes = diffMinutes % 60;
    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;
    return result.trim();
  };

  const isExpired = (rental) => {
    const created = dayjs.utc(rental.createdAt).tz("Asia/Bangkok");
    const rentalEnd = created.add(rental.rentalTime, "minute");
    return dayjs().tz("Asia/Bangkok").isAfter(rentalEnd);
  };

  const handleSelectRental = (id) => {
    setSelectedRentals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const calculateTotalPrice = (selectedRentalObjects, months = 1) => {
    const comboPrices = [
      { tabs: 5, price: 600000 },
      { tabs: 3, price: 400000 },
    ];
    const basePrice = 150000;
    let total = 0;

    const normalizedObjects = selectedRentalObjects.map((r) => ({
      ...r,
      pricePerTab: r.pricePerTab < basePrice ? basePrice : r.pricePerTab,
    }));

    let normalTabs = normalizedObjects.filter((r) => r.pricePerTab === basePrice).length;

    const sortedCombos = [...comboPrices].sort((a, b) => b.tabs - a.tabs);
    for (const combo of sortedCombos) {
      const count = Math.floor(normalTabs / combo.tabs);
      total += count * combo.price;
      normalTabs %= combo.tabs;
    }

    total += normalTabs * basePrice;

    const vipTotal = normalizedObjects
      .filter((r) => r.pricePerTab !== basePrice)
      .reduce((sum, r) => sum + r.pricePerTab, 0);

    total += vipTotal;

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
    const extendTimeInMinutes = months * 30 * 24 * 60;

    try {
      await Promise.all(
        selectedRentals.map((id) =>
          axios.post(
            `${BACKEND_URL}/rentals/${id}/request-extend`,
            {
              requestedExtendMonths: months,
              extendTimeInMinutes,
              months: extendModal.months,
              voucherCode: voucher || null,
              discount,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      toast.success("Gửi yêu cầu gia hạn combo thành công!");
      setSelectedRentals([]);
      setExtendModal({ show: false, months: 1 });
      setVoucher("");
      setDiscount(0);
      fetchRentals();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu gia hạn combo:", error);
      toast.error("Không thể gửi yêu cầu. Vui lòng thử lại!");
    }
  };

  if (loading) return <p>Đang tải danh sách thuê...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (rentals.length === 0) return <p>Bạn chưa có đơn thuê nào.</p>;

  const selectedRentalObjects = selectedRentals
    .map((id) => rentals.find((r) => r.id === id))
    .filter(Boolean);
  const totalTabs = selectedRentalObjects.length;
  const totalPrice = calculateTotalPrice(selectedRentalObjects, extendModal.months);
const totalPriceBeforeDiscount = calculateTotalPrice(selectedRentalObjects, extendModal.months);
const totalPriceAfterDiscount = discountPercent
  ? Math.round(totalPriceBeforeDiscount * (100 - discountPercent) / 100)
  : totalPriceBeforeDiscount;

const discountAmount = totalPriceBeforeDiscount - totalPriceAfterDiscount;

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

      {rentals.map((rental) => (
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
                {dayjs(rental.createdAt)
                  .tz("Asia/Bangkok")
                  .format("DD/MM/YYYY HH:mm:ss")}
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
      ))}

      {extendModal.show && (
        <div className="qr-modal" onClick={closeExtendModal}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gia hạn combo ({selectedRentals.length} đơn)</h3>

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

            <div style={{ margin: "10px 0" }}>
              <label>Mã voucher:</label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="Nhập mã voucher nếu có"
                style={{ marginLeft: "8px", padding: "4px 8px" }}
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
                  width: "350px",
                  height: "350px",
                  maxWidth: "95%",
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
                  marginTop: "14px",
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
                  Copy STK
                </button>
              </div>

              <div
                style={{
                  marginTop: "10px",
                  background: "#f6faff",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #d4e3ff",
                  display: "inline-block",
                  fontSize: "14px",
                }}
              >
                <strong>Nội dung CK:</strong>{" "}
                <span style={{ color: "#007bff", fontWeight: "600" }}>
                  Gia hạn combo {selectedRentals.length}T ({extendModal.months}T)
                </span>
                <button
                  onClick={() => {
                    const txt = `Gia hạn combo ${selectedRentals.length}T (${extendModal.months}T)`;
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

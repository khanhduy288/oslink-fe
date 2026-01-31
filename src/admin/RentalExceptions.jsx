import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./RentalExceptions.css";

const API = "https://api.tabtreo.com/admin/rental-exceptions";

const emptyForm = {
  customerName: "",
  rentType: "month",
  machineCount: 1,
  price: 0,
  status: "rent",
  createdAt: new Date().toISOString().slice(0,16), // yyyy-mm-ddTHH:mm
};

function RentalExceptions() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Hàm tính thời gian còn lại
  const calcTimeLeft = (expiryDate) => {
    const now = new Date();
    const diff = expiryDate - now;
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return { expired: false, days, hours, minutes };
  };

  const loadData = async () => {
    try {
      const res = await axios.get(API, { headers });

      const filteredData = res.data
        .filter((i) => filter === "all" || i.rentType === filter)
        .map((i) => {
          const daysRent = i.rentType === "week" ? 7 : 30;
          const createdAt = new Date(i.createdAt || i.time || i.createdAt);
          const expiryDate = new Date(
            createdAt.getTime() + daysRent * 24 * 60 * 60 * 1000
          );

          const { expired, days, hours, minutes } = calcTimeLeft(expiryDate);

          const warning = !expired && days === 0 && hours < 24;
          const nearExpiry = !expired && days <= 3;

          return {
            ...i,
            expiryDate,
            expired,
            warning,
            nearExpiry,
            timeLeft: { days, hours, minutes },
            showDetail: false,
          };
        })
        .filter((i) =>
          i.customerName.toLowerCase().includes(search.toLowerCase())
        );

      setItems(filteredData);
    } catch (err) {
      toast.error("Không tải được dữ liệu");
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, search]);

  const toggleDetail = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, showDetail: !i.showDetail } : i))
    );
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      customerName: item.customerName,
      rentType: item.rentType,
      machineCount: item.machineCount,
      price: item.price,
      status: item.status,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString().slice(0,16)
        : new Date().toISOString().slice(0,16),
    });
    setShowModal(true);
  };

  const submitForm = async () => {
    try {
      if (editingItem) {
        await axios.patch(`${API}/${editingItem.id}`, form, { headers });
        toast.success("Cập nhật thành công");
      } else {
        await axios.post(API, form, { headers });
        toast.success("Tạo rental thành công");
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Xóa đơn ngoại lệ này?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      toast.success("Đã xóa");
      loadData();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="list-container">
      <div className="admin-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="week">Thuê tuần</option>
          <option value="month">Thuê tháng</option>
        </select>

        <input
          type="text"
          placeholder="Tìm theo tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: "10px", padding: "4px" }}
        />

        <button onClick={openCreateModal}>➕ Tạo rental</button>
      </div>

      <div className="rental-card-container">
        {items.map((i) => (
          <div
            key={i.id}
            className={`rental-card ${
              i.expired
                ? "expired"
                : i.warning
                ? "warning"
                : i.nearExpiry
                ? "near-expiry"
                : ""
            }`}
          >
            <div className="card-summary">
              <div>
                <strong>Khách:</strong> {i.customerName}
              </div>
              <div className="hide-mobile">
                <strong>Kiểu thuê:</strong>{" "}
                {i.rentType === "week" ? "Tuần" : "Tháng"}
              </div>
              <div className="hide-mobile">
                <strong>Số máy:</strong> {i.machineCount}
              </div>
              <div className="hide-mobile">
                <strong>Giá:</strong> {i.price.toLocaleString()}
              </div>
              <div>
                <strong>Trạng thái:</strong>{" "}
                {i.status === "rent" ? "🟢 Thuê" : "🔴 Stop"}
              </div>

              {!i.expired && (
                <div style={{ marginTop: "5px", fontWeight: "bold" }}>
                  ⏳ Còn: {i.timeLeft.days}d {i.timeLeft.hours}h{" "}
                  {i.timeLeft.minutes}m
                </div>
              )}

              {i.expired && (
                <div style={{ marginTop: "5px", fontWeight: "bold", color: "red" }}>
                  ⛔ Đã hết hạn
                </div>
              )}

              <button
                className="toggle-detail-btn"
                onClick={() => toggleDetail(i.id)}
              >
                {i.showDetail ? "Ẩn chi tiết" : "Xem chi tiết"}
              </button>
            </div>

            {i.showDetail && (
              <div className="card-detail show">
                <div><strong>ID:</strong> {i.id}</div>
                <div>
                  <strong>Ngày bắt đầu thuê:</strong>{" "}
                  {new Date(i.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Kiểu thuê:</strong>{" "}
                  {i.rentType === "week" ? "Tuần" : "Tháng"}
                </div>
                <div><strong>Số máy:</strong> {i.machineCount}</div>
                <div><strong>Giá:</strong> {i.price.toLocaleString()}</div>
                <div><strong>Thành tiền:</strong> {(i.price * i.machineCount).toLocaleString()}</div>
                <div>
                  <strong>Hết hạn:</strong> {i.expiryDate.toLocaleString()} {i.expired && "(Đã hết hạn)"}
                </div>
                <div className="action-buttons">
                  <button className="action-btn edit" onClick={() => openEditModal(i)}>✏️ Sửa</button>
                  <button className="action-btn delete" onClick={() => deleteItem(i.id)}>❌ Xóa</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="overlay">
          <div className="modal">
            <h3>{editingItem ? "✏️ Sửa rental" : "➕ Tạo rental"}</h3>

            <label>Tên khách</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />

            <label>Kiểu thuê</label>
            <select
              value={form.rentType}
              onChange={(e) => setForm({ ...form, rentType: e.target.value })}
            >
              <option value="week">Thuê tuần</option>
              <option value="month">Thuê tháng</option>
            </select>

            <label>Số máy</label>
            <input
              type="number"
              value={form.machineCount}
              onChange={(e) => setForm({ ...form, machineCount: Number(e.target.value) })}
            />

            <label>Giá</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />

            <label>Ngày giờ bắt đầu thuê</label>
            <input
              type="datetime-local"
              value={form.createdAt}
              onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
            />

            <label>Thành tiền</label>
            <input
              value={(form.machineCount * form.price).toLocaleString()}
              disabled
            />

            <div className="modal-actions">
              <button onClick={submitForm} className="confirm-btn">💾 Xác nhận</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">❌ Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalExceptions;

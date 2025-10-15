import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Rentals.css'; // CSS cho bảng, nút và modal

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [editingRental, setEditingRental] = useState(null);
  const [editData, setEditData] = useState({ rentalTime: '', roomCode: '', requestedExtendMonths: '' });
  const [filterStatus, setFilterStatus] = useState("all"); // trạng thái filter
  const token = localStorage.getItem("token");
  const [filterUsername, setFilterUsername] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRentalData, setNewRentalData] = useState({ username: "", tabs: 1, months: 1 });
  const API_BASE = "https://api.tabtreo.com"; 

useEffect(() => {
  // Lần đầu fetch
  fetchRentals();

  // Thiết lập interval để tự động fetch mỗi 5 giây
  const interval = setInterval(() => {
    fetchRentals();
  }, 5000); // 5000ms = 5 giây

  // Cleanup khi component unmount
  return () => clearInterval(interval);
}, []);


const fetchRentals = async () => {
  try {
    const endpoint =
      localStorage.getItem("userLevel") >= 10
        ? "/admin/rentals"
        : "/rentals";

    const res = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 👉 Không sort, dùng nguyên dữ liệu BE trả về
    setRentals(res.data);
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi tải danh sách rentals");
  }
};

const formatMinutesToHours = (minutes) => {
  if (!minutes || minutes <= 0) return "0 giờ";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
};

const handleUpdateStatus = async (id, status, action = null) => {
  try {
    await axios.patch(
      `${API_BASE}/rentals/${id}`,
      { status, action },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchRentals();
    toast.success("Đã cập nhật rental!");
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi cập nhật status");
  }
};


  const handleConfirmExtend = async (id) => {
    try {
      await axios.patch(
        `${API_BASE}/rentals/${id}/confirm-extend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRentals();
      toast.success("Đã xác nhận gia hạn!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xác nhận gia hạn");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn này?")) return;
    try {
      await axios.delete(`${API_BASE}/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRentals();
      toast.success("Đã xóa rental!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa rental");
    }
  };

  const handleChangeTab = (rental) => {
    if (!rental.roomCode) {
      toast.warn("Phòng chưa có room code, vui lòng liên hệ admin support!");
      return;
    }
    toast.info("Chức năng đang phát triển, vui lòng liên hệ admin support");
  };

  const handleEditClick = (rental) => {
    setEditingRental(rental);
    setEditData({
      username: rental.username,
      rentalTime: rental.rentalTime,
      roomCode: rental.roomCode || '',
      requestedExtendMonths: rental.requestedExtendMonths || '',
      status: rental.status,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

const handleEditSubmit = async () => {
  try {
    const months = Number(editData.requestedExtendMonths) || 0;

    const extendMinutes = months * 30 * 24 * 60; // 1 tháng = 30 ngày
    const oldRentalTime = Number(editingRental.rentalTime);
    const oldExpiresAt = new Date(editingRental.expiresAt).getTime();

    const newRentalTime = oldRentalTime + extendMinutes;
    const newExpiresAt = new Date(oldExpiresAt + extendMinutes * 60000).toISOString();

    await axios.patch(
      `${API_BASE}/rentals/${editingRental.id}`,
      {
        username: editData.username,
        roomCode: editData.roomCode,
        rentalTime: newRentalTime,
        expiresAt: newExpiresAt,
        requestedExtendMonths: null, // reset sau khi gia hạn
        status: editData.status
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchRentals();
    setEditingRental(null);
    toast.success("Đã cập nhật rental và thời gian hết hạn!");
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi cập nhật rental");
  }
};


  const handleEditCancel = () => setEditingRental(null);

// Hàm xử lý input trong modal tạo mới
const handleCreateChange = (e) => {
  const { name, value } = e.target;
  setNewRentalData(prev => ({ ...prev, [name]: value }));
};

// Gửi POST tạo rental mới
const handleCreateSubmit = async () => {
  const { username, tabs, months } = newRentalData;
  if (!username || tabs < 1 || months < 1) {
    toast.warn("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    return;
  }

  try {
    await axios.post(`${API_BASE}/rentals`, { username, tabs, months }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success(`Tạo ${tabs} đơn thành công!`);
    setShowCreateModal(false);
    setNewRentalData({ username: "", tabs: 1, months: 1 });
    fetchRentals(); // load lại danh sách
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Lỗi khi tạo đơn thuê");
  }
};


  // --- Lọc danh sách theo trạng thái ---
const filteredRentals = rentals.filter(r => {
  const matchesStatus = filterStatus === "all" || r.status === filterStatus;
  const matchesUsername = r.username.toLowerCase().includes(filterUsername.toLowerCase());
  return matchesStatus && matchesUsername;
});

  return (
    <div className="rentals-container">
      <h2>Quản lý Rentals</h2>
{/* Filter + search gộp vào filter-left */}
<div className="filter-bar">
  <div className="filter-left" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
    <input
      type="text"
      placeholder="Tìm username..."
      value={filterUsername}
      onChange={(e) => setFilterUsername(e.target.value)}
      style={{ flex: '1 1 150px', minWidth: '120px' }}
    />
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      style={{ flex: '1 1 150px', minWidth: '120px' }}
    >
      <option value="all">Tất cả</option>
      <option value="pending">Đang chờ xác nhận</option>
      <option value="active">Đơn đang chạy</option>
      <option value="expired">Đơn hết hạn</option>
      <option value="retrieved">Đã thu hồi</option>
      <option value="pending_extend">Yêu cầu gia hạn</option>
      <option value="pending_change_tab">Yêu cầu đổi tab</option>
    </select>
  </div>

  {/* Nút tạo rental */}
  <button className="btn-create" onClick={() => setShowCreateModal(true)}>+ Tạo mới</button>
</div>
  {/* --- CREATE MODAL --- */}
  {showCreateModal && (
    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Tạo Rental mới</h3>
        <label>
          Username:
          <input type="text" name="username" value={newRentalData.username} onChange={handleCreateChange} />
        </label>
        <label>
          Số tabs:
          <input type="number" name="tabs" value={newRentalData.tabs} min="1" onChange={handleCreateChange} />
        </label>
        <label>
          Số tháng:
          <input type="number" name="months" value={newRentalData.months} min="1" onChange={handleCreateChange} />
        </label>
        <div className="modal-actions">
          <button className="btn-save" onClick={handleCreateSubmit}>Tạo</button>
          <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Hủy</button>
        </div>
      </div>
    </div>
  )}


      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Time</th>
            <th>Status</th>
            <th>Room Code</th>
            {/* <th>Gia hạn</th> */}
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredRentals.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.username}</td>
              <td>{formatMinutesToHours(r.rentalTime)}</td>
              <td>
                <span className={`status ${r.status}`}>
                  {r.status === "pending" && "Đang chờ xác nhận"}
                  {r.status === "active" && "Đơn đang chạy"}
                  {r.status === "expired" && "Đơn hết hạn"}
                  {r.status === "retrieved" && "Đã thu hồi"}
                  {r.status === "pending_extend" && "Yêu cầu gia hạn"}
                  {r.status === "pending_change_tab" && "Yêu cầu đổi tab"}
                </span>
              </td>
              <td>{r.roomCode || "Chưa tạo"}</td>
              <td className="actions">
                {r.status === "pending" && (
                  <button className="btn-confirm" onClick={() => handleUpdateStatus(r.id, "active")}>
                    Xác nhận
                  </button>
                )}
                {r.status === "expired" && (
                  <button
                    className="btn-retrieve"
                    onClick={() => handleUpdateStatus(r.id, "retrieved")}
                  >
                    Thu hồi
                  </button>
                )}
                {r.status === "pending_extend" && (
                  <button className="btn-extend" onClick={() => handleConfirmExtend(r.id)}>
                    Xác nhận gia hạn
                  </button>
                )}
                {r.status === "change_tab" && (
                  <button className="btn-tab" onClick={() => handleChangeTab(r)}>
                    Đổi tab
                  </button>
                )}
                {r.status === "pending_change_tab" && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span>Đang chờ đổi tab...</span>
                    <button
                      className="btn-confirm"
                      onClick={() =>
                        handleUpdateStatus(r.id, "active", "confirm_change_tab")
                      }
                    >
                      Xác nhận đổi tab
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() =>
                        handleUpdateStatus(r.id, "active", "cancel_change_tab")
                      }
                    >
                      Hủy yêu cầu
                    </button>
                  </div>
                )}
                <button className="btn-edit" onClick={() => handleEditClick(r)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(r.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- EDIT MODAL --- */}
      {editingRental && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sửa Rental ID {editingRental.id}</h3>

            <label>
              Username:
              <input
                type="text"
                name="username"
                value={editData.username || ""}
                onChange={handleEditChange}
              />
            </label>

            <label>
              Thời gian thuê (phút):
              <input
                type="number"
                name="rentalTime"
                value={editData.rentalTime}
                onChange={handleEditChange}
              />
              <span style={{ marginLeft: "8px" }}>{formatMinutesToHours(editData.rentalTime)}</span>
            </label>

            <label>
              Room Code:
              <input
                type="text"
                name="roomCode"
                value={editData.roomCode}
                onChange={handleEditChange}
              />
            </label>

            <label>
              Gia hạn (tháng):
              <input
                type="number"
                name="requestedExtendMonths"
                value={editData.requestedExtendMonths}
                onChange={handleEditChange}
              />
            </label>

            <label>
              Status:
              <select
                name="status"
                value={editData.status || editingRental.status}
                onChange={handleEditChange}
              >
                <option value="pending">Đang chờ xác nhận</option>
                <option value="active">Đơn đang chạy</option>
                <option value="expired">Đơn hết hạn</option>
                <option value="retrieved">Đã thu hồi</option>
                <option value="pending_extend">Yêu cầu gia hạn</option>
                <option value="pending_change_tab">Yêu cầu đổi tab</option>
              </select>
            </label>

            <div className="modal-actions">
              <button className="btn-save" onClick={handleEditSubmit}>Lưu</button>
              <button className="btn-cancel" onClick={handleEditCancel}>Hủy</button>
            </div>
          </div>
        </div>
      )}


      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Rentals;









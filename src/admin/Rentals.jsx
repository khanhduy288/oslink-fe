import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Rentals.css'; // CSS cho bảng, nút và modal

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [editingRental, setEditingRental] = useState(null);
  const [editData, setEditData] = useState({ rentalTime: '', roomCode: '', requestedExtendMonths: '' });
  const token = localStorage.getItem("token");

  const API_BASE = "https://api.tabtreo.com"; // <-- Thay đổi URL backend ở đây

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rentals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách rentals");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API_BASE}/rentals/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRentals();
      toast.success("Đã xác nhận rental!");
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

  // --- EDIT FUNCTIONS ---
  const handleEditClick = (rental) => {
    setEditingRental(rental);
    setEditData({
      rentalTime: rental.rentalTime,
      roomCode: rental.roomCode || '',
      requestedExtendMonths: rental.requestedExtendMonths || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(
        `${API_BASE}/rentals/${editingRental.id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRentals();
      setEditingRental(null);
      toast.success("Đã cập nhật rental!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật rental");
    }
  };

  const handleEditCancel = () => setEditingRental(null);

  return (
    <div className="rentals-container">
      <h2>Quản lý Rentals</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Thời gian thuê (phút)</th>
            <th>Status</th>
            <th>Room Code</th>
            <th>Gia hạn</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.username}</td>
              <td>{r.rentalTime}</td>
              <td>{r.status}</td>
              <td>{r.roomCode || "Chưa tạo"}</td>
              <td>{r.requestedExtendMonths ? `${r.requestedExtendMonths} tháng` : "-"}</td>
              <td className="actions">
                {r.status === "pending" && (
                  <button className="btn-confirm" onClick={() => handleUpdateStatus(r.id, "active")}>
                    Xác nhận
                  </button>
                )}
                {r.status === "pending_extend" && (
                  <button className="btn-extend" onClick={() => handleConfirmExtend(r.id)}>
                    Xác nhận gia hạn
                  </button>
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
              Thời gian thuê (phút):
              <input type="number" name="rentalTime" value={editData.rentalTime} onChange={handleEditChange} />
            </label>
            <label>
              Room Code:
              <input type="text" name="roomCode" value={editData.roomCode} onChange={handleEditChange} />
            </label>
            <label>
              Gia hạn (tháng):
              <input type="number" name="requestedExtendMonths" value={editData.requestedExtendMonths} onChange={handleEditChange} />
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

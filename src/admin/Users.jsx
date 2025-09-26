import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Users() {
  const [users, setUsers] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({ userId: null, newPassword: "" });
  const token = localStorage.getItem("token");

  const API_BASE = "https://api.tabtreo.com";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách users");
    }
  };

  const exportExcel = () => {
  if (!users || users.length === 0) return;

  const data = users.map(u => ({
    ID: u.id,
    Username: u.username,
    Phone: u.phone,
    Level: u.level,
    CreatedAt: u.createdAt
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "Danh_sach_users.xlsx");
};

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa user");
    }
  };

  // Mở modal reset pass
  const handleOpenReset = (userId) => {
    setResetData({ userId, newPassword: "" });
    setShowResetModal(true);
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, newPassword: e.target.value });
  };

  const handleResetSubmit = async () => {
    const { userId, newPassword } = resetData;
    if (!newPassword || newPassword.length < 6) {
      alert("Mật khẩu phải >= 6 ký tự");
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/admin/reset-password`,
        { userId, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Reset mật khẩu thành công!");
      setShowResetModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi reset mật khẩu");
    }
  };

  return (
    <div>
      <h2>Quản lý Users</h2>
      <button onClick={exportExcel} style={{ marginBottom: "12px" }}>
        Xuất Excel
      </button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Phone</th>
            <th>Level</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.phone}</td>
              <td>{u.level}</td>
              <td>
                <button onClick={() => handleDelete(u.id)}>Xóa</button>
                <button
                  style={{ marginLeft: "8px" }}
                  onClick={() => handleOpenReset(u.id)}
                >
                  Reset Pass
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- RESET PASSWORD MODAL --- */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset mật khẩu</h3>
            <label>
              Mật khẩu mới:
              <input
                type="password"
                value={resetData.newPassword}
                onChange={handleResetChange}
              />
            </label>
            <div style={{ marginTop: "12px" }}>
              <button onClick={handleResetSubmit}>Xác nhận</button>
              <button onClick={() => setShowResetModal(false)} style={{ marginLeft: "8px" }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;

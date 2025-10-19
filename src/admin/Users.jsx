import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
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
      setFilteredUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách users");
    }
  };

  // Lọc theo số điện thoại
  useEffect(() => {
    if (searchPhone.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lower = searchPhone.toLowerCase();
      setFilteredUsers(
        users.filter((u) => u.phone?.toLowerCase().includes(lower))
      );
    }
  }, [searchPhone, users]);

  const exportExcel = () => {
    if (!users || users.length === 0) return;

    const data = users.map((u) => ({
      ID: u.id,
      Username: u.username,
      Phone: u.phone,
      Level: u.level,
      CreatedAt: u.createdAt,
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

  // --- STYLES ---
  const container = {
    padding: "16px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    boxSizing: "border-box",
  };

  const title = {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
    textAlign: "center",
  };

  const controls = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  };

  const input = {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "220px",
    fontSize: "14px",
  };

  const button = {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  };

  const btnExport = { ...button, background: "#28a745", color: "#fff" };
  const btnDelete = { ...button, background: "#dc3545", color: "#fff" };
  const btnReset = { ...button, background: "#007bff", color: "#fff" };

  const tableWrapper = {
    overflowX: "auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  };

  const th = { background: "#007bff", color: "#fff", padding: "10px", textAlign: "left" };
  const td = { border: "1px solid #ddd", padding: "10px", fontSize: "14px" };

  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContent = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  };

  return (
    <div style={container}>
      <h2 style={title}>👤 Quản lý Users</h2>

      <div style={controls}>
        <input
          type="text"
          placeholder="🔍 Tìm theo số điện thoại..."
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          style={input}
        />
        <button onClick={exportExcel} style={btnExport}>
          📊 Xuất Excel
        </button>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Username</th>
              <th style={th}>Phone</th>
              <th style={th}>Level</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={td}>{u.id}</td>
                  <td style={td}>{u.username}</td>
                  <td style={td}>{u.phone}</td>
                  <td style={td}>{u.level}</td>
                  <td style={td}>
                    <button style={btnDelete} onClick={() => handleDelete(u.id)}>
                      Xóa
                    </button>
                    <button style={btnReset} onClick={() => handleOpenReset(u.id)}>
                      Reset Pass
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- RESET PASSWORD MODAL --- */}
      {showResetModal && (
        <div style={modalOverlay} onClick={() => setShowResetModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Reset mật khẩu</h3>
            <label>
              Mật khẩu mới:
              <input
                type="password"
                value={resetData.newPassword}
                onChange={handleResetChange}
                style={{ ...input, width: "95%", marginTop: "8px" }}
              />
            </label>
            <div style={{ marginTop: "12px", textAlign: "right" }}>
              <button style={btnReset} onClick={handleResetSubmit}>
                Xác nhận
              </button>
              <button style={btnDelete} onClick={() => setShowResetModal(false)}>
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminLogs.css";

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const API_BASE = "https://api.tabtreo.com";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Load logs failed:", err);
      }
    };
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(
    (log) =>
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.username?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="logs-page">
      <h2>Lịch sử hoạt động</h2>

      <input
        type="text"
        placeholder="Tìm kiếm theo admin hoặc nội dung..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="logs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Hành động</th>
            <th>Chi tiết</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.username || "—"}</td>
              <td>{log.action}</td>
              <td>{log.details}</td>
              <td>{log.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLogs.length === 0 && <p className="no-data">Không có dữ liệu</p>}
    </div>
  );
}

export default AdminLogs;

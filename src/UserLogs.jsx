import React, { useEffect, useState } from "react";
import axios from "axios";

function UserLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const API_BASE = "https://api.tabtreo.com";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/logs`, {
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
      log.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Lịch sử của tôi</h2>

      <input
        type="text"
        placeholder="Tìm kiếm theo hành động hoặc nội dung..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Hành động</th>
              <th style={styles.th}>Chi tiết</th>
              <th style={styles.th}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={log.id} style={styles.tr}>
                <td style={styles.td}>{index + 1}</td> {/* Dùng số thứ tự */}
                <td style={styles.td}>{log.action}</td>
                <td style={styles.td}>{log.details}</td>
                <td style={styles.td}>{log.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && <p style={styles.noData}>Không có dữ liệu</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "15px",
    color: "#1E90FF",
  },
  searchInput: {
    width: "100%",
    padding: "10px 15px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  th: {
    backgroundColor: "#1E90FF",
    color: "white",
    textAlign: "left",
    padding: "10px",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  tr: {
    borderBottom: "1px solid #ddd",
    transition: "background 0.2s",
  },
  td: {
    padding: "10px",
  },
  noData: {
    marginTop: "20px",
    fontStyle: "italic",
    color: "#555",
  },
};

export default UserLogs;

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://api.tabtreo.com";

function RoomGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | expired

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/room-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data || []);
      } catch (err) {
        console.error("Fetch groups error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <p>Đang tải danh sách...</p>;

  const filteredGroups = groups.filter((g) => {
    if (filter === "active") return !g.expired;
    if (filter === "expired") return g.expired;
    return true;
  });

  const containerStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  };
  const titleStyle = {
    marginBottom: "15px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
  };
  const filterBox = {
    marginBottom: "20px",
  };
  const selectStyle = {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    outline: "none",
    cursor: "pointer",
  };
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };
  const thStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
  };
  const tdStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    fontSize: "14px",
  };
  const expiredRow = {
    backgroundColor: "#ffe5e5",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Danh sách Group</h2>

      <div style={filterBox}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>
          Lọc danh sách:
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Tất cả</option>
          <option value="active">Còn hạn</option>
          <option value="expired">Hết hạn</option>
        </select>
      </div>

      {filteredGroups.length === 0 ? (
        <p style={{ color: filter === "expired" ? "red" : "green" }}>
          Không có group nào {filter === "expired" ? "hết hạn" : "còn hạn"}.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Group</th>
              <th style={thStyle}>Số lượng Rentals</th>
              <th style={thStyle}>Thiết bị trong Room</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((g, idx) => (
              <tr key={idx} style={g.expired ? expiredRow : {}}>
                <td style={tdStyle}>{g.group}</td>
                <td style={tdStyle}>{g.count}</td>
                <td style={tdStyle}>
                  {g.rooms.map((room, i) => (
                    <div key={i}>{room}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RoomGroups;

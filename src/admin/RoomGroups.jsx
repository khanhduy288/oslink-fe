import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://api.tabtreo.com";

function RoomGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | expired

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/room-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Gom theo groupKey + username + phone
        const groupMap = {};
        (res.data || []).forEach((g) => {
          g.rooms.forEach((room, i) => {
            const username = g.usernames?.[i] || "";
            const phone = g.phones?.[i] || "";
            const shortRoom = room.split(" ").slice(0, -1).join(" "); // rút gọn roomCode
            const remaining = g.remainingTimes?.[i];

            // key để gom
            const key = `${g.group}-${username}-${phone}`;
            if (!groupMap[key]) {
              groupMap[key] = {
                group: g.group,
                username,
                phone,
                rooms: [],
                remainingTimes: [],
                expired: false,
              };
            }

            groupMap[key].rooms.push(shortRoom);
            groupMap[key].remainingTimes.push(remaining);
            if (g.expired) groupMap[key].expired = true;
          });
        });

        const groupList = Object.values(groupMap).map((g) => ({
          ...g,
          count: g.rooms.length,
        }));

        setGroups(groupList);
      } catch (err) {
        console.error("Fetch rooms error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <p>Đang tải danh sách...</p>;

  const filteredGroups = groups.filter((g) => {
    if (filter === "active") return !g.expired;
    if (filter === "expired") return g.expired;
    return true;
  });

  const formatTime = (minutes) => {
    if (minutes == null) return "-";
    const days = Math.floor(minutes / 1440);
    const hrs = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    return `${days}d ${hrs}h ${mins}m`;
  };

  const containerStyle = { padding: "20px", fontFamily: "Arial, sans-serif" };
  const titleStyle = { marginBottom: "15px", fontSize: "22px", fontWeight: "bold", color: "#333" };
  const filterBox = { marginBottom: "20px" };
  const selectStyle = { padding: "8px 12px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px", outline: "none", cursor: "pointer" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" };
  const thStyle = { backgroundColor: "#007bff", color: "#fff", padding: "10px", textAlign: "left" };
  const tdStyle = { border: "1px solid #ddd", padding: "10px", fontSize: "14px" };
  const expiredRow = { backgroundColor: "#ffe5e5" };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Danh sách Rentals</h2>

      <div style={filterBox}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>Lọc danh sách:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
          <option value="all">Tất cả</option>
          <option value="active">Còn hạn</option>
          <option value="expired">Hết hạn</option>
        </select>
      </div>

      {filteredGroups.length === 0 ? (
        <p style={{ color: filter === "expired" ? "red" : "green" }}>
          Không có room nào {filter === "expired" ? "hết hạn" : "còn hạn"}.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>GroupKey</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>RoomCode</th>
              <th style={thStyle}>Thời gian còn lại</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((g, idx) => (
              <tr key={idx} style={g.expired ? expiredRow : {}}>
                <td style={tdStyle}>{g.group}</td>
                <td style={tdStyle}>{g.username}</td>
                <td style={tdStyle}>{g.phone}</td>
                <td style={tdStyle}>
                  {g.rooms.map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
                </td>
                <td style={tdStyle}>
                  {g.remainingTimes.map((t, i) => (
                    <div key={i}>{formatTime(t)}</div>
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

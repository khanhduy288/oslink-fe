import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://api.tabtreo.com";

function RoomGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/room-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const groupMap = {};
        (res.data || []).forEach((g) => {
          g.rooms.forEach((room, i) => {
            const username = g.usernames?.[i] || "";
            const phone = g.phones?.[i] || "";
            const shortRoom = room.split(" ").slice(0, -1).join(" ");
            const remaining = g.remainingTimes?.[i];
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

        setGroups(
          Object.values(groupMap).map((g) => ({
            ...g,
            count: g.rooms.length,
          }))
        );
      } catch (err) {
        console.error("Fetch rooms error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredGroups = groups.filter((g) => {
    const matchFilter =
      filter === "all" ? true : filter === "active" ? !g.expired : g.expired;
    const matchSearch = g.rooms.some((r) =>
      r.toLowerCase().includes(search.toLowerCase())
    );
    return matchFilter && (search === "" || matchSearch);
  });

  const formatTime = (minutes) => {
    if (minutes == null) return "-";
    const days = Math.floor(minutes / 1440);
    const hrs = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    return `${days}d ${hrs}h ${mins}m`;
  };

  const containerStyle = {
    padding: "16px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f7f9fb",
    minHeight: "100vh",
    boxSizing: "border-box",
  };

  const titleStyle = {
    marginBottom: "15px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  };

  const controlsWrapper = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  };

  const inputStyle = {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "200px",
    fontSize: "14px",
  };

  const selectStyle = {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    outline: "none",
    cursor: "pointer",
  };

  const tableWrapper = {
    overflowX: "auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  };

  const thStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
    fontSize: "14px",
  };

  const tdStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    fontSize: "14px",
    verticalAlign: "top",
  };

  const expiredRow = { backgroundColor: "#ffecec" };

  if (loading) return <p style={{ textAlign: "center" }}>Đang tải danh sách...</p>;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📋 Danh sách Rentals</h2>

      <div style={controlsWrapper}>
        <input
          type="text"
          placeholder="🔍 Tìm theo RoomCode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
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
        <p style={{ textAlign: "center", color: filter === "expired" ? "red" : "#007b55" }}>
          Không có room nào {filter === "expired" ? "hết hạn" : "còn hạn"}.
        </p>
      ) : (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>GroupKey</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>RoomCode</th>
                <th style={thStyle}>Thời gian còn lại</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g, idx) => (
                <tr key={idx} style={g.expired ? expiredRow : {}}>
                  <td style={tdStyle}>{g.group}</td>
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
        </div>
      )}
    </div>
  );
}

export default RoomGroups;

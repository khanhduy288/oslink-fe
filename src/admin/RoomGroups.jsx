import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
            const createdAt = room.createdAt || null;
            const shortRoom = room.roomCode.split(" ").slice(0, -1).join(" ");
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

            groupMap[key].rooms.push({ roomCode: shortRoom, createdAt });
            groupMap[key].remainingTimes.push(remaining);
            if (g.expired) groupMap[key].expired = true;
          });
        });

        setGroups(
          Object.values(groupMap).map((g) => ({
            ...g,
            count: g.rooms.length,
            minRemaining: Math.min(...g.remainingTimes.filter((t) => t != null)),
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

  const formatTime = (minutes) => {
    if (minutes == null) return "-";
    const d = Math.floor(minutes / 1440);
    const h = Math.floor((minutes % 1440) / 60);
    const m = minutes % 60;
    return `${d}d ${h}h ${m}m`;
  };

  const exportToExcel = () => {
    const rows = [];
    groups.forEach((g, stt) => {
      g.rooms.forEach((room, i) => {
        rows.push({
          STT: i === 0 ? stt + 1 : "",
          Group: i === 0 ? g.group : "",
          Phone: i === 0 ? g.phone : "",
          RoomCode: room.roomCode,
          "Còn lại": formatTime(g.remainingTimes[i]),
          "Ngày tạo": room.createdAt
            ? new Date(room.createdAt).toLocaleString("vi-VN")
            : "",
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RoomGroups");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `RoomGroups_${new Date().toLocaleDateString("vi-VN")}.xlsx`
    );
  };

  const filteredGroups = groups
    .filter((g) => {
      const f =
        filter === "all" ? true : filter === "active" ? !g.expired : g.expired;
      const s = g.rooms.some((r) =>
        r.roomCode.toLowerCase().includes(search.toLowerCase())
      );
      return f && (search === "" || s);
    })
    .sort((a, b) => a.minRemaining - b.minRemaining);

  if (loading)
    return <p style={{ textAlign: "center" }}>⏳ Đang tải dữ liệu...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1300, margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>
        👥 Quản lý Groups ({filteredGroups.length})
      </h2>

      {/* ===== FILTER BAR ===== */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <input
          placeholder="🔍 Tìm RoomCode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 240 }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="all">Tất cả</option>
          <option value="active">Còn hạn</option>
          <option value="expired">Hết hạn</option>
        </select>
        <button
          onClick={exportToExcel}
          style={{
            padding: "8px 14px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          📤 Xuất Excel
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 4px 10px rgba(0,0,0,.05)",
        }}
      >
        <thead style={{ background: "#f1f5ff" }}>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Group</th>
            <th style={th}>Phone</th>
            <th style={th}>Rooms</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((g, idx) => (
            <tr key={idx} style={g.expired ? { background: "#fff1f1" } : {}}>
              <td style={td}>{idx + 1}</td>
              <td style={td}>{g.group}</td>
              <td style={td}>{g.phone}</td>
              <td style={td}>
                {g.rooms.map((room, i) => {
                  const remain = g.remainingTimes[i];
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        marginBottom: 6,
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        background: "#f9fafb",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {room.roomCode}
                        </div>
                        {room.createdAt && (
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            🕒{" "}
                            {new Date(room.createdAt).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: remain > 0 ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {formatTime(remain)}
                      </span>
                    </div>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: 10,
  textAlign: "left",
  borderBottom: "2px solid #e5e7eb",
};

const td = {
  padding: 10,
  verticalAlign: "top",
  borderBottom: "1px solid #f1f1f1",
};

export default RoomGroups;
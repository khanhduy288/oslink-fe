import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./RoomGroups.css";

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
          Object.values(groupMap).map((g) => {
            // zip rooms + remainingTimes lại để sort
            const combined = g.rooms.map((room, i) => ({
              room,
              remaining: g.remainingTimes[i],
            }));

            // sort theo remaining tăng dần
            combined.sort((a, b) => {
              const ra = a.remaining ?? Infinity;
              const rb = b.remaining ?? Infinity;
              return ra - rb;
            });

            // tách lại sau khi sort
            const sortedRooms = combined.map((c) => c.room);
            const sortedTimes = combined.map((c) => c.remaining);

            const validTimes = sortedTimes.filter((t) => t != null);

            return {
              ...g,
              rooms: sortedRooms,
              remainingTimes: sortedTimes,
              count: sortedRooms.length,
              minRemaining: validTimes.length
                ? Math.min(...validTimes)
                : 0,
            };
          })
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
        filter === "all"
          ? true
          : filter === "active"
          ? !g.expired
          : g.expired;

      const s = g.rooms.some((r) =>
        r.roomCode.toLowerCase().includes(search.toLowerCase())
      );

      return f && (search === "" || s);
    })
    .sort((a, b) => a.minRemaining - b.minRemaining);

  if (loading) {
    return <p className="loading-text">⏳ Đang tải dữ liệu...</p>;
  }

  return (
    <div className="room-groups-container">
      <h2 className="room-groups-title">
        👥 Quản lý Groups ({filteredGroups.length})
      </h2>

      {/* ===== FILTER BAR ===== */}
      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="🔍 Tìm RoomCode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="active">Còn hạn</option>
          <option value="expired">Hết hạn</option>
        </select>

        <button className="export-btn" onClick={exportToExcel}>
          📤 Xuất Excel
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <table className="room-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Group</th>
            <th>Phone</th>
            <th>Rooms</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((g, idx) => (
            <tr
              key={idx}
              className={g.expired ? "row-expired" : ""}
            >
              <td>{idx + 1}</td>
              <td>{g.group}</td>
              <td>{g.phone}</td>
              <td>
                {g.rooms.map((room, i) => {
                  const remain = g.remainingTimes[i];
                  return (
                    <div key={i} className="room-card">
                      <div className="room-info">
                        <div className="room-code">
                          {room.roomCode}
                        </div>
                        {room.createdAt && (
                          <div className="room-created">
                            🕒{" "}
                            {new Date(room.createdAt).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>

                      <span
                        className={`time-remaining ${
                          remain > 0 ? "time-active" : "time-expired"
                        }`}
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

export default RoomGroups;
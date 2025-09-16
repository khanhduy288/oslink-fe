import React, { useEffect, useState } from "react";
import axios from "axios";

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await axios.get("https://oslinksymtem.onrender.com/rentals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách rentals");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`https://oslinksymtem.onrender.com/rentals/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRentals();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn này?")) return;
    try {
      await axios.delete(`https://oslinksymtem.onrender.com/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRentals();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa rental");
    }
  };

  return (
    <div>
      <h2>Quản lý Rentals</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>UserId</th>
            <th>Thời gian thuê (phút)</th>
            <th>Status</th>
            <th>Room Code</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.userId}</td>
              <td>{r.rentalTime}</td>
              <td>{r.status}</td>
              <td>{r.roomCode || "Chưa tạo"}</td>
              <td>
                {r.status === "pending" && (
                  <button onClick={() => handleUpdateStatus(r.id, "active")}>Xác nhận</button>
                )}
                <button onClick={() => handleDelete(r.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Rentals;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RentalList.css";

function RentalList() {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/rentals")
      .then(res => setRentals(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="list-container">
      <h2>Danh sách thuê</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Thời gian thuê</th>
            <th>Ngày tạo</th>
            <th>Room Code</th> {/* Thêm cột mới */}
          </tr>
        </thead>
        <tbody>
          {rentals.map(rental => (
            <tr key={rental.id}>
              <td data-label="ID">{rental.id}</td>
              <td data-label="User ID">{rental.userId}</td>
              <td data-label="Thời gian thuê">{rental.rentalTime / 60} giờ</td>
              <td data-label="Ngày tạo">{rental.createdAt}</td>
              <td data-label="Room Code">{rental.roomCode || "Chưa tạo"}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default RentalList;

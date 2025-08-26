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
              <td>{rental.id}</td>
              <td>{rental.userId}</td>
              <td>{rental.rentalTime / 60} giờ</td>
              <td>{rental.createdAt}</td>
              <td>{rental.roomCode || "Chưa tạo"}</td> {/* Hiển thị room code */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RentalList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RentalList.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function RentalList() {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/rentals")
      .then(res => setRentals(res.data))
      .catch(err => console.error(err));
  }, []);

  // Kiểm tra hết hạn theo GMT+7
  const isExpired = (rental) => {
    const created = dayjs.utc(rental.createdAt).tz("Asia/Bangkok"); // giờ tạo GMT+7
    const rentalEnd = created.add(rental.rentalTime, "minute"); // cộng thời gian thuê
    return dayjs().tz("Asia/Bangkok").isAfter(rentalEnd); // giờ hiện tại > kết thúc
  };

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
            <th>Room Code</th>
            <th>Status</th> {/* Thêm cột này */}
          </tr>
        </thead>
        <tbody>
          {rentals.map(rental => (
            <tr key={rental.id} className={isExpired(rental) ? "expired" : ""}>
              <td data-label="ID">{rental.id}</td>
              <td data-label="User ID">{rental.userId}</td>
              <td data-label="Thời gian thuê">{rental.rentalTime / 60} giờ</td>
              <td data-label="Ngày tạo">{new Date(rental.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" })}</td>
              <td data-label="Room Code">{rental.roomCode || "Chưa tạo"}</td>
              <td data-label="Status">{rental.status}</td> {/* Hiển thị status */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RentalList;

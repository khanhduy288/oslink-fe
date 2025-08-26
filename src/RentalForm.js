import React, { useState } from "react";
import axios from "axios";
import "./RentalForm.css";

function RentalForm() {
  const [userId, setUserId] = useState("");
  const [rentalTime, setRentalTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/rentals", {
      userId,
      rentalTime,
    });
    alert("Tạo mới thành công!");
    setUserId("");
    setRentalTime("");
  };

  return (
    <div className="form-container">
      <h2>Thuê dịch vụ</h2>
      <form onSubmit={handleSubmit}>
        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <label>Thời gian thuê (phút)</label>
        <input
          type="number"
          value={rentalTime}
          onChange={(e) => setRentalTime(e.target.value)}
          required
        />

        <button type="submit">Xác nhận</button>
      </form>
    </div>
  );
}

export default RentalForm;

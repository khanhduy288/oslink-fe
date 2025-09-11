import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./RentalForm.css";

function RentalForm() {
  const { serviceId } = useParams();
  const [userId, setUserId] = useState("");
  const [rentalTime, setRentalTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://oslinksymtem.onrender.com/rentals", {
        userId,
        rentalTime,
        serviceId, // gửi serviceId kèm
      });
      toast.success("Tạo mới thành công!");
      setUserId("");
      setRentalTime("");
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="form-container">
      <h2>Thuê dịch vụ #{serviceId}</h2>
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

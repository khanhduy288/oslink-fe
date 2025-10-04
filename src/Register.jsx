import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({
    phone: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://api.tabtreo.com"; // <-- đổi sang VPS mới

  // Hàm loại bỏ ký tự đặc biệt + dấu tiếng Việt
  const sanitizeInput = (value) => {
    return value
      .normalize("NFD") // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .replace(/[^a-zA-Z0-9]/g, ""); // chỉ giữ chữ + số
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = sanitizeInput(value);

    if (value !== cleanedValue) {
      toast.warn("Chỉ cho phép nhập chữ (không dấu) và số!");
    }

    setForm({ ...form, [name]: cleanedValue });
  };

  const validateForm = () => {
    const phoneRegex = /^(0|\+84)\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Số điện thoại không hợp lệ (VD: 098xxxxxxx)");
      return false;
    }

    if (form.username.length < 3) {
      toast.error("Tên người dùng phải từ 3 ký tự trở lên");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên");
      return false;
    }

    if (form.password !== form.confirm) {
      toast.error("Mật khẩu không khớp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/register`, {
        phone: form.phone,
        username: form.username,
        password: form.password,
      });

      toast.success(res.data.message || "Đăng ký thành công!");
      console.log("User registered:", res.data.user);
      setForm({ phone: "", username: "", password: "", confirm: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Số điện thoại: </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="VD: 0912345678"
            required
          />
        </div>

        <div className="form-group">
          <label>Tên người dùng: </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Chỉ chữ và số (không dấu)"
            required
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu: </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Ít nhất 6 ký tự (chữ và số)"
            required
          />
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu: </label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <div className="auth-footer">
        <span>Đã có tài khoản? </span>
        <Link to="/login" className="register-link">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default Register;

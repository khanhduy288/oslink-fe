import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login({ setUsername }) {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = "https://oslinksymtem.onrender.com"; // <-- đảm bảo đúng URL backend Render

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/login`, {
        phone: form.phone,
        password: form.password,
      });

      const { token, user } = res.data;
      if (!token || !user) {
        toast.error("Server trả dữ liệu không hợp lệ");
        return;
      }

      // lấy display name
      const displayName = user.username || user.phone;

      // lưu localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userLevel", user.level);
      localStorage.setItem("userId", user.id); // thêm userId
      localStorage.setItem("username", displayName);
      if (setUsername) setUsername(displayName);

      toast.success(res.data.message || "Đăng nhập thành công!");
      console.log("User logged in:", user);

      navigate("/"); // chuyển về trang chủ
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra khi đăng nhập";
      toast.error(msg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng nhập</h2>
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
          <label>Mật khẩu: </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mật khẩu ≥6 ký tự"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="auth-footer">
        <span>Chưa có tài khoản? </span>
        <Link to="/register" className="register-link">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default Login;
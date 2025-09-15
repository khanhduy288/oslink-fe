import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login({ setUsername }) {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("https://oslinksymtem.onrender.com/login", {
        phone: form.phone,
        password: form.password,
      });

      const { token, user } = res.data;
      const displayName = user.username || user.phone;

      localStorage.setItem("token", token);
      localStorage.setItem("userLevel", user.level);
      localStorage.setItem("username", displayName);

      if (setUsername) setUsername(displayName);

      toast.success(res.data.message || "Đăng nhập thành công!");
      console.log("User logged in:", user);

      navigate("/"); 
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập";
      toast.error(msg);
      console.error(err);
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

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("https://oslinksymtem.onrender.com/login", {
        email: form.email,
        password: form.password,
      });

      const { token, user } = res.data;

      // Lưu token + level
      localStorage.setItem("token", token);
      localStorage.setItem("userLevel", user.level);

      toast.success(res.data.message || "Đăng nhập thành công!");
      console.log("User logged in:", user);

      setForm({ email: "", password: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập";
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
          <label>Email: </label>
          <input
            type="email"
            name="email"
            value={form.email}
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
    </div>
  );
}

export default Login;

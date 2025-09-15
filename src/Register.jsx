import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({ phone: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const res = await axios.post("https://oslinksymtem.onrender.com/register", {
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

        <div className="form-group">
          <label>Xác nhận mật khẩu: </label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
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

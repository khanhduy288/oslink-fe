import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/register", {
        email: form.email,
        password: form.password,
      });

      toast.success(res.data.message || "Đăng ký thành công!");
      console.log("User registered:", res.data.user);
      setForm({ email: "", password: "", confirm: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
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
    </div>
  );
}

export default Register;

import React, { useState } from "react";
import { toast } from "react-toastify";

function Register() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    // TODO: call API backend register
    console.log("Register data:", form);
    toast.success("Đăng ký thành công (demo)");
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Mật khẩu: </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Xác nhận mật khẩu: </label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}

export default Register;

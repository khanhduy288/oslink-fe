import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css"; // ✅ css riêng

function Settings() {
  const [workerApi, setWorkerApi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load WORKER_API khi mở trang
  useEffect(() => {
    axios
      .get("https://api.tabtreo.com/admin/worker", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      })
      .then((res) => {
        setWorkerApi(res.data.WORKER_API);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Lỗi khi load WORKER_API");
      });
  }, []);

  // Chỉ lưu WORKER_API
  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(
        "https://api.tabtreo.com/admin/worker",
        { url: workerApi },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      setMessage("✅ Đã lưu cấu hình thành công!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>Cấu hình Tool</h2>

        {/* WORKER_API */}
        <div className="form-group">
          <label>WORKER_API URL</label>
          <input
            type="text"
            value={workerApi}
            onChange={(e) => setWorkerApi(e.target.value)}
            className="input"
            placeholder="Nhập URL worker API"
          />
        </div>

        {/* UI Kiểu Click Server (chỉ hiển thị, không lưu) */}
        <div className="form-group">
          <label>Kiểu Click Server</label>
          <select value="click_min_number" disabled className="input">
            <option value="click_min_number">Click Min Number</option>
            <option value="click_name_server">Click Name Server</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn">
          {loading ? "Đang lưu..." : "Lưu"}
        </button>

        {message && <p className="message">{message}</p>}

        {/* Hướng dẫn */}
        <div className="instructions">
          <h3>📌 Hướng dẫn bật tool</h3>
          <ol>
            <li>Mở CMD/PowerShell, cd vào thư mục <code>OslinkSymtem\agent</code></li>
            <li>Chạy <code>python agent.py</code></li>
            <li>Mở ngrok: <code>ngrok http 5001</code></li>
            <li>Dán URL ngrok vào ô WORKER_API</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Settings;

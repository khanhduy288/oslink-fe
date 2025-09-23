// Settings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css"; // ✅ thêm file css riêng

function Settings() {
  const [workerApi, setWorkerApi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Gọi API lấy WORKER_API khi load
  useEffect(() => {
    axios.get("https://api.tabtreo.com/admin/worker", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
    .then(res => {
      setWorkerApi(res.data.WORKER_API);
    })
    .catch(err => {
      console.error(err);
      setMessage("Lỗi khi load WORKER_API");
    });
  }, []);

  // Hàm cập nhật WORKER_API
  const handleSave = () => {
    setLoading(true);
    axios.patch("https://api.tabtreo.com/admin/worker",
      { url: workerApi },
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    )
    .then(res => {
      setMessage("✅ Cập nhật thành công!");
    })
    .catch(err => {
      setMessage("❌ Lỗi khi cập nhật");
    })
    .finally(() => setLoading(false));
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>Cấu hình Tool (WORKER_API)</h2>
        <p className="desc">Thay đổi URL ngrok/worker để kết nối với tool chạy trên PC.</p>

        <div className="form-group">
          <input
            type="text"
            value={workerApi}
            onChange={(e) => setWorkerApi(e.target.value)}
            className="input"
            placeholder="Nhập URL worker API"
          />
          <button onClick={handleSave} disabled={loading} className="btn">
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        {/* Hướng dẫn bật tool */}
        <div className="instructions">
          <h3>📌 Hướng dẫn bật tool</h3>
          <ol>
            <li>Mở CMD/PowerShell, chuyển đến thư mục <code>OslinkSymtem\agent</code>
            </li>
            <li>Chạy agent:
              <br /><code>python agent.py</code>
            </li>
            <li>Mở một cửa sổ CMD khác để chạy ngrok:
              <br /><code>ngrok http 5001</code>
            </li>
            <li>Sao chép URL ngrok và dán vào ô WORKER_API ở trên, nhấn "Lưu"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Settings;

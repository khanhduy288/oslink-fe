import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css"; // ✅ css riêng

function Settings() {
  const [workerApi, setWorkerApi] = useState("");
  const [clickMode, setClickMode] = useState("click_min_number"); // mode mặc định
  const [serverName, setServerName] = useState(""); // 🟢 thêm state cho server name
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load WORKER_API và actions khi mở trang
  useEffect(() => {
    // Lấy WORKER_API
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

    // Lấy actions.json để biết đang dùng mode nào
    axios
      .get("http://localhost:5001/actions")
      .then((res) => {
        const actions = res.data;
        const serverAction = actions.find(
          (a) => a.type === "click_min_number" || a.type === "click_name_server"
        );
        if (serverAction) {
          setClickMode(serverAction.type);
          if (serverAction.type === "click_name_server") {
            setServerName(serverAction.server_name || "");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("⚠️ Không load được actions từ tool");
      });
  }, []);

  // Hàm lưu WORKER_API và cập nhật actions
  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Cập nhật WORKER_API
      await axios.patch(
        "https://api.tabtreo.com/admin/worker",
        { url: workerApi },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      // 2. Lấy actions hiện tại
      const res = await axios.get("http://localhost:5001/actions");
      let actions = res.data;

      // 3. Tìm và thay thế action click_server
      actions = actions.map((a) => {
        if (a.type === "click_min_number" || a.type === "click_name_server") {
          if (clickMode === "click_name_server") {
            return {
              ...a,
              type: "click_name_server",
              region_ratio: [0.031, 0.073, 0.051, 0.471], // 🟢 Name Server
              server_name: serverName, // 🟢 thêm server_name admin nhập
            };
          } else {
            return {
              ...a,
              type: "click_min_number",
              region_ratio: [0.918, 0.150, 0.055, 0.403], // 🟢 Min Number
            };
          }
        }
        return a;
      });

      // 4. Lưu lại actions
      await axios.post("http://localhost:5001/actions", actions);

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

        {/* Chọn mode click server */}
        <div className="form-group">
          <label>Kiểu Click Server</label>
          <select
            value={clickMode}
            onChange={(e) => setClickMode(e.target.value)}
            className="input"
          >
            <option value="click_min_number">Click Min Number</option>
            <option value="click_name_server">Click Name Server</option>
          </select>
        </div>

        {/* Nhập server name nếu chọn click_name_server */}
        {clickMode === "click_name_server" && (
          <div className="form-group">
            <label>Tên Server</label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="input"
              placeholder="Nhập tên server (ví dụ: Asia1)"
            />
          </div>
        )}

        <button onClick={handleSave} disabled={loading} className="btn">
          {loading ? "Đang lưu..." : "Lưu"}
        </button>

        {message && <p className="message">{message}</p>}

        {/* Hướng dẫn */}
        <div className="instructions">
          <h3>📌 Hướng dẫn bật tool</h3>
          <ol>
            <li>
              Mở CMD/PowerShell, cd vào thư mục{" "}
              <code>OslinkSymtem\agent</code>
            </li>
            <li>Chạy <code>python agent.py</code></li>
            <li>Mở ngrok: <code>ngrok http 5001</code></li>
            <li>
              Dán URL ngrok vào ô WORKER_API và chọn chế độ click server
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Settings;

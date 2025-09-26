import React, { useEffect, useState } from "react";
import { FaLaptop, FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const POPUP_DELAY_HOURS = 24; // sau 24h lại hiện

const Home = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("homeWarningLastShown");
    const now = new Date().getTime();

    if (!lastShown || now - parseInt(lastShown) > POPUP_DELAY_HOURS * 3600 * 1000) {
      setShowWarning(true);
      localStorage.setItem("homeWarningLastShown", now.toString());
    }
  }, []);

  const handleNavigate = (link) => {
    navigate(link);
  };

  const closeWarning = () => setShowWarning(false);

  return (
    <div className="home-container">
      {showWarning && (
        <div className="warning-popup">
          <div className="warning-content">
            <h3>⚠️ LƯU Ý QUAN TRỌNG</h3>
            <ul style={{ textAlign: "left", paddingLeft: "20px", marginBottom: "15px" }}>
              <li>❌ Không đổi tên TAB sau khi thuê để tránh tình trạng mất TAB.</li>
              <li>💸 Không hoàn lại tiền trong mọi trường hợp.</li>
              <li>🧪 Hãy test trước khi thuê – liên hệ Support để được hỗ trợ test trong 1 giờ.</li>
              <li>📺 Xem video hướng dẫn tại mục “Hướng dẫn” để biết cách: thuê TAB, tải app, tải game và sử dụng các tính năng trong game.</li>
            </ul>
            <p style={{ fontWeight: "bold", marginBottom: "15px" }}>⏰ Thời gian làm việc: 8h00 – 22h00</p>
            <button onClick={closeWarning}>Đóng</button>
          </div>
        </div>
      )}

      <h2 className="home-title">TAB Treo Game Mobile</h2>

      <div className="card-box" onClick={() => handleNavigate("/rent")}>
        <FaLaptop size={40} color="#4a90e2" />
        <div>
          <h3>1. THUÊ TAB</h3>
          <p>Chọn và thuê tab game phù hợp với nhu cầu của bạn.</p>
        </div>
      </div>

      <div className="card-box" onClick={() => handleNavigate("/guide/videos")}>
        <FaVideo size={40} color="#f39c12" />
        <div>
          <h3>2. HƯỚNG DẪN</h3>
          <p>Xem video hướng dẫn tải app và game.</p>
        </div>
      </div>

      <div className="card-box" onClick={() => handleNavigate("/contact")}>
        <img src="/images/zalo-logo.png" alt="Zalo Logo" style={{ width: 40, height: 40 }} />
        <div>
          <h3>3. TRẢI NGHIỆM THỬ - INBOX =&gt; ZALO SUPPORT</h3>
          <p>Liên hệ ngay qua Zalo để được hỗ trợ nhanh chóng.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

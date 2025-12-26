import React, { useEffect, useState } from "react";
import { FaLaptop, FaVideo, FaListAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { FaMobileAlt, FaDollarSign, FaCheckCircle, FaHeadset } from "react-icons/fa";

const POPUP_DELAY_HOURS = 1; // sau 1h lại hiện popup

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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    navigate(link);
  };

  const closeWarning = () => setShowWarning(false);

  return (
    <div className="home-container">
      {showWarning && (
        <div className="warning-popup">
          <div className="warning-content">
            <h3>⚠️ LƯU Ý QUAN TRỌNG</h3>
            <ul className="warning-list">
              <li>✅ App treo game hỗ trợ trên cả Android và iOS, chạy mượt, ổn định !</li>
              <li>❌ Không đổi tên TAB sau khi thuê để tránh tình trạng mất TAB.</li>
              <li>💸 Không hoàn lại tiền trong mọi trường hợp.</li>
              <li>🧪 Hãy test trước khi thuê – liên hệ Support để được hỗ trợ test trong 1 giờ.</li>
              <li>📺 Xem video hướng dẫn tại mục “Hướng dẫn” để biết cách: thuê TAB, tải app, tải game và sử dụng các tính năng trong game.</li>
            </ul>
            <p className="work-time">⏰ Thời gian làm việc: 8h00 – 22h00</p>
            <button onClick={closeWarning}>Đóng</button>
          </div>
        </div>
      )}

      <h2 className="home-title">TAB Treo Game Mobile</h2>

      <div className="card-grid">
        <div className="card-box" onClick={() => handleNavigate("/rent")}>
          <FaLaptop size={40} color="#4a90e2" />
          <div>
            <h3>1. THUÊ TAB</h3>
            <p>Chọn và thuê tab game phù hợp với nhu cầu của bạn.</p>
          </div>
        </div>

        <div className="card-box" onClick={() => handleNavigate("/list")}>
          <FaListAlt size={40} color="#2ecc71" />
          <div>
            <h3>2. ĐƠN HÀNG</h3>
            <p>Xem các đơn hàng đã thuê, trạng thái và thời gian còn lại.</p>
          </div>
        </div>

        <div className="card-box" onClick={() => handleNavigate("/guide/videos")}>
          <FaVideo size={40} color="#f39c12" />
          <div>
            <h3>3. HƯỚNG DẪN</h3>
            <p>Xem video hướng dẫn tải app và game.</p>
          </div>
        </div>

        <div className="card-box" onClick={() => handleNavigate("/contact")}>
          <img src="/images/zalo-logo.png" alt="Zalo Logo" style={{ width: 40, height: 40 }} />
          <div>
            <h3>4. TRẢI NGHIỆM THỬ - INBOX =&gt; ZALO SUPPORT</h3>
            <p>Liên hệ ngay qua Zalo để được hỗ trợ nhanh chóng.</p>
          </div>
        </div>
      </div>

      {/* Video giới thiệu sản phẩm */}
      <div className="intro-video-section">
        <h3>🎬 Video giới thiệu sản phẩm</h3>
        <video
          src="/images/video3.mp4"
          controls
          loop
          muted
          className="intro-video"
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
      {/* Phần lý do chọn chúng tôi */}
      <div className="why-choose-section">
        <h3>Lý do chọn chúng tôi</h3>
        <div className="why-choose-grid">
          <div className="why-choose-card">
            <FaMobileAlt size={40} color="#fff" className="why-icon"/>
            <h4>Ổn định & Mượt mà</h4>
            <p>App và tab game chạy ổn định, mượt mà trên cả Android và iOS.</p>
          </div>
          <div className="why-choose-card">
            <FaDollarSign size={40} color="#fff" className="why-icon"/>
            <h4>Chi phí hợp lý</h4>
            <p>Giá thuê hợp lý, rõ ràng, không phát sinh phí ẩn.</p>
          </div>
          <div className="why-choose-card">
            <FaCheckCircle size={40} color="#fff" className="why-icon"/>
            <h4>Hỗ trợ test</h4>
            <p>Test trước khi thuê, đảm bảo phù hợp nhu cầu.</p>
          </div>
          <div className="why-choose-card">
            <FaHeadset size={40} color="#fff" className="why-icon"/>
            <h4>Hỗ trợ nhanh chóng</h4>
            <p>Hỗ trợ qua Zalo/Hotline, phản hồi trong 1 giờ.</p>
          </div>
        </div>
      </div>

      {/* Nút chat Zalo nổi góc màn hình */}
      <a
        href="https://zalo.me/0972734444"
        target="_blank"
        rel="noopener noreferrer"
        className="zalo-chat-button"
      >
        <img
          src="/images/zalologo1.png"
          alt="Zalo Chat"
          className="zalo-chat-icon"
        />
      </a>
    </div>
  );
};

export default Home;

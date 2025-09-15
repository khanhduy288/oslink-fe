import React from "react";
import { FaLaptop, FaDownload, FaVideo, FaHeadset } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // import css

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = (link) => {
    navigate(link);
  };

  return (
    <div className="home-container">
      <h2 className="home-title">TAB Treo Game Mobile</h2>

      <div className="card-box" onClick={() => handleNavigate("/rent")}>
        <FaLaptop size={40} color="#4a90e2" />
        <div>
          <h3>1. Thuê Tab</h3>
          <p>Chọn và thuê tab game phù hợp với nhu cầu của bạn.</p>
        </div>
      </div>

      <div className="card-box" onClick={() => handleNavigate("/guide/images")}>
        <FaDownload size={40} color="#28a745" />
        <div>
          <h3>2. Hướng Dẫn Tải App + Tải Game + Chức năng</h3>
          <p>Xem hướng dẫn chi tiết cách tải app, game và sử dụng chức năng.</p>
        </div>
      </div>

      <div className="card-box" onClick={() => handleNavigate("/guide/videos")}>
        <FaVideo size={40} color="#f39c12" />
        <div>
          <h3>3. Hướng Dẫn Tải App + Tải Game</h3>
          <p>Xem video hướng dẫn tải app và game.</p>
        </div>
      </div>

      <div className="card-box" onClick={() => handleNavigate("/contact")}>
        {/* Thay icon FaHeadset bằng logo Zalo */}
        <img 
          src="/images/zalo-logo.png"  // đường dẫn tới logo Zalo của bạn
          alt="Zalo Logo" 
          style={{ width: 40, height: 40 }}
        />
        <div>
          <h3>4. Zalo ADM Support</h3>
          <p>Liên hệ ngay qua Zalo để được hỗ trợ nhanh chóng.</p>
        </div>
      </div>

    </div>
  );
};

export default Home;

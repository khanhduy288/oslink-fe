import React from "react";
import { FaLaptop, FaDownload, FaVideo, FaHeadset } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = (link) => {
    navigate(link);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "0 15px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>TAB Treo Game Mobile</h2>

      {/* 1. Thuê Tab */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "15px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
        onClick={() => handleNavigate("/rent")}
      >
        <FaLaptop size={40} color="#4a90e2" />
        <div>
          <h3>1. Thuê Tab</h3>
          <p>Chọn và thuê tab game phù hợp với nhu cầu của bạn.</p>
        </div>
      </div>

      {/* 2. Hướng Dẫn Tải App + Tải Game + Chức năng */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "15px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
        onClick={() => handleNavigate("/guide")}
      >
        <FaDownload size={40} color="#28a745" />
        <div>
          <h3>2. Hướng Dẫn Tải App + Tải Game + Chức năng</h3>
          <p>Xem hướng dẫn chi tiết cách tải app, game và sử dụng chức năng.</p>
        </div>
      </div>

      {/* 3. Hướng Dẫn Tải App + Tải Game = Video */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "15px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
        onClick={() => handleNavigate("/guide")}
      >
        <FaVideo size={40} color="#f39c12" />
        <div>
          <h3>3. Hướng Dẫn Tải App + Tải Game</h3>
          <p>Xem video hướng dẫn tải app và game.</p>
        </div>
      </div>

      {/* 4. Hỗ trợ nhanh */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          cursor: "pointer",
          textAlign: "center",
          backgroundColor: "#f0f8ff",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          justifyContent: "center",
        }}
      onClick={() => handleNavigate("/contact")}
      >
        <FaHeadset size={40} color="#e74c3c" />
        <div>
          <h3>4. Hỗ trợ nhanh</h3>
          <p>Liên hệ ngay qua Zalo để được hỗ trợ nhanh chóng.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

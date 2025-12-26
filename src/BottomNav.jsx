import React from "react";
import { FaHome, FaListAlt, FaPlayCircle, FaCommentDots } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Trang chủ", icon: <FaHome />, path: "/" },
    { label: "Đơn hàng", icon: <FaListAlt />, path: "/list" },
    { label: "Hướng dẫn", icon: <FaPlayCircle />, path: "/guide/videos" },
    { label: "Hỗ trợ", icon: <FaCommentDots />, path: "/contact" },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item, idx) => (
        <div
          key={idx}
          className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;

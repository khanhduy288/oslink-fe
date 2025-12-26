import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './Header.css';
import { FiLogOut } from "react-icons/fi";
function Header({ username, userLevel, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLinkClick = () => {
    if (menuOpen) setMenuOpen(false);
  };

  return (
    <nav
      className="sticky-menu"
      style={{
        backgroundColor: isMobile ? "transparent" : "#1E90FF",
        backgroundImage: isMobile ? "url('/images/menu-bg.jpg')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}
    >
      <div className="app-nav-inner">
        <div className="nav-left">
          <Link to="/" className="logo-link" onClick={handleLinkClick}>
            <img
              src="/images/logo.jpg"
              alt="Logo"
              className="logo"
              style={{ height: "40px", marginRight: "15px", display: isMobile ? "none" : "block" }}
            />
          </Link>

          <div
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>

          <Link to="/" className="nav-link" onClick={handleLinkClick}>Trang chủ</Link>
          <Link to="/list" className="nav-link" onClick={handleLinkClick}>Đơn Hàng</Link>
          <Link to="/rent" className="nav-link" onClick={handleLinkClick}>Thuê Tab</Link>
          <Link to="/register" className="nav-link" onClick={handleLinkClick}>Đăng ký</Link>

          {userLevel > 10 && (
            <Link to="/admin/rentals" className="nav-link" onClick={handleLinkClick}>Admin</Link>
          )}
        </div>

        <div className="username-display" style={{ color: "white" }}>
          {username ? (
            <div className="logout-container">
              <span>Xin chào, {username}</span>
              <button 
                onClick={onLogout} 
                className="logout-btn"
                title="Đăng xuất"
              >
                ⏻
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={handleLinkClick} style={{ color: "white" }}>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;

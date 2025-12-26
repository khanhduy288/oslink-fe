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
    <nav className="sticky-menu">
      <div className="app-nav-inner">
        <div className="nav-left">
          <Link to="/" className="logo-link" onClick={handleLinkClick}>
            <img
              src="/images/logo.jpg"
              alt="Logo"
              className="logo"
            />
          </Link>

          {isMobile && (
            <div
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div></div>
              <div></div>
              <div></div>
            </div>
          )}

          {/* Desktop links */}
          {!isMobile && (
            <>
              <Link to="/" className="nav-link">Trang chủ</Link>
              <Link to="/list" className="nav-link">Đơn Hàng</Link>
              <Link to="/rent" className="nav-link">Thuê Tab</Link>
              <Link to="/register" className="nav-link">Đăng ký</Link>
              {userLevel > 10 && <Link to="/admin/rentals" className="nav-link">Admin</Link>}
            </>
          )}
        </div>

        <div className="username-display">
          {username ? (
            <div className="logout-container">
              <span>Xin chào, {username}</span>
              <button onClick={onLogout} className="logout-btn" title="Đăng xuất">⏻</button>
            </div>
          ) : (
            <Link to="/login" style={{ color: "white" }}>Đăng nhập</Link>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="nav-link" onClick={handleLinkClick}>Trang chủ</Link>
          <Link to="/list" className="nav-link" onClick={handleLinkClick}>Đơn Hàng</Link>
          <Link to="/rent" className="nav-link" onClick={handleLinkClick}>Thuê Tab</Link>
          <Link to="/register" className="nav-link" onClick={handleLinkClick}>Đăng ký</Link>
          {userLevel > 10 && (
            <Link to="/admin/rentals" className="nav-link" onClick={handleLinkClick}>Admin</Link>
          )}
        </div>
      )}

    </nav>
  );
}

export default Header;

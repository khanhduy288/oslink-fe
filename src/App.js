import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import RentalForm from "./RentalForm";
import RentalList from "./RentalList";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Footer from "./Footer";  
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GuidePage from "./GuidePage";
import Contact from "./Contact";
import './App.css';
import GuideImagePage from "./GuideImagePage";
import GuideVideoPage from "./GuideVideoPage";
import UserLogs from "./UserLogs"; // thêm import

// Admin pages
import Dashboard from "./admin/Dashboard";
import Rentals from "./admin/Rentals";
import Stats from "./admin/Stats";
import Users from "./admin/Users";
import Settings from "./admin/Settings";
import RoomGroups from "./admin/RoomGroups";
import AdminLogs from "./admin/AdminLogs";
import ComboRenew from "./admin/ComboRenew";
import VoucherPage from "./admin/VoucherPage";


function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [userLevel, setUserLevel] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Cập nhật trạng thái mobile khi resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedLevel = Number(localStorage.getItem("userLevel")) || 0;
    if (storedUsername) setUsername(storedUsername);
    setUserLevel(storedLevel);
  }, []);

  const handleLinkClick = () => {
    if (menuOpen) setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setUserLevel(0);
    window.location.href = "/"; 
  };

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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

              {/* Admin menu chỉ hiện nếu userLevel > 10 */}
              {userLevel > 10 && (
                <Link to="/admin/rentals" className="nav-link" onClick={handleLinkClick}>Admin</Link>
              )}
            </div>

            <div className="username-display" style={{ color: "white" }}>
              {username ? (
                <div>
                  <span>Xin chào, {username}</span>
                  <button 
                    onClick={handleLogout} 
                    className="logout-btn"
                    style={{ marginLeft: "10px", fontSize: "0.85rem" }}
                  >
                    Đăng xuất
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

        <div
          className="app-container"
          style={{
            flex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            boxSizing: "border-box",
            width: "100%",
            paddingTop: "20px"
          }}
        >
          <hr />
          <div className="page-content" style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/list" element={<RentalList />} />
              <Route path="/rent" element={<RentalForm />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/guide/images" element={<GuideImagePage />} />
              <Route path="/guide/videos" element={<GuideVideoPage />} />
              <Route path="/login" element={<Login setUsername={setUsername} />} /> 
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/user/logs" element={<UserLogs />} />

              {/* Admin routes chỉ cho userLevel > 10 */}
              {userLevel > 10 && (
                <Route path="/admin" element={<Dashboard />}>
                  <Route path="rentals" element={<Rentals />} />
                  <Route path="stats" element={<Stats />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="room-groups" element={<RoomGroups />} />   {/* ✅ mới */}
                  <Route path="combo-renew" element={<ComboRenew />} />
                  <Route path="vouchers" element={<VoucherPage />} /> {/* 👈 */}
                  <Route path="logs" element={<AdminLogs />} /> {/* ✅ Thêm trang log */}
                </Route>
              )}

              {/* Redirect nếu cố truy cập admin mà không đủ quyền */}
              <Route path="/admin/*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>

        <Footer style={{ width: "100%" }} />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;

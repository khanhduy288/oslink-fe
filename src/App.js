import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLinkClick = () => {
    if (menuOpen) setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    window.location.href = "/"; 
  };

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <nav className="sticky-menu">
          <div className="app-nav-inner">
            
            {/* --- LOGO + MENU --- */}
            <div className="nav-left">
              {/* Logo */}
            <Link to="/" className="logo-link" onClick={handleLinkClick}>
              <img src="/images/logo.jpg" alt="Logo" className="logo" style={{ height: "40px", marginRight: "15px" }} />
            </Link>

              {/* Hamburger menu */}
              <div
                className={`hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div></div>
                <div></div>
                <div></div>
              </div>

              {/* Navigation links */}
              <Link to="/" className="nav-link" onClick={handleLinkClick}>Trang chủ</Link>
              <Link to="/list" className="nav-link" onClick={handleLinkClick}>Danh sách</Link>
              <Link to="/guide" className="nav-link" onClick={handleLinkClick}>Hướng dẫn</Link>
              <Link to="/register" className="nav-link" onClick={handleLinkClick}>Đăng ký</Link>
            </div>

            {/* --- Username / Login --- */}
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

        {/* --- Nội dung chính --- */}
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

            {/* Giữ route cũ */}
            <Route path="/guide" element={<GuidePage />} />

            {/* Thêm 2 route mới */}
            <Route path="/guide/images" element={<GuideImagePage />} />
            <Route path="/guide/videos" element={<GuideVideoPage />} />

            <Route path="/login" element={<Login setUsername={setUsername} />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
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

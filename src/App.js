import React, { useState } from "react";
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
import './App.css'; // import CSS

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = () => {
    if (menuOpen) setMenuOpen(false); // click link → đóng menu
  };

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Thanh menu sticky full width */}
        <nav className="sticky-menu">
          <div className="app-nav-inner">
            <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <Link to="/" className="nav-link" onClick={handleLinkClick}>Home</Link>
            <Link to="/list" className="nav-link" onClick={handleLinkClick}>Danh sách</Link>
            <Link to="/guide" className="nav-link" onClick={handleLinkClick}>Hướng dẫn</Link>
            <Link to="/login" className="nav-link" onClick={handleLinkClick}>Đăng nhập</Link>
            <Link to="/register" className="nav-link" onClick={handleLinkClick}>Đăng ký</Link>
          </div>
        </nav>

        {/* Nội dung chính */}
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
              <Route path="/rent/:serviceId" element={<RentalForm />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </div>

        {/* Footer full width */}
        <Footer style={{ width: "100%" }} />

        {/* Toast */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;

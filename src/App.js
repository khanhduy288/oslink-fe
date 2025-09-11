import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RentalForm from "./RentalForm";
import RentalList from "./RentalList";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Footer from "./Footer";   // ✅ thêm Footer
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div
        style={{
          padding: "20px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Thanh menu */}
        <nav>
          <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
          <Link to="/list" style={{ marginRight: "10px" }}>Danh sách</Link>
          <Link to="/login" style={{ marginRight: "10px" }}>Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
        </nav>

        <hr />

        {/* Nội dung chính */}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<RentalList />} />
            <Route path="/rent/:serviceId" element={<RentalForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>

        {/* Footer luôn nằm dưới */}
        <Footer />

        {/* Thông báo toast */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RentalForm from "./RentalForm";
import RentalList from "./RentalList";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Footer from "./Footer";  
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GuidePage from "./GuidePage";  // import mới
function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "20px",
            flex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          {/* Thanh menu */}
          <nav style={{ marginBottom: "10px" }}>
            <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
            <Link to="/list" style={{ marginRight: "10px" }}>Danh sách</Link>
            <Link to="/guide">Hướng dẫn</Link> 
            <Link to="/login" style={{ marginRight: "10px" }}>Đăng nhập</Link>
            <Link to="/register" style={{ marginRight: "10px" }}>Đăng ký</Link>

          </nav>


          <hr />

          {/* Routes */}
          <div style={{ flex: 1 }}>
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

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import UserLogs from "./UserLogs";

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

import Header from "./Header";

function App() {
  const [username, setUsername] = useState(null);
  const [userLevel, setUserLevel] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedLevel = Number(localStorage.getItem("userLevel")) || 0;
    if (storedUsername) setUsername(storedUsername);
    setUserLevel(storedLevel);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setUserLevel(0);
    window.location.href = "/";
  };

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header 
          username={username} 
          userLevel={userLevel} 
          onLogout={handleLogout} 
        />

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

              {userLevel > 10 && (
                <Route path="/admin" element={<Dashboard />}>
                  <Route path="rentals" element={<Rentals />} />
                  <Route path="stats" element={<Stats />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="room-groups" element={<RoomGroups />} />
                  <Route path="combo-renew" element={<ComboRenew />} />
                  <Route path="vouchers" element={<VoucherPage />} />
                  <Route path="logs" element={<AdminLogs />} />
                </Route>
              )}

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

// Dashboard.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`admin-dashboard ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="rentals">Quản lý Rentals</Link>
          <Link to="stats">Thống kê</Link>
          <Link to="users">Quản lý Users</Link>
          <Link to="settings">Cấu hình Tool</Link>
          <Link to="room-groups">Danh sách Group</Link>  {/* ✅ Thêm */}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Dashboard</h1>
        </header>
        <section className="page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

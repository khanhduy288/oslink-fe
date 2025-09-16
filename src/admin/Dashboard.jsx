import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="rentals">Quản lý Rentals</Link>
          <Link to="stats">Thống kê</Link>
          <Link to="users">Quản lý Users</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Stats.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Stats() {
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const API_BASE = "https://api.tabtreo.com";

  // 📦 Lấy dữ liệu doanh thu
  useEffect(() => {
    fetchRevenue();
  }, [token]);

  const fetchRevenue = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/revenue/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenueHistory(res.data);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Xóa doanh thu theo ID
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Bạn có chắc muốn xoá giao dịch #${id}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/revenues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenueHistory((prev) => prev.filter((r) => r.id !== id));
      alert(`🗑️ Đã xoá giao dịch #${id}`);
    } catch (err) {
      console.error("Error deleting revenue:", err);
      alert("❌ Lỗi khi xóa giao dịch.");
    }
  };

  // 📅 Gom doanh thu theo tháng
  const revenueByMonth = revenueHistory.reduce((acc, item) => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + item.amount;
    return acc;
  }, {});

  const sortedMonths = Object.keys(revenueByMonth).sort();

  // 📈 Tính phần trăm tăng trưởng
  const revenueChanges = sortedMonths.map((month, index) => {
    const revenue = revenueByMonth[month];
    if (index === 0) return { month, revenue, change: null };
    const prev = revenueByMonth[sortedMonths[index - 1]];
    const change = ((revenue - prev) / prev) * 100;
    return { month, revenue, change };
  });

  const totalRevenue = revenueHistory.reduce((sum, r) => sum + r.amount, 0);

  // 📤 Xuất Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(
      revenueHistory.map((r) => ({
        ID: r.id,
        "Người dùng": r.username || "N/A",
        "Mã giao dịch": r.transactionId || "N/A",
        "Số tiền (VND)": r.amount,
        "Ngày tạo": new Date(r.createdAt).toLocaleString("vi-VN"),
      }))
    );
    XLSX.utils.book_append_sheet(wb, sheet, "Lịch sử doanh thu");
    XLSX.writeFile(wb, `DoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const chartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Doanh thu theo tháng (VNĐ)",
        data: sortedMonths.map((m) => revenueByMonth[m]),
        backgroundColor: "rgba(54,162,235,0.6)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw.toLocaleString("vi-VN")}₫`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${(value / 1000).toLocaleString("vi-VN")}K`,
        },
      },
    },
  };

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
    <div className="stats-container">
      <h2 className="stats-header">📊 Thống kê Doanh thu Hệ thống</h2>

      <p>
        Tổng doanh thu:{" "}
        <strong style={{ color: "green" }}>
          {totalRevenue.toLocaleString("vi-VN")}₫
        </strong>
      </p>

      <button onClick={exportExcel} className="export-btn">
        📥 Xuất Excel
      </button>

      <div className="chart-box">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="growth-box">
        <h3>📈 Tăng trưởng theo tháng</h3>
        <ul>
          {revenueChanges.map(({ month, revenue, change }) => (
            <li key={month}>
              <strong>{month}:</strong> {revenue.toLocaleString("vi-VN")}₫{" "}
              {change !== null && (
                <span
                  style={{
                    color: change >= 0 ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="table-box">
        <h3>📜 Lịch sử giao dịch</h3>
        <div className="table-wrapper">
          <table className="stats-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Loại</th>
                <th>Số tiền (VNĐ)</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {revenueHistory.slice(0, 120).map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.rentalId || "N/A"}</td>
                  <td>{r.type}</td>
                  <td>{r.amount.toLocaleString("vi-VN")}₫</td>
                  <td>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="delete-btn"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {revenueHistory.length > 120 && (
          <p className="table-note">Hiển thị 120 giao dịch gần nhất...</p>
        )}
      </div>
    </div>
  );
}

export default Stats;

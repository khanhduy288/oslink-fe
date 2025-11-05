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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RevenueHistory() {
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const API_BASE = "https://api.tabtreo.com";

  // Gọi API doanh thu
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

  // Xóa doanh thu theo ID
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

  // Gom doanh thu theo tháng
  const revenueByMonth = revenueHistory.reduce((acc, item) => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + item.amount;
    return acc;
  }, {});

  const sortedMonths = Object.keys(revenueByMonth).sort();

  // Tính % thay đổi doanh thu
  const revenueChanges = sortedMonths.map((month, index) => {
    const revenue = revenueByMonth[month];
    if (index === 0) return { month, revenue, change: null };
    const prev = revenueByMonth[sortedMonths[index - 1]];
    const change = ((revenue - prev) / prev) * 100;
    return { month, revenue, change };
  });

  // Tổng doanh thu toàn bộ
  const totalRevenue = revenueHistory.reduce((sum, r) => sum + r.amount, 0);

  // Xuất Excel
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
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#1E90FF", marginBottom: "10px" }}>
        📊 Thống kê Doanh thu Hệ thống
      </h2>
      <p style={{ fontSize: "16px", color: "#555" }}>
        Tổng doanh thu:{" "}
        <strong style={{ color: "green" }}>
          {totalRevenue.toLocaleString("vi-VN")}₫
        </strong>
      </p>

      <button
        onClick={exportExcel}
        style={{
          background: "#1E90FF",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "8px 14px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        📥 Xuất Excel
      </button>

      {/* Biểu đồ */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* So sánh tăng trưởng */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>📈 Tăng trưởng theo tháng</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {revenueChanges.map(({ month, revenue, change }) => (
            <li key={month} style={{ marginBottom: "6px" }}>
              <strong>{month}:</strong>{" "}
              {revenue.toLocaleString("vi-VN")}₫{" "}
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

      {/* Bảng lịch sử chi tiết */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3>📜 Lịch sử giao dịch</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead style={{ background: "#1E90FF", color: "white" }}>
            <tr>
              <th style={{ padding: "10px" }}>ID</th>
              <th style={{ padding: "10px" }}>Mã đơn</th>
              <th style={{ padding: "10px" }}>Type</th>
              <th style={{ padding: "10px" }}>Số tiền (VNĐ)</th>
              <th style={{ padding: "10px" }}>Ngày tạo</th>
              <th style={{ padding: "10px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {revenueHistory.slice(0, 20).map((r) => (
              <tr
                key={r.id}
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <td>{r.id}</td>
                <td>{r.rentalId || "N/A"}</td>
                <td>{r.type}</td>
                <td>{r.amount.toLocaleString("vi-VN")}₫</td>
                <td>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {revenueHistory.length > 120 && (
          <p style={{ marginTop: "8px", color: "#888" }}>
            Hiển thị 120 giao dịch gần nhất...
          </p>
        )}
      </div>
    </div>
  );
}

export default RevenueHistory;

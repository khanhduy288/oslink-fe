import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Stats() {
  const [rentals, setRentals] = useState([]);
  const token = localStorage.getItem("token");
  const API_BASE = "https://api.tabtreo.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userLevel = parseInt(localStorage.getItem("userLevel") || "1", 10);
        const endpoint = userLevel >= 10 ? "/admin/rentals" : "/rentals";

        const res = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRentals(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  // Tính doanh thu dựa trên tabs
  const calcRevenue = (tabs) => {
    if (tabs >= 10) return 1100;
    if (tabs >= 5) return 600;
    if (tabs >= 3) return 400;
    return tabs * 150;
  };

  // Doanh thu theo tháng
  const revenueByMonth = rentals.reduce((acc, r) => {
    const date = new Date(r.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + calcRevenue(r.tabs);
    return acc;
  }, {});

  const sortedMonths = Object.keys(revenueByMonth).sort();

  // Thống kê top user theo số lượng rental
  const rentalCountByUser = rentals.reduce((acc, r) => {
    acc[r.username] = (acc[r.username] || 0) + 1;
    return acc;
  }, {});

  // Chuyển sang mảng và sắp xếp giảm dần
  const topUsers = Object.entries(rentalCountByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 user

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Doanh thu theo tháng (K)",
        data: sortedMonths.map(m => revenueByMonth[m]),
        backgroundColor: "rgba(30,144,255,0.6)",
        borderRadius: 6
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: true },
      tooltip: { 
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw},000₫`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `${value}K` }
      }
    }
  };

  return (
    <div>
      <h2>Thống kê Doanh thu</h2>
      <Bar data={data} options={options} />

      {/* Doanh thu từng tháng dưới biểu đồ */}
      <div style={{ marginTop: '20px' }}>
        {sortedMonths.map((month) => (
          <div key={month} style={{ marginBottom: '5px' }}>
            <strong>{month}:</strong> {revenueByMonth[month]},000₫
          </div>
        ))}
      </div>

      {/* Top users theo số rental */}
      <div style={{ marginTop: '30px' }}>
        <h3>Top 5 Users có nhiều rental nhất</h3>
        <ol>
          {topUsers.map(([username, count]) => (
            <li key={username}>
              {username}: {count} rental{count > 1 ? 's' : ''}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default Stats;

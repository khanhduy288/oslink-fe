import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

  const calcRevenue = (tabs) => {
    const comboPrices = [
      { tabs: 10, price: 1100 },
      { tabs: 5, price: 600 },
      { tabs: 3, price: 400 },
    ];
    const basePrice = 150;

    let remainingTabs = tabs;
    let total = 0;

    for (let combo of comboPrices) {
      const count = Math.floor(remainingTabs / combo.tabs);
      if (count > 0) {
        total += count * combo.price;
        remainingTabs -= count * combo.tabs;
      }
    }

    total += remainingTabs * basePrice;
    return total;
  };

  const rentalsGrouped = Object.values(
    rentals.reduce((acc, r) => {
      const key = `${r.username}-${r.createdAt}`;
      if (!acc[key]) acc[key] = { ...r, tabs: 0 };
      acc[key].tabs += r.tabs;
      return acc;
    }, {})
  );

  const revenueByMonth = rentalsGrouped.reduce((acc, r) => {
    const date = new Date(r.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + calcRevenue(r.tabs);
    return acc;
  }, {});

  const sortedMonths = Object.keys(revenueByMonth).sort();

  const rentalCountByUser = rentalsGrouped.reduce((acc, r) => {
    acc[r.username] = (acc[r.username] || 0) + 1;
    return acc;
  }, {});

  const topUsers = Object.entries(rentalCountByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

// Hàm export Excel
const exportExcel = () => {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Doanh thu theo tháng ---
  const revenueByMonth = rentalsGrouped.reduce((acc, r) => {
    const date = new Date(r.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + calcRevenue(r.tabs);
    return acc;
  }, {});

  const sheetMonth = XLSX.utils.json_to_sheet(
    Object.entries(revenueByMonth).map(([month, revenue]) => ({
      Tháng: month,
      "Doanh thu (K)": revenue
    }))
  );
  XLSX.utils.book_append_sheet(wb, sheetMonth, "Doanh thu theo tháng");

  // --- Sheet 2: Doanh thu theo ngày ---
  const revenueByDay = rentalsGrouped.reduce((acc, r) => {
    const date = new Date(r.createdAt);
    const dayKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    acc[dayKey] = (acc[dayKey] || 0) + calcRevenue(r.tabs);
    return acc;
  }, {});

  const sheetDay = XLSX.utils.json_to_sheet(
    Object.entries(revenueByDay)
      .sort(([a], [b]) => new Date(a) - new Date(b)) // sắp xếp ngày tăng dần
      .map(([day, revenue]) => ({
        Ngày: day,
        "Doanh thu (K)": revenue
      }))
  );
  XLSX.utils.book_append_sheet(wb, sheetDay, "Doanh thu theo ngày");

  // Lưu file
  XLSX.writeFile(wb, `Stats_${new Date().toISOString().slice(0,10)}.xlsx`);
};

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
      <button onClick={exportExcel} style={{ marginBottom: '15px', padding: '6px 12px' }}>
        📥 Xuất Excel
      </button>
      <Bar data={data} options={options} />

      <div style={{ marginTop: '20px' }}>
        {sortedMonths.map((month) => (
          <div key={month} style={{ marginBottom: '5px' }}>
            <strong>{month}:</strong> {revenueByMonth[month]},000₫
          </div>
        ))}
      </div>

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

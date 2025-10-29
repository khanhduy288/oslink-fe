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

  // Tính doanh thu theo combo
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

  // Gộp rentals theo username + createdAt
  const rentalsGrouped = Object.values(
    rentals.reduce((acc, r) => {
      const key = `${r.username}-${r.createdAt}`;
      if (!acc[key]) acc[key] = { ...r, tabs: 0 };
      acc[key].tabs += r.tabs;
      return acc;
    }, {})
  );

  // Doanh thu theo tháng
  const revenueByMonth = rentalsGrouped.reduce((acc, r) => {
    const date = new Date(r.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,"0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + calcRevenue(r.tabs);
    return acc;
  }, {});

  const sortedMonths = Object.keys(revenueByMonth).sort();

  // Tính % tăng/giảm doanh thu so với tháng trước
  const revenueChanges = sortedMonths.map((month, index) => {
    if(index === 0) return { month, revenue: revenueByMonth[month], change: null };
    const prev = revenueByMonth[sortedMonths[index - 1]];
    const current = revenueByMonth[month];
    const change = ((current - prev) / prev) * 100;
    return { month, revenue: current, change };
  });

  // Top 5 users theo số rental
  const rentalCountByUser = rentalsGrouped.reduce((acc, r) => {
    acc[r.username] = (acc[r.username] || 0) + 1;
    return acc;
  }, {});

  const topUsers = Object.entries(rentalCountByUser)
    .sort((a,b) => b[1] - a[1])
    .slice(0,5);

  // Export Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const sheetMonth = XLSX.utils.json_to_sheet(
      Object.entries(revenueByMonth).map(([month, revenue]) => ({
        Tháng: month,
        "Doanh thu (K)": revenue
      }))
    );
    XLSX.utils.book_append_sheet(wb, sheetMonth, "Doanh thu theo tháng");

    const revenueByDay = rentalsGrouped.reduce((acc, r) => {
      const date = new Date(r.createdAt);
      const dayKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,"0")}-${date.getDate().toString().padStart(2,"0")}`;
      acc[dayKey] = (acc[dayKey] || 0) + calcRevenue(r.tabs);
      return acc;
    }, {});

    const sheetDay = XLSX.utils.json_to_sheet(
      Object.entries(revenueByDay)
        .sort(([a],[b]) => new Date(a)-new Date(b))
        .map(([day, revenue]) => ({
          Ngày: day,
          "Doanh thu (K)": revenue
        }))
    );
    XLSX.utils.book_append_sheet(wb, sheetDay, "Doanh thu theo ngày");

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
      }
    ]
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
      <button onClick={exportExcel} style={{ marginBottom:'15px', padding:'6px 12px' }}>
        📥 Xuất Excel
      </button>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* Biểu đồ */}
        <div style={{ flex: 2 }}>
          <Bar data={data} options={options} />
        </div>

        {/* Doanh số % thay đổi */}
        <div style={{ flex: 1 }}>
          <h3>Doanh số so với tháng trước</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {revenueChanges.map(({ month, revenue, change }) => (
              <li key={month} style={{ marginBottom:"8px" }}>
                <strong>{month}:</strong> {revenue},000₫{" "}
                {change !== null && (
                  <span style={{
                    color: change >=0 ? "green":"red",
                    fontWeight:"bold"
                  }}>
                    {change>=0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop:'30px' }}>
        <h3>Top 5 Users có nhiều rental nhất</h3>
        <ol>
          {topUsers.map(([username,count]) => (
            <li key={username}>
              {username}: {count} rental{count>1?'s':''}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default Stats;

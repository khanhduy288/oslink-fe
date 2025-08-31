// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

const services = [
  { id: 1, name: "LDPlay VIP", description: "Cấu hình cao" },
  { id: 2, name: "LDPlay Base", description: "Tiết kiệm, tiện lợi" }
];

function Home() {
  const navigate = useNavigate();

  const handleDetail = (serviceId) => {
    navigate(`/rent/${serviceId}`);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto" }}>
      <h2>Danh sách dịch vụ</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {services.map((s) => (
          <li
            key={s.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={() => handleDetail(s.id)}
          >
            <h3>{s.name}</h3>
            <p>{s.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;

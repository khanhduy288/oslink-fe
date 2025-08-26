// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RentalForm from "./RentalForm";
import RentalList from "./RentalList";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <nav>
          <Link to="/" style={{ marginRight: "10px" }}>Thuê phòng</Link>
          <Link to="/list">Danh sách</Link>
        </nav>

        <hr />

        <Routes>
          <Route path="/" element={<RentalForm />} />
          <Route path="/list" element={<RentalList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

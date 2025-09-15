import React from "react";

const Contact = () => {
  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "0 15px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Hỗ trợ nhanh</h2>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "20px", marginBottom: "15px" }}>
        <h3>Zalo</h3>
        <p>Số: <strong>09.72.73.4444</strong></p>
        <a href="https://zalo.me/0972734444" target="_blank" rel="noreferrer">
          Nhấn để chat Zalo
        </a>
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "20px" }}>
        <h3>Facebook Group</h3>
        <p>Tham gia group để nhận hỗ trợ nhanh</p>
        <a href="https://www.facebook.com/groups/3111954445517472" target="_blank" rel="noreferrer">
          Mở group Facebook
        </a>
      </div>
    </div>
  );
};

export default Contact;

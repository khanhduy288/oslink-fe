import React from "react";

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        © {new Date().getFullYear()} Oslink System. All rights reserved.
      </p>
      <div style={styles.links}>
        <a
          href="https://itviet.vn/developers/68a847d2f2b6db0a9526471e"
          target="_blank"
          rel="noreferrer"
        >
          By
        </a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "40px",
    padding: "30px 20px",           // tăng padding dọc để footer cao hơn
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    borderTop: "1px solid #ddd",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.05)", // thêm shadow nhẹ phía trên
  },
  text: {
    margin: "10px 0",               // tăng margin để text không dính sát
    color: "#555",
    fontSize: "15px",
  },
  links: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",                    // tăng khoảng cách giữa các link
    marginTop: "10px",              // tăng khoảng cách so với text
    flexWrap: "wrap",               // responsive: nếu màn hình nhỏ, link sẽ xuống dòng
  },
};

export default Footer;

import React from "react";

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        © {new Date().getFullYear()} Oslink System. All rights reserved.
      </p>
      <div style={styles.links}>
        <a href="https://github.com/khanhduy288" target="_blank" rel="noreferrer">
          GitHub
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
    padding: "15px",
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    borderTop: "1px solid #ddd",
  },
  text: {
    margin: "5px 0",
    color: "#555",
  },
  links: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "5px",
  },
};

export default Footer;

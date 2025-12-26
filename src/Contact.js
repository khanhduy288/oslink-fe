import React from "react";

const contacts = [
  { number: "0972 734 444", link: "https://zalo.me/0972734444" },
  { number: "0866 015 496", link: "https://zalo.me/0866015496" },
];

const Contact = () => {
  return (
    <div style={{
      maxWidth: "500px",
      margin: "20px auto",
      padding: "0 15px",
      color: "#697cd3ff",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "25px", fontSize: "22px" }}>Hỗ trợ nhanh</h2>

      {contacts.map((contact, index) => (
        <div key={index} style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "15px 20px",
          marginBottom: "15px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)"
        }}>
          <img 
            src="/images/zalo-logo.png" 
            alt="Zalo" 
            style={{ width: "50px", height: "50px", marginRight: "15px" }} 
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{contact.number}</p>
            <a 
              href={contact.link} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "5px",
                padding: "6px 12px",
                background: "linear-gradient(90deg, #4a90e2, #50e3c2)",
                borderRadius: "8px",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "500",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
              }}
            >
              Chat với Zalo
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Contact;

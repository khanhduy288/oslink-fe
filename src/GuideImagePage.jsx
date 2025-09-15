import React, { useState } from "react";

const steps = [
  { id: 1, title: "Bước 1", description: "Mô tả bước 1", img: "/images/b1.jpg" },
  { id: 2, title: "Bước 2", description: "Mô tả bước 2", img: "/images/b2.jpg" },
  { id: 3, title: "Bước 3", description: "Mô tả bước 3", img: "/images/b3.jpg" },
  { id: 4, title: "Bước 4", description: "Mô tả bước 4", img: "/images/b4.jpg" },
  { id: 5, title: "Bước 5", description: "Mô tả bước 5", img: "/images/b5.jpg" },
  { id: 6, title: "Bước 6", description: "Mô tả bước 6", img: "/images/b6.jpg" },
  { id: 7, title: "Bước 7", description: "Mô tả bước 7", img: "/images/b7.jpg" },
  { id: 8, title: "Bước 8", description: "Mô tả bước 8", img: "/images/b8.jpg" },
  { id: 9, title: "Bước 9", description: "Mô tả bước 9", img: "/images/b9.jpg" },
  { id: 10, title: "Bước 10", description: "Mô tả bước 10", img: "/images/b10.jpg" },
];

const GuideImagePage = () => {
  const [zoomImg, setZoomImg] = useState(null);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Hướng dẫn bằng ảnh</h1>

      {/* Grid bước 1 → 7 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "50px" }}>
        {steps.slice(0, 7).map(step => (
          <div key={step.id} style={{ position: "relative", cursor: "pointer" }}>
            {!zoomImg && (
              <h3 style={{ position: "absolute", top: "10px", left: "10px", color: "white", backgroundColor: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: "5px", zIndex: 2 }}>
                {step.title}
              </h3>
            )}
            <img
              src={step.img}
              alt={step.title}
              onClick={() => setZoomImg(step.img)}
              style={{ width: "100%", height: "auto", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "zoom-in" }}
            />
          </div>
        ))}
      </div>

      {/* Grid bước 8 → 10 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "50px" }}>
        {steps.slice(7).map(step => (
          <div key={step.id} style={{ cursor: "pointer" }}>
            <img
              src={step.img}
              alt={step.title}
              onClick={() => setZoomImg(step.img)}
              style={{ width: "100%", height: "auto", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "zoom-in" }}
            />
            {!zoomImg && (
              <>
                <h3 style={{ marginTop: "10px", textAlign: "center" }}>{step.title}</h3>
                <p style={{ textAlign: "center" }}>{step.description}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out"
          }}
        >
          <img
            src={zoomImg}
            alt="Zoom"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}
    </div>
  );
};

export default GuideImagePage;

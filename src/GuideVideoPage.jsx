import React, { useState } from "react";

const guideData = [
  {
    id: "rent-app",
    title: "1. HƯỚNG DẪN THUÊ + TẢI APP",
    type: "video",
    videos: [
      {
        id: 1,
        title: "Thuê Tab + Cài App",
        src: "https://www.youtube.com/embed/-96A3waLKtY", // ✅ URL YouTube
      },
    ],
  },
  {
    id: "game",
    title: "2. HƯỚNG DẪN TẢI GAME + CẬP NHẬT GAME",
    type: "video",
    videos: [
      {
        id: 2,
        title: "Tải Game",
        src: "https://www.youtube.com/embed/B7F1PGMiY0s", // ✅ URL YouTube
      },
    ],
  },
  {
    id: "features",
    title: "3. CHỨC NĂNG CỦA TAB",
    type: "images",
    images: [
      { id: 8, title: "Bước 8", src: "/images/b8.jpg" },
      { id: 9, title: "Bước 9", src: "/images/b9.jpg" },
      { id: 10, title: "Bước 10", src: "/images/b10.jpg" },
    ],
  },
];

const GuideVideoPage = () => {
  const [zoomImg, setZoomImg] = useState(null);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        Video & Hình Ảnh Hướng Dẫn
      </h1>

      {guideData.map((section) => (
        <div key={section.id} style={{ marginBottom: "50px" }}>
          <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>
            {section.title}
          </h2>

          {section.type === "video" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {section.videos.map((video) => (
                <div key={video.id}>
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%", // 16:9 aspect ratio
                      height: 0,
                      overflow: "hidden",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <iframe
                      src={video.src}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                  <h3 style={{ marginTop: "10px", textAlign: "center" }}>
                    {video.title}
                  </h3>
                </div>
              ))}
            </div>
          )}

          {section.type === "images" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {section.images.map((img) => (
                <div key={img.id} style={{ cursor: "pointer" }}>
                  <img
                    src={img.src}
                    alt={img.title}
                    onClick={() => setZoomImg(img.src)}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      cursor: "zoom-in",
                    }}
                  />
                  <h3 style={{ marginTop: "10px", textAlign: "center" }}>
                    {img.title}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Lightbox zoom ảnh */}
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
            cursor: "zoom-out",
          }}
        >
          <img
            src={zoomImg}
            alt="Zoom"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GuideVideoPage;

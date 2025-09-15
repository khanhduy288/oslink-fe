import React from "react";

const videos = [
  { id: 1, title: "Video 1", src: "/images/video1.mp4" },
  { id: 2, title: "Video 2", src: "/images/video2.mp4" },
];

const GuideVideoPage = () => {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Video hướng dẫn</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {videos.map(video => (
          <div key={video.id}>
            <video
              src={video.src}
              controls
              style={{ width: "100%", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
            />
            <h3 style={{ marginTop: "10px", textAlign: "center" }}>{video.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideVideoPage;

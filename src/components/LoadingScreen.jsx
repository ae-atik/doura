import React, { useState, useEffect } from "react";

const LoadingScreen = ({ progress }) => {
  const messages = [
    "Loading...",
    "Hacking the mainframe...",
    "Downloading speed hacks...",
    "Bribing game devs...",
    "Charging up the fun meter...",
    "Rendering infinite polygons...",
    "Feeding the hamsters..."
  ];

  const [loadingText, setLoadingText] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(messages[Math.floor(Math.random() * messages.length)]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed",
      width: "100vw",
      height: "100dvh",
      top: "0",
      left: "0",
      background: "linear-gradient(120deg, #ffecd2, #fcb69f)", // Soft peach-orange
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#333",
      fontFamily: "'Poppins', sans-serif",
      textAlign: "center",
      padding: "20px",
    }}>
      {/* Circular Loading Indicator */}
      <div style={{
        position: "relative",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "conic-gradient(#333 " + progress + "%, #ddd " + progress + "%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
      }}>
        <span style={{ fontSize: "1rem", fontWeight: "bold" }}>{Math.round(progress)}%</span>
      </div>

      {/* Loading Text */}
      <h2 style={{
        fontSize: "1.3rem",
        fontWeight: "500",
        maxWidth: "90%",
        marginBottom: "10px"
      }}>
        {loadingText}
      </h2>

      {/* Progress Indicator */}
      <p style={{
        fontSize: "1rem",
        color: "#555"
      }}>
        Almost there...
      </p>
    </div>
  );
};

export default LoadingScreen;

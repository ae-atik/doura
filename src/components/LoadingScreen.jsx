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
      background: "linear-gradient(120deg, #001d3d, #003566, #001d3d)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      overflow: "hidden",
      animation: "starsBackground 10s linear infinite"
    }}>
      <h1 style={{
        fontSize: "5vw",
        color: "#ffffff",
        textShadow: "0 0 10px #ffcc00, 0 0 20px #ff9900",
        animation: "pulse 1s infinite alternate ease-in-out"
      }}>
        {loadingText} {isNaN(progress) ? "0" : Math.round(progress)}%
      </h1>

      <div style={{
        width: `${isNaN(progress) ? "0" : progress}%`,
        height: "100px",
        background: "rgba(255, 204, 0, 0.8)",
        borderRadius: "50%",
        filter: "blur(10px)",
        animation: "expandingPulse 1s infinite ease-in-out"
      }}></div>

      <style>
        {`
          @keyframes pulse {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }
          @keyframes expandingPulse {
            0% { transform: scale(0.7); opacity: 0.6; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.7); opacity: 0.6; }
          }
          @keyframes starsBackground {
            0% { background-position: 0 0; }
            100% { background-position: 1000px 1000px; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;

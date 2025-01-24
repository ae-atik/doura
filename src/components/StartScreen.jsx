import React from "react";

const StartScreen = ({ onStart }) => {
  return (
    <div style={{
      position: "fixed",
      width: "100vw",
      height: "100dvh",
      top: "0",
      left: "0",
      background: "radial-gradient(circle, #6a0572, #1a1a40, #000)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      overflow: "hidden",
      animation: "colorShift 10s infinite alternate"
    }}>
      <h1 style={{
        fontSize: "8vw",
        whiteSpace: "nowrap",
        marginBottom: "20px",
        color: "#000000",
        textShadow: "2px 2px 10px rgba(255, 0, 85, 0.8)",
        animation: "glitch 0.8s infinite alternate ease-in-out"
      }}>
        DOURAAAAAA
      </h1>

      <button onClick={onStart} style={{
        padding: "15px 30px",
        fontSize: "5vw",
        background: "#28a745",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "10px",
        width: "80%",
        maxWidth: "300px",
        fontWeight: "bold",
        textTransform: "uppercase",
        boxShadow: "0 0 20px #28a745",
        animation: "bounce 1s infinite ease-in-out, neonFlicker 1.5s infinite alternate ease-in-out"
      }}>
        Start Game
      </button>

      <style>
        {`
          @keyframes glitch {
            0% { transform: skewX(0deg); }
            25% { transform: skewX(-10deg); }
            50% { transform: skewX(10deg); }
            75% { transform: skewX(-10deg); }
            100% { transform: skewX(0deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes neonFlicker {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
          }

          @keyframes colorShift {
            0% { background: radial-gradient(circle, #ff0077, #1a1a40, #000); }
            50% { background: radial-gradient(circle, #ffcc00, #1a1a40, #000); }
            100% { background: radial-gradient(circle, #00ccff, #1a1a40, #000); }
          }
        `}
      </style>
    </div>
  );
};

export default StartScreen;

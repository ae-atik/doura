import React from "react";

const StartScreen = ({ onStart }) => {
  return (
    <div style={{
      position: "fixed",
      width: "100vw",
      height: "100dvh",
      top: "0",
      left: "0",
      background: "linear-gradient(135deg, #232526, #414345)", // Dark elegant gradient
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#f0f0f0",
      fontFamily: "'Poppins', sans-serif",
      textAlign: "center",
      padding: "20px",
    }}>
      {/* Game Title */}
      <h1 style={{
        fontSize: "9vw", // Responsive font size
        fontWeight: "700",
        marginBottom: "30px",
        letterSpacing: "1px",
        maxWidth: "90%",
      }}>
        DOURAAAAAA
      </h1>

      {/* Start Button */}
      <button onClick={onStart} style={{
        padding: "15px 30px",
        fontSize: "1.4rem",
        background: "#f0f0f0",
        color: "#232526",
        border: "none",
        cursor: "pointer",
        borderRadius: "10px",
        transition: "background 0.3s ease, transform 0.2s ease",
        fontWeight: "bold",
        letterSpacing: "0.5px",
        width: "80%",
        maxWidth: "280px",
        textAlign: "center"
      }}
      onMouseOver={(e) => e.target.style.background = "#d6d6d6"}
      onMouseOut={(e) => e.target.style.background = "#f0f0f0"}
      onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
      onMouseUp={(e) => e.target.style.transform = "scale(1)"}
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;

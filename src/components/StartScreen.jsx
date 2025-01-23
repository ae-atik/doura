import React from "react";

const StartScreen = ({ onStart }) => {
  return (
    <div style={{
      position: "fixed",
      width: "100vw",
      height: "100dvh", // Fix for mobile browser UI issues
      top: "0",
      left: "0",
      background: "black",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      textAlign: "center",
      overflow: "hidden"
    }}>
      <h1 style={{
        marginBottom: "20px",
        fontSize: "8vw",
        whiteSpace: "nowrap"
      }}>DOURAAAAAA</h1>
      <button onClick={onStart} style={{
        padding: "12px 20px",
        fontSize: "5vw",
        background: "#28a745",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "8px",
        width: "80%",
        maxWidth: "300px"
      }}>
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;

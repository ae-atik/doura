import React from "react";

const LoadingScreen = ({ progress }) => {
  return (
    <div style={{
      position: "fixed",
      width: "100vw",
      height: "100dvh", // Ensures full screen height
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
        fontSize: "6vw"
      }}>Loading... {isNaN(progress) ? "0" : Math.round(progress)}%</h1>
      <div style={{
        width: "80%",
        maxWidth: "400px",
        height: "12px",
        background: "white",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "20px"
      }}>
        <div style={{
          width: `${isNaN(progress) ? "0" : progress}%`,
          height: "100%",
          background: "#28a745",
          transition: "width 0.3s ease-in-out"
        }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;

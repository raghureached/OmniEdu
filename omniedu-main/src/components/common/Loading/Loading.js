// src/components/LoadingScreen.jsx
import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <h2>Loading...</h2>
        <p>Please wait while we fetch your data</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
  
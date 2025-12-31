// src/components/LoadingScreen.jsx
import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({text}) => {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <h2>{text}</h2>
        {/* <p>Please wait while we fetch your data</p> */}
      </div>
    </div>
  );
};

export default LoadingScreen;
  
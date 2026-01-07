// src/components/LoadingScreen.jsx
import React from "react";
import "./LoadingScreen.css";
import { FourSquare, Slab } from "react-loading-indicators";

const LoadingScreen = ({text}) => {
  return (
    <div className="loading-overlay">
      {/* <div className="loading-box"> */}
        <FourSquare color="#1C88C7" size="medium" textColor="#011F5B" />

        <h2>{text}</h2>
  
    
    </div>
    
  );
};

export default LoadingScreen;
  
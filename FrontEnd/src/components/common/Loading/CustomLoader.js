import React from "react";
import "./CustomLoader.css"; // Import CSS below

const CustomLoader = ({ text = "Loading..." }) => (
  <div className="custom-loader-container">
    <div className="custom-loader-spinner" />
    <div className="custom-loader-text">{text}</div>
  </div>
);

export default CustomLoader;

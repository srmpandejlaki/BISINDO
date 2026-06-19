import React from "react";
import AddRatioSection from "../components/AddRatio";
import ParameterTest from "../components/ParameterTest";

function SplitRatio() {
  return (
    <div className="content split-ratio-page">
      <h1>Split Ratio</h1>
      <AddRatioSection />
      <div className="parameter-section">
        <h3>Pengujian Ratio Data Split</h3>
        <ParameterTest />
      </div>
    </div>
  );
}

export default SplitRatio;
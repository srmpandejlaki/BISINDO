import React from "react";
import AddRatioSection from "../components/AddRatio";
import ParameterTest from "../components/ParameterTest";
import ResultRatio from "../components/ResultRatio";

function SplitRatio() {
  return (
    <div className="content split-ratio-page">
      <h1>Split Ratio</h1>
      <AddRatioSection />
      <div className="parameter-section">
        <h3>Pengujian Ratio Data Split</h3>
        <ParameterTest />
      </div>
      <ResultRatio />
    </div>
  );
}

export default SplitRatio;
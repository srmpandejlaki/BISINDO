import React from "react";

function SectionInfo() {
  return (
    <div className="section-info">
      <div className="card">
        <p>Jumlah Label</p>
        <p>10</p>
      </div>
      <div className="card">
        <p>Jumlah Dataset</p>
        <p>100</p>
      </div>
      <div className="card">
        <p>Split Rasio Data Terbaik</p>
        <p>80:20</p>
      </div>
      <div className="card">
        <p>Akurasi Model</p>
        <p>95%</p>
      </div>
      <div className="card">
        <p>Model Terbaik</p>
        <p>ResNet50</p>
      </div>
    </div>
  )
}

export default SectionInfo;

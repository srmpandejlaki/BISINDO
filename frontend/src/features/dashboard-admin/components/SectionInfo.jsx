import React, { useState, useEffect } from "react";
import { get_all_label } from "../utils/dasboard_api";

function SectionInfo() {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchLabels = async () => {
      const data = await get_all_label();
      setLabels(data.data);
      console.log("Labels:", data);
    };
    fetchLabels();
  }, []);

  return (
    <div className="section-info">
      <div className="card">
        <p>Jumlah Label</p>
        <p>{labels.length}</p>
      </div>
      <div className="card">
        <p>Jumlah Data</p>
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

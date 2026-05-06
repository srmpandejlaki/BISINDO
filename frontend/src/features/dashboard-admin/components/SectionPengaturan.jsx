import React from "react";

function SectionPengaturan() {
  return (
    <div className="section-pengaturan">
      <h1>Pengaturan</h1>
      <div className="camera-setting">
        <p>Camera</p>
        <select>
          <option value="camera1">Off</option>
          <option value="camera2">On</option>
        </select>
      </div>
      <div className="model-setting">
        <p>Model</p>
        <select>
          <option value="model1">Model 1</option>
          <option value="model2">Model 2</option>
        </select>
      </div>
    </div>
  )
}

export default SectionPengaturan;
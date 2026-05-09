import React from "react";

function ParameterSetting() {
  return (
    <div className="parameter-setting">
      <h3 className="title-data-cleaning">Data Cleaning</h3>
      <div className="section-parameter">
        <div className="main-parameter">
          <div className="parameter">
            <input type="checkbox" />
            <p>Hapus Kata Blur</p>
          </div>
          <div className="parameter">
            <input type="checkbox" />
            <p>Hapus Missing Keypoints</p>
          </div>
          <div className="parameter">
            <input type="checkbox" />
            <p>Hapus Label Tidak Valid</p>
          </div> 
        </div>
        <button className="btn-start-preprocessing">Mulai Preprocessing</button>
      </div>
    </div>
  )
}

export default ParameterSetting;
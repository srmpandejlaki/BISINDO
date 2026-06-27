import React from "react";

function InfoConfiguration() {
  return (
    <div className="section info-configuration">
      <div className="pengantar">
        <h2>Konfigurasi Hand Skeleton</h2>
        <p className="desc">
          Konfigurasi berikut digunakan untuk mengkonfigurasi model Hand Skeleton. <span>Pengaturan ini tidak bisa diubah.</span>
        </p>
      </div>
      <div className="configuration">
        <p>
          <span>Minimum Detection Confidence</span>
          <span>0.5</span>
        </p>
        <p>
          <span>Minimum Tracking Confidence</span>
          <span>0.5</span>
        </p>
        <p>
          <span>Maksimal Jumlah Tangan</span>
          <span>2</span>
        </p>
        <p>
          <span>Model Complexity </span>
          <span>1</span>
        </p>
      </div>
    </div>
  );
}

export default InfoConfiguration;
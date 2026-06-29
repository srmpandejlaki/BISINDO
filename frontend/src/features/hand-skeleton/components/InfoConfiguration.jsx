import React from "react";

function InfoConfiguration({ config = {} }) {
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
          <span>{config.min_detection_confidence ?? "-"}</span>
        </p>
        <p>
          <span>Minimum Tracking Confidence</span>
          <span>{config.min_tracking_confidence ?? "-"}</span>
        </p>
        <p>
          <span>Maksimal Jumlah Tangan</span>
          <span>{config.max_num_hands ?? "-"}</span>
        </p>
        <p>
          <span>Minimum Detection Ratio</span>
          <span>{config.min_detection_ratio ?? "-"}</span>
        </p>
      </div>
    </div>
  );
}

export default InfoConfiguration;
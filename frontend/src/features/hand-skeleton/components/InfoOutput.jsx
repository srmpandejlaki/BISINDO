import React from "react";

function InfoOutput() {
  return (
    <div className="section info-output">
      <div className="pengantar">
        <h2>Output Landmark</h2>
      </div>
      <div className="configuration">
        <p>
          <span>Jumlah Landmark (Keypoints)</span>
          <span>42 (kiri & kanan)</span>
        </p>
        <p>
          <span>Koordinat</span>
          <span>x,y,z</span>
        </p>
        <p>
          <span>Feature Size</span>
          <span>126</span>
        </p>
        <p>
          <span>Sequence Length</span>
          <span>60</span>
        </p>
        <p>
          <span>Format Output</span>
          <span>NumPy (.npy)</span>
        </p>
      </div>
    </div>
  );
}

export default InfoOutput;
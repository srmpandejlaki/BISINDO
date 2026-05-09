import React from "react";

function SectionPreview() {
  return (
    <div className="section-preview">
      <h2>Preview Dataset</h2>
      <div className="preview-dataset">
        <p><span>Nama File</span><span>: example.zip</span></p>
        <p><span>Ukuran File</span><span>: 10 MB</span></p>
        <p><span>Jumlah Label</span><span>: 5</span></p>
        <p><span>Jumlah Data</span><span>: 1000</span></p>
        <p><span>Sequence Length</span><span>: 128</span></p>
        <p><span>Status</span><span>: Uploaded</span></p>
      </div>
    </div>
  );
}

export default SectionPreview;
import React from "react";

function SectionPreview({ preview }) {
  return (
    <div className="section-preview">
      <h2>Preview Dataset</h2>
      <div className="preview-dataset">
        <p>
          <span>Nama File</span>
          <span>: {preview ? preview.fileName : "-"}</span>
        </p>
        <p>
          <span>Ukuran File</span>
          <span>: {preview ? preview.fileSize : "0"} MB</span>
        </p>
        <p>
          <span>Jumlah Label</span>
          <span>: {preview ? preview.totalLabel : "0"}</span>
        </p>
        <p>
          <span>Jumlah Data</span>
          <span>: {preview ? preview.totalData : "0"}</span>
        </p>
      </div>
    </div>
  );
}

export default SectionPreview;
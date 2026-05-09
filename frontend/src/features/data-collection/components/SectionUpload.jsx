import React from "react";

function SectionUpload() {
  return (
    <div className="section-upload">
      <h2>Upload Dataset</h2>
      <p>Upload dataset Anda di sini menggunakan format Zip.</p>
      <form>
        <input type="file" accept=".zip" />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default SectionUpload;
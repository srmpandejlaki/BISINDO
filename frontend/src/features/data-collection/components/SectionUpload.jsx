import React, { useState} from "react";
import { parseZipDataset } from "../utils/zipParser";
import { create_dataset_from_zip } from "../utils/data_collection_api";

function SectionUpload({ onUploadSuccess, onPreviewGenerated}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".zip")) {
      alert("Harap pilih file berformat .zip!");
      return;
    }
    setFile(selectedFile);
    // Jalankan parser untuk preview
    try {
      const parsedInfo = await parseZipDataset(selectedFile);
      onPreviewGenerated(parsedInfo); // Kirim data preview ke parent state
    } catch (error) {
      alert("Gagal membaca struktur ZIP. Pastikan file ZIP tidak rusak.", error);
      onPreviewGenerated(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Pilih file terlebih dahulu!");
      return;
    }
    setLoading(true);
    try {
      const response = await create_dataset_from_zip(file);
      if (response && response.success) {
        alert("Dataset berhasil diunggah!");
        onUploadSuccess(); // Refresh list dataset di tabel bawah
        setFile(null);
        onPreviewGenerated(null); // Reset preview
        e.target.reset(); // Reset form
      } else {
        alert("Gagal mengunggah dataset.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengunggah.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-upload">
      <h2>Upload Dataset</h2>
      <p>Upload dataset Anda di sini menggunakan format Zip.</p>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".zip" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default SectionUpload;
import React, { useState } from "react";
import { parseZipDataset } from "../utils/zipParser";
import { create_dataset_from_zip } from "../utils/data_collection_api";

function SectionUpload({
  onUploadSuccess,
  onPreviewGenerated,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    try {
      const preview = await parseZipDataset(
        selectedFile
      );

      setFile(selectedFile);

      if (onPreviewGenerated) {
        onPreviewGenerated(preview);
      }
    } catch (error) {
      alert(
        error.message ||
        "Gagal membaca file ZIP."
      );
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
      const response =
        await create_dataset_from_zip(file);

      if (response) {
        alert("Dataset berhasil diunggah!");

        onUploadSuccess?.();
        onPreviewGenerated?.(null);

        setFile(null);

        e.target.reset();
      }
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        error.message ||
        "Terjadi kesalahan saat mengunggah."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-upload">
      <h2>Unggah Dataset</h2>
      <p>
        Unggah dataset Anda di sini menggunakan
        format ZIP.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
        />

        <button
          className="button submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Mengunggah..."
            : "Unggah"}
        </button>
      </form>
    </div>
  );
}

export default SectionUpload;
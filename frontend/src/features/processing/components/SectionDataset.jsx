import React from "react";

function SectionDataset({ models, bestRatio, loading, error, deleteModel }) {
  const handleDelete = async (idTraining, modelName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus model "${modelName}"?`)) {
      const res = await deleteModel(idTraining);
      if (res && !res.success) {
        alert(res.message);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="section-dataset">
      <h2>Section Dataset</h2>
      <div className="option-rasio">
        <label htmlFor="ratio">Ratio Terbaik: <span className="highlight-ratio">{bestRatio?.trainRatio || "Belum ditentukan"}</span></label>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="history-training">
        <p className="section-subtitle">Riwayat Training</p>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Model</th>
              <th>Tanggal Pembuatan</th>
              <th>Akurasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && models.length === 0 ? (
              <tr>
                <td colSpan="5">Memuat data model...</td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan="5">Tidak ada data model terdaftar</td>
              </tr>
            ) : (
              models.map((model, index) => (
                <tr key={model.idTraining || index}>
                  <td>{index + 1}</td>
                  <td className="model-name-cell">{model.modelName}</td>
                  <td>{formatDate(model.createdAt)}</td>
                  <td className="acc-cell">{(model.accuracy * 100).toFixed(2)}%</td>
                  <td>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(model.idTraining, model.modelName)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectionDataset;
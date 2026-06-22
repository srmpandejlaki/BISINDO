import React from "react";

function SectionDataset({ models, bestRatio }) {
  return (
    <div className="section-dataset">
      <h2>Section Dataset</h2>
      <div className="option-rasio">
        <label htmlFor="ratio">Ratio: {bestRatio?.trainRatio || "Belum ditentukan"}</label>
      </div>
      <div className="search-data">
        <input type="text" placeholder="Search data..." />
      </div>
      <div className="history-training">
        <p>Riwayat Training</p>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Model</th>
              <th>Date</th>
              <th>Akurasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 && (
              <tr>
                <td colSpan="5">Tidak ada data</td>
              </tr>
            )}
            {models.map((model, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{model.modelName}</td>
                <td>{model.createdAt}</td>
                <td>{model.accuracy}</td>
                <td>
                  <button>Detail</button>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectionDataset;
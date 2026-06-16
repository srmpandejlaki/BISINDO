import React from "react";

function ListsDataset({ datasets = [], selectedDatasetId, onSelectDataset }) {
  return (
    <div className="lists-dataset">
      <div className="pengantar">
        <h3>Daftar Dataset</h3>
        <p>Pilih dataset yang ingin dilakukan preprocessing</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Dataset</th>
            <th>Jumlah Data</th>
            <th>Status</th>
            <th>Pilih</th>
          </tr>
        </thead>
        <tbody>
          {datasets.length === 0 && (
            <tr>
              <td colSpan="5">Tidak ada data</td>
            </tr>
          )}

          {datasets.map((dataset, index) => (
            <tr
              key={dataset.idDataset}
              className={selectedDatasetId === dataset.idDataset ? "selected-row" : ""}
            >
              <td>{index + 1}</td>
              <td>{dataset.datasetName}</td>
              <td>{dataset.totalData}</td>
              <td>
                <span
                  className={`status-badge ${
                    dataset.preprocessingResultPath
                      ? "status-done"
                      : "status-pending"
                  }`}
                >
                  {dataset.preprocessingResultPath
                    ? "Sudah diproses"
                    : "Belum diproses"}
                </span>
              </td>
              <td>
                <input
                  type="radio"
                  name="dataset-select"
                  checked={selectedDatasetId === dataset.idDataset}
                  onChange={() => onSelectDataset(dataset.idDataset)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListsDataset;
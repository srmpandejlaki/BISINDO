import React from "react";

function DetailLandmark(
  // { datasets = [], selectedDatasetId, onSelectDataset }
) {
  return (
    <div className="table-dataset">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Data</th>
            <th>Sequence Length</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center">1.</td>
            <td className="padding-cell">Dataset 1</td>
            <td className="text-center">100</td>
            <td className="text-center">
              <span className="status-badge status-done">Sudah diproses</span>
            </td>
            <td className="text-center">
              <input
                type="radio"
                name="dataset-select"
                // checked={selectedDatasetId === dataset.idDataset}
                // onChange={() => onSelectDataset(dataset.idDataset)}
                // disabled={dataset.preprocessingResultPath}
              />
            </td>
          </tr>
          {/* {datasets.length === 0 && (
            <tr>
              <td colSpan="5">Tidak ada data</td>
            </tr>
          )}

          {datasets.map((dataset, index) => (
            <tr
              key={dataset.idDataset}
              className={selectedDatasetId === dataset.idDataset ? "selected-row" : ""}
            >
              <td className="text-center">{index + 1}.</td>
              <td className="padding-cell">{dataset.datasetName}</td>
              <td className="text-center">{dataset.totalData}</td>
              <td className="text-center">
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
              <td className="text-center">
                <input
                  type="radio"
                  name="dataset-select"
                  checked={selectedDatasetId === dataset.idDataset}
                  onChange={() => onSelectDataset(dataset.idDataset)}
                  disabled={dataset.preprocessingResultPath}
                />
              </td>
            </tr>
          ))} */}
        </tbody>
      </table>
    </div>
  );
}

export default DetailLandmark;
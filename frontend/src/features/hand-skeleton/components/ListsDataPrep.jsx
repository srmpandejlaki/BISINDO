import React from "react";

function ListsDataPrep(
  { datasets = [], selectedDatasetId, onSelectDataset }
) {
  
  console.log("Datasets Preprocess:", datasets);
  return (
    <div className="table-dataset">
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
            <tr className="text-center">
              <td colSpan="5">Belum ada data</td>
            </tr>
          )}

          {datasets.map((dataset, index) => {
            const isDone = dataset.totalPreprocessed > 0 && dataset.remainingLandmark === 0;
            const isEmpty = dataset.totalPreprocessed === 0;
            
            let statusText = "Belum diproses";
            if (isEmpty) {
              statusText = "Belum ada data";
            } else if (isDone) {
              statusText = "Sudah diproses";
            } else if (dataset.remainingLandmark > 0) {
              statusText = `Belum diproses (${dataset.remainingLandmark} video)`;
            }

            return (
              <tr
                key={dataset.idDataset}
                className={selectedDatasetId === dataset.idDataset ? "selected-row" : ""}
              >
                <td className="text-center">{index + 1}.</td>
                <td className="padding-cell">{dataset.datasetName}</td>
                <td className="text-center">{dataset.totalPreprocessed}</td>
                <td className="text-center">
                  <span
                    className={`status-badge ${
                      isDone ? "status-done" : "status-pending"
                    }`}
                  >
                    {statusText}
                  </span>
                </td>
                <td className="text-center">
                  <input
                    type="radio"
                    name="dataset-select"
                    checked={selectedDatasetId === dataset.idDataset}
                    onChange={() => onSelectDataset(dataset.idDataset)}
                    disabled={isEmpty}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ListsDataPrep;